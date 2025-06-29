const { Op, where, or } = require("sequelize");
const CustomerService = require("../customer/customer.service");
const ShopifyHelper = require("../helpers/shopifyHelper");
const OrderLine = require("../orderLines/orderline.model");
const Product = require("../product/product.model");
const ProductsService = require("../product/product.service");
const Shipment = require("../order/order.model");
const { sequelize } = require("../../../config/db.config");
const Vendor = require("../vendor/vendor.model");
const Customer = require("../customer/customer.model");
const Note = require("../notes/notes.model");
const User = require("../user/user.model");
const { SHIPMENT_STATUS, USER_TYPES, DELIVERY_STATUS } = require("../../../config/constants");
const moment = require("moment-timezone");
const ProductType = require("../product/productType.model");
const Attachment = require("../attachments/attachment.model");
const PREFIX = "H";
const CUSTOM_PREFIX = "CU";
const ExcelJS = require("exceljs");

class ShipmentService {
  static async getShipments({
    page = 1,
    size = 50,
    shippingCompany,
    governorate,
    shipmentStatus,
    shipmentType,
    startDate,
    endDate,
    shipmentStartDate,
    shipmentEndDate,
    orderNumber,
  }) {
    let whereClause = {
      [Op.and]: [
        {
          shippedFromInventory: true,
        },
      ],
    };
    if (orderNumber) {
      whereClause[Op.and].push({
        [Op.or]: [
          sequelize.where(sequelize.fn("lower", sequelize.col("Order.name")), {
            [Op.like]: `%${orderNumber.toLowerCase()}%`,
          }),
          sequelize.where(sequelize.fn("lower", sequelize.col("number")), {
            [Op.like]: `%${orderNumber.toLowerCase()}%`,
          }),
          sequelize.where(sequelize.fn("lower", sequelize.col("orderNumber")), {
            [Op.like]: `%${orderNumber.toLowerCase()}%`,
          }),
        ],
      });
    }
    if (shippingCompany) {
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("shippingCompany"), {
          [Op.like]: `%${shippingCompany}%`,
        })
      );
    }
    if (governorate) {
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("governorate"), {
          [Op.eq]: governorate,
        })
      );
    }

    if (shipmentStatus) {
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.shipmentStatus"), {
          [Op.eq]: shipmentStatus,
        })
      );
    }
    if (shipmentType) {
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.shipmentType"), {
          [Op.eq]: shipmentType,
        })
      );
    }
    if (startDate && endDate) {
      let startStartDate = moment
        .tz(new Date(startDate), "Africa/Cairo")
        .startOf("day")
        .utc()
        .toDate();

      let endOfEndDate = moment
        .tz(new Date(endDate), "Africa/Cairo")
        .endOf("day")
        .utc()
        .toDate();

      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.orderDate"), {
          [Op.gte]: startStartDate,
        })
      );
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.orderDate"), {
          [Op.lte]: endOfEndDate,
        })
      );
    }
    if (shipmentStartDate && shipmentEndDate) {
      let startStartDate = moment
        .tz(new Date(shipmentStartDate), "Africa/Cairo")
        .startOf("day")
        .utc()
        .toDate();

      let endOfEndDate = moment
        .tz(new Date(shipmentEndDate), "Africa/Cairo")
        .endOf("day")
        .utc()
        .toDate();

      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.shippingReceiveDate"), {
          [Op.gte]: startStartDate,
        })
      );
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.shippingReceiveDate"), {
          [Op.lte]: endOfEndDate,
        })
      );
    }

    whereClause = whereClause[Op.and].length ? whereClause : {};
    const shipments = await Shipment.findAndCountAll({
      include: [
        {
          model: OrderLine,
          required: true,
          as: "orderLines",
          include: [
            {
              model: Product,
              as: "product",
              required: true,
              include: {
                model: Vendor,
                as: "vendor",
                required: true,
              },
            },
          ],
        },
        {
          model: Customer,
          as: "customer",
          required: false,
        },
      ],
      where: whereClause,
      order: [["shippingReceiveDate", "DESC"]],
      limit: Number(size),
      offset: (page - 1) * Number(size),
      subQuery: false,
    });
    return {
      status: true,
      statusCode: 200,
      data: {
        shipments: shipments.rows,
        totalPages: Math.ceil(shipments.count / Number(size)),
      },
    };
  }
  static async getOneShipment(shipmentId, vendor_Id) {
    const whereClause = {
      id: String(shipmentId),
    };

    if (vendor_Id) {
      whereClause["$orderLines.product.vendor.id$"] = vendor_Id;
    }
    const shipment = await Shipment.findOne({
      where: whereClause,
      subQuery: false,
      include: [
        {
          model: OrderLine,
          required: true,
          as: "orderLines",
          include: [
            {
              model: Product,
              as: "product",
              required: true,
              include: {
                model: Vendor,
                as: "vendor",
                required: true,
              },
            },
          ],
        },
        {
          model: Note,
          as: "notesList",
          required: false,
          include: [
            {
              model: User,
              as: "user",
              required: false,
              attributes: ["firstName", "lastName"],
            },
          ],
        },
        {
          model: Customer,
          as: "customer",
          required: true,
        },
      ],
    });

    return {
      status: true,
      statusCode: 200,
      data: shipment,
    };
  }
  static async updateShipment(shipmentId, shipmentData) {
    //filter out the shipment Data
    Object.keys(shipmentData).forEach((key) => {
      if (key === "shippingReceiveDate" && shipmentData[key] === "") {
        shipmentData[key] = null;
      } else if (key === "deliveryDate" && shipmentData[key] === "") {
        shipmentData[key] = null;
      }
    });
    const shipment = await Shipment.findByPk(shipmentId);
    if (!shipment) {
      return {
        status: false,
        statusCode: 404,
        message: "Shipment not found",
      };
    }
    await shipment.update(shipmentData);
    return {
      status: true,
      statusCode: 200,
      data: shipment,
    };
  }

  static async deleteShipment(shipmentId) {
    const shipment = await Shipment.findByPk(shipmentId);
    if (!shipment) {
      return {
        status: false,
        statusCode: 404,
        message: "Shipment not found",
      };
    }
    await shipment.destroy();
    return {
      status: true,
      statusCode: 200,
      message: "Shipment deleted successfully",
    };
  }
  static async updateNote(user, ShipmentId, noteId, text) {
    const shipment = await Shipment.findByPk(ShipmentId);
    if (!shipment) {
      return {
        status: false,
        statusCode: 404,
        message: "Shipment Line not found",
      };
    }
    let note = await Note.findByPk(noteId);
    if (!note) {
      return {
        status: false,
        statusCode: 404,
        message: "Note not found",
      };
    }
    if (
      user.userType === USER_TYPES.VENDOR ||
      user.id.toString() !== note.userId.toString()
    ) {
      return {
        status: false,
        statusCode: 403,
        message: "You are not authorized to update this note",
      };
    }
    note.text = text;
    await note.save();

    return {
      status: true,
      statusCode: 200,
      data: note,
    };
  }
  static async addNote(user, ShipmentId, text) {
    const shipmentId = Number(ShipmentId);

    const shipment = await Shipment.findByPk(shipmentId);
    if (!shipment) {
      return {
        status: false,
        statusCode: 404,
        message: "Shipment not found",
      };
    }
    const newNote = await Note.create({
      text: text,
      userId: user.id,
      entityId: Number(shipmentId),
      entityType: "shipment",
    });
    return {
      status: true,
      statusCode: 200,
      data: newNote,
    };
  }
  static async deleteNote(user, ShipmentId, noteId) {
    const shipment = await Shipment.findByPk(ShipmentId);
    if (!shipment) {
      return {
        status: false,
        statusCode: 404,
        message: "Shipment Line not found",
      };
    }
    const note = await Note.findByPk(noteId);
    if (!note) {
      return {
        status: false,
        statusCode: 404,
        message: "Note not found",
      };
    }
    if (
      user.userType === USER_TYPES.VENDOR ||
      user.id.toString() !== note.userId.toString()
    ) {
      return {
        status: false,
        statusCode: 403,
        message: "You are not authorized to update this note",
      };
    }
    await Note.destroy({ where: { id: noteId } });
    return {
      status: true,
      statusCode: 200,
      message: "Note deleted successfully",
    };
  }
  static async exportShipments(
    res,
    {
      vendorName,
      vendorId,
      orderNumber,
      financialStatus,
      status,
      deliveryStatus,
      startDate,
      endDate,
      vendorUser,
      paymentStatus,
    }
  ) {
    let whereClause = {
      [Op.and]: [
        sequelize.where(sequelize.col("Order.shippedFromInventory"), {
          [Op.eq]: true,
        }),
      ],
    };

    if (orderNumber) {
      whereClause[Op.and].push({
        [Op.or]: [
          sequelize.where(sequelize.fn("lower", sequelize.col("Order.name")), {
            [Op.like]: `%${orderNumber.toLowerCase()}%`,
          }),
          sequelize.where(sequelize.fn("lower", sequelize.col("number")), {
            [Op.like]: `%${orderNumber.toLowerCase()}%`,
          }),
          sequelize.where(sequelize.fn("lower", sequelize.col("orderNumber")), {
            [Op.like]: `%${orderNumber.toLowerCase()}%`,
          }),
        ],
      });
    }

    if (financialStatus) {
      whereClause[Op.and].push(
        sequelize.where(
          sequelize
            .fn("lower", sequelize.col("financialStatus"))
            .cast(sequelize.Sequelize.STRING),
          {
            [Op.like]: Number(financialStatus),
          }
        )
      );
    }
    if (paymentStatus) {
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.paymentStatus"), {
          [Op.eq]: Number(paymentStatus),
        })
      );
    }
    if (deliveryStatus) {
      const statusArray = deliveryStatus.split(",").map(Number);
      const operations = [];

      const today = moment().startOf("day");
      const twoDaysLater = moment(today).add(2, "days");

      if (statusArray.includes(DELIVERY_STATUS.LATE)) {
        operations.push({
          [Op.lt]: today.toDate(),
        });
      }

      if (statusArray.includes(DELIVERY_STATUS.ALMOST_LAST)) {
        operations.push({
          [Op.and]: [
            { [Op.gte]: today.toDate() },
            { [Op.lt]: twoDaysLater.toDate() },
          ],
        });
      }

      if (statusArray.includes(DELIVERY_STATUS.ON_SCHEDULE)) {
        operations.push({
          [Op.gte]: twoDaysLater.toDate(),
        });
      }

      if (operations.length) {
        whereClause[Op.and].push(
          sequelize.where(sequelize.col("Order.expectedDeliveryDate"), {
            [Op.and]: [{ [Op.ne]: null }, { [Op.or]: operations }],
          })
        );
      }
    }

    if (startDate && endDate) {
      let startStartDate = moment
        .tz(new Date(startDate), "Africa/Cairo")
        .startOf("day")
        .utc()
        .toDate();

      let endOfEndDate = moment
        .tz(new Date(endDate), "Africa/Cairo")
        .endOf("day")
        .utc()
        .toDate();

      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.orderDate"), {
          [Op.gte]: startStartDate,
        })
      );
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.orderDate"), {
          [Op.lte]: endOfEndDate,
        })
      );
    }
    if (vendorName) {
      whereClause[Op.and].push(
        sequelize.where(
          sequelize.fn(
            "lower",
            sequelize.col("orderLines.product.vendor.name")
          ),
          {
            [Op.like]: `%${vendorName.toLowerCase()}%`,
          }
        )
      );
    }
    if (vendorId) {
      vendorId = vendorId.split(",");
      if (vendorId.length) {
        whereClause[Op.and].push(
          sequelize.where(sequelize.col("orderLines.product.vendor.id"), {
            [Op.in]: vendorId.map((id) => Number(id)),
          })
        );
      }
    }

    if (vendorUser) {
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.status"), {
          [Op.gte]: ORDER_STATUS.IN_PROGRESS,
        })
      );
      whereClause[Op.and].push(
        sequelize.where(sequelize.col("Order.status"), {
          [Op.ne]: ORDER_STATUS.CANCELED,
        })
      );
    } else if (status) {
      status = status.split(",");
      if (status.length) {
        whereClause[Op.and].push(
          sequelize.where(sequelize.col("Order.status"), {
            [Op.in]: status.map((s) => Number(s)),
          })
        );
      }
    }
    whereClause = whereClause[Op.and].length ? whereClause : {};

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=shipments.xlsx");

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const worksheet = workbook.addWorksheet("shipments");

    worksheet.columns = [
      {
        header: "كود العملية",
        key: "code",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "رقم الطلب",
        key: "orderNumber",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: " المنتج",
        key: "productName",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: " كود المنتج",
        key: "productCode",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "الكمیة",
        key: "quantity",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "البائع",
        key: "vendorName",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "حالة الطلب",
        key: "status",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "طریقة الدفع",
        key: "paymentStatus",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "تاریخ أمر التصنیع",
        key: "orderDate",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "الأیام المنقضیة",
        key: "daysPassed",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "سعر التكلفة",
        key: "cost",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "سعر البیع",
        key: "price",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "المسئول",
        key: "userName",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
      {
        header: "النوع",
        key: "productType",
        width: 20,
        style: { alignment: { horizontal: "right" } },
      },
    ];
    const CHUNK_SIZE = 500;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const chunk = await Shipment.findAll({
        include: [
          {
            model: OrderLine,
            required: true,
            as: "orderLines",
            include: [
              {
                model: Product,
                as: "product",
                required: true,
                include: [
                  {
                    model: Vendor,
                    as: "vendor",
                    required: true,
                  },
                  {
                    model: ProductType,
                    as: "type",
                    attributes: ["name"],
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: Note,
            as: "notesList",
            required: false,
            include: [
              {
                model: User,
                as: "user",
                required: false,
                attributes: ["firstName", "lastName"],
              },
              {
                model: Attachment,
                as: "attachments",
                required: false,
              },
            ],
          },
          {
            model: Customer,
            as: "customer",
            required: false,
          },
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["firstName", "lastName"],
          },
        ],
        where: whereClause,
        order: [["orderDate", "DESC"]],
        offset,
        limit: CHUNK_SIZE,
        subQuery: false,
      });

      for (const order of chunk) {
        for (const line of order.orderLines) {
          const variant = line.product.variants.find(
            (variant) => String(variant.shopifyId) === String(line.variant_id)
          );
          worksheet.addRow({
            code: order.code,
            orderNumber: order.orderNumber,
            productName: line.product.title,
            quantity: line.quantity,
            vendorName: line.product.vendor.name,
            status: ORDER_STATUS_Arabic[order.status] || order.status,
            paymentStatus:
              PAYMENT_STATUS_ARABIC[order.paymentStatus] || order.paymentStatus,
            orderDate: order.PoDate
              ? moment(order.PoDate).format("YYYY-MM-DD")
              : "",
            daysPassed: order.PoDate
              ? moment().diff(moment(order.PoDate), "days", true).toFixed(0)
              : "",
            cost: line.cost,
            price: line.price * line.quantity,
            userName: order.user
              ? `${order.user.firstName} ${order.user.lastName}`
              : "",
            productType: line.product?.type?.name || "",
            productCode: variant ? variant.sku : "",
          });
        }
      }
      hasMore = chunk.length > 0;
      offset += CHUNK_SIZE;
    }

    await workbook.commit();
    res.end();
  }
}
module.exports = ShipmentService;
