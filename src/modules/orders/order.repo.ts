import moment from "moment-timezone";
import { Op } from "sequelize";

import { DELIVERY_BY, DELIVERY_BY_ARABIC, DELIVERY_STATUS, MANUFACTURE_STATUS, ORDER_STATUS, PAYMENT_STATUS } from "../../../config/constants";
import { ACTIVE_VENDOR_ORDER_STATUSES, FINAL_ORDER_STATUSES, ORDER_SUMMARY_STATUS_GROUPS } from "./order.constants";
import {
  buildLogMessage,
  getDaysSince,
  getDeliveryPriorityLabel,
  getOrderPriority,
  getOrderPriorityFromDeliveryStatus,
  getStatusLabel,
  getManufactureLabel,
  getPaymentLabel,
  sortEventsDescending,
  toIsoString,
  toNumber,
  toPlain,
  toText,
} from "./order.helpers";
import type { OrderDetailsResponse, OrderDetailsView, OrderFinancialReportRankedItem, OrderFinancialReportResponse, OrderFinancialReportSection, OrderListItem, OrderListQuery, OrderListResponse, OrderMetaResponse, OrderSummaryResponse } from "./order.types";

const { sequelize } = require("../../infrastructure/database");
const orderModel = require("../../../app/modules/order/order.model");
const orderLineModel = require("../../../app/modules/orderLines/orderline.model");
const productModel = require("../../../app/modules/product/product.model");
const vendorModel = require("../../../app/modules/vendor/vendor.model");
const customerModel = require("../../../app/modules/customer/customer.model");
const noteModel = require("../../../app/modules/notes/notes.model");
const userModel = require("../../../app/modules/user/user.model");
const attachmentModel = require("../../../app/modules/attachments/attachment.model");
const productTypeModel = require("../../../app/modules/product/productType.model");
const logModel = require("../../../app/modules/logs/log.model");

const buildFilters = (filters: OrderListQuery, vendorId?: number | null): Record<string, unknown> => {
  const andConditions: unknown[] = [];
  const pushDateCondition = (key: string, operator: symbol, value: string): void => {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      andConditions.push(sequelize.where(sequelize.col(key), { [operator]: date }));
    }
  };

  if (filters.orderNumber) {
    andConditions.push({
      [Op.or]: [
        sequelize.where(sequelize.fn("lower", sequelize.col("Order.name")), { [Op.like]: `%${filters.orderNumber.toLowerCase()}%` }),
        sequelize.where(sequelize.fn("lower", sequelize.col("Order.number")), { [Op.like]: `%${filters.orderNumber.toLowerCase()}%` }),
        sequelize.where(sequelize.fn("lower", sequelize.col("Order.orderNumber")), { [Op.like]: `%${filters.orderNumber.toLowerCase()}%` }),
      ],
    });
  }

  if (filters.operationCode) {
    andConditions.push(sequelize.where(sequelize.fn("lower", sequelize.col("Order.code")), { [Op.like]: `%${filters.operationCode.toLowerCase()}%` }));
  }
  if (filters.customerName) {
    andConditions.push(sequelize.where(sequelize.fn("concat", sequelize.col("customer.firstName"), " ", sequelize.col("customer.lastName")), { [Op.like]: `%${filters.customerName}%` }));
  }
  if (filters.productCode) {
    andConditions.push(sequelize.where(sequelize.fn("lower", sequelize.col("orderLines.sku")), { [Op.like]: `%${filters.productCode.toLowerCase()}%` }));
  }
  if (filters.vendorName) {
    andConditions.push(sequelize.where(sequelize.fn("lower", sequelize.col("orderLines.product.vendor.name")), { [Op.like]: `%${filters.vendorName.toLowerCase()}%` }));
  }
  if (filters.vendorId) {
    andConditions.push(sequelize.where(sequelize.col("orderLines.product.vendor.id"), { [Op.in]: filters.vendorId.split(",").map(Number) }));
  }
  if (filters.status) {
    andConditions.push(sequelize.where(sequelize.col("Order.status"), { [Op.in]: filters.status.split(",").map(Number) }));
  }
  if (filters.manufactureStatus) {
    andConditions.push(sequelize.where(sequelize.col("Order.manufactureStatus"), { [Op.in]: filters.manufactureStatus.split(",").map(Number) }));
  }
  if (filters.paymentStatus) {
    andConditions.push(sequelize.where(sequelize.col("Order.paymentStatus"), { [Op.in]: filters.paymentStatus.split(",").map(Number) }));
  }
  if (filters.deliveryBy) {
    andConditions.push(sequelize.where(sequelize.col("Order.deliveryBy"), { [Op.in]: filters.deliveryBy.split(",").map(Number) }));
  }
  if (filters.userId) {
    andConditions.push(sequelize.where(sequelize.col("Order.userId"), { [Op.eq]: filters.userId }));
  }
  if (filters.startDate) {
    pushDateCondition("Order.orderDate", Op.gte, filters.startDate);
  }
  if (filters.endDate) {
    pushDateCondition("Order.orderDate", Op.lte, filters.endDate);
  }
  if (vendorId) {
    andConditions.push(sequelize.where(sequelize.col("orderLines.product.vendor.id"), { [Op.eq]: vendorId }));
    andConditions.push(sequelize.where(sequelize.col("Order.status"), { [Op.in]: ACTIVE_VENDOR_ORDER_STATUSES }));
  }

  return andConditions.length > 0 ? { [Op.and]: andConditions } : {};
};

const buildIncludes = (): Record<string, unknown>[] => {
  return [
    {
      as: "orderLines",
      include: [{
        as: "product",
        include: [
          { as: "vendor", model: vendorModel },
          { as: "type", model: productTypeModel },
        ],
        model: productModel,
      }],
      model: orderLineModel,
      required: true,
    },
    { as: "customer", model: customerModel, required: false },
  ];
};

const mapOrderSummary = (value: unknown): OrderListItem => {
  const order = toPlain(value);
  const orderLine = Array.isArray(order.orderLines) ? toPlain(order.orderLines[0]) : {};
  const product = toPlain(orderLine.product);
  const vendor = toPlain(product.vendor);
  const user = toPlain(order.user);
  const priority = getOrderPriorityFromDeliveryStatus(order.deliveryStatus, order.expectedDeliveryDate);

  return {
    code: toText(order.code),
    customerName: `${toText(toPlain(order.customer).firstName)} ${toText(toPlain(order.customer).lastName)}`.trim(),
    daysSinceOrder: getDaysSince(order.orderDate),
    deliveryBy: toNumber(order.deliveryBy) || null,
    deliveryPriority: priority,
    deliveryPriorityLabel: getDeliveryPriorityLabel(priority),
    expectedDeliveryDate: toIsoString(order.expectedDeliveryDate),
    fine: toNumber(order.fine),
    id: toNumber(order.id),
    manufactureStatus: toNumber(order.manufactureStatus) || null,
    manufactureStatusLabel: getManufactureLabel(order.manufactureStatus),
    operationNumber: toText(order.code),
    orderDate: toIsoString(order.orderDate),
    orderNumber: toText(order.orderNumber),
    paymentStatus: toNumber(order.paymentStatus) || null,
    paymentStatusLabel: getPaymentLabel(order.paymentStatus),
    productCode: toText(orderLine.sku),
    productImage: toText(product.image),
    productName: toText(product.title, toText(orderLine.title)),
    status: toNumber(order.status) || null,
    statusLabel: getStatusLabel(order.status),
    totalCost: toNumber(order.totalCost),
    totalPrice: toNumber(order.totalPrice),
    userName: `${toText(user.firstName)} ${toText(user.lastName)}`.trim(),
    vendorId: toNumber(vendor.id) || null,
    vendorName: toText(vendor.name),
  };
};

export class OrderRepository {
  public async findOrderEntity(orderId: number): Promise<unknown | null> {
    return orderModel.findByPk(orderId);
  }

  public async listOrders(filters: OrderListQuery, vendorId?: number | null): Promise<OrderListResponse> {
    const result = await orderModel.findAndCountAll({
      distinct: true,
      include: [...buildIncludes(), { as: "user", attributes: ["firstName", "lastName"], model: userModel, required: false }],
      limit: filters.size,
      offset: (filters.page - 1) * filters.size,
      order: [["orderDate", "DESC"]],
      subQuery: false,
      where: buildFilters(filters, vendorId),
    });
    const items = result.rows
      .map((row: unknown): { item: OrderListItem; row: Record<string, unknown> } => ({ item: mapOrderSummary(row), row: toPlain(row) }))
      .filter(({ item, row }: { item: OrderListItem; row: Record<string, unknown> }) => {
        const matchesPriority = !filters.priority || item.deliveryPriority === filters.priority;
        const matchesDeliveryStatus = !filters.deliveryStatus
          || filters.deliveryStatus.split(",").map(Number).includes(toNumber(row.deliveryStatus));
        return matchesPriority && matchesDeliveryStatus;
      })
      .map(({ item }: { item: OrderListItem; row: Record<string, unknown> }) => item);

    return {
      items,
      page: filters.page,
      size: filters.size,
      totalCount: result.count,
    };
  }

  public async getOrderById(orderId: number, vendorId?: number | null): Promise<OrderDetailsResponse | null> {
    const order = await orderModel.findOne({
      include: [
        ...buildIncludes(),
        { as: "notesList", include: [{ as: "user", attributes: ["firstName", "lastName"], model: userModel }, { as: "attachments", model: attachmentModel, required: false }], model: noteModel, required: false },
        { as: "user", attributes: ["firstName", "lastName"], model: userModel, required: false },
      ],
      subQuery: false,
      where: vendorId ? { "$orderLines.product.vendor.id$": vendorId, id: orderId } : { id: orderId },
    });
    if (!order) return null;
    const plainOrder = toPlain(order);
    const summary = mapOrderSummary(order);
    const orderLines = Array.isArray(plainOrder.orderLines) ? plainOrder.orderLines : [];
    const customer = toPlain(plainOrder.customer);
    const notes = Array.isArray(plainOrder.notesList) ? plainOrder.notesList.map((note) => {
      const plainNote = toPlain(note);
      return { attachments: Array.isArray(plainNote.attachments) ? plainNote.attachments.map((attachment) => ({ createdAt: toIsoString(toPlain(attachment).createdAt) ?? "", description: toText(toPlain(attachment).description), id: toNumber(toPlain(attachment).id), name: toText(toPlain(attachment).name), url: toText(toPlain(attachment).url) })) : [], createdAt: toIsoString(plainNote.createdAt) ?? "", id: toNumber(plainNote.id), text: toText(plainNote.text), userName: `${toText(toPlain(plainNote.user).firstName)} ${toText(toPlain(plainNote.user).lastName)}`.trim() };
    }) : [];
    const logs = await logModel.findAll({ order: [["createdAt", "DESC"]], where: { entityId: orderId, entityType: "order" } });
    const users = await userModel.findAll({ attributes: ["firstName", "id", "lastName"], where: { id: { [Op.in]: logs.map((log: unknown) => toNumber(toPlain(log).userId)).filter(Boolean) } } });
    const userNames = new Map(users.map((user: unknown) => { const plainUser = toPlain(user); return [toNumber(plainUser.id), `${toText(plainUser.firstName)} ${toText(plainUser.lastName)}`.trim()]; }));
    const timeline = sortEventsDescending(logs.map((log: unknown) => { const plainLog = toPlain(log); return { action: toText(plainLog.action), createdAt: toIsoString(plainLog.createdAt) ?? "", field: toText(plainLog.field), id: toNumber(plainLog.id), message: buildLogMessage(plainLog), userName: userNames.get(toNumber(plainLog.userId)) ?? "" }; }));

    const view: OrderDetailsView = {
      assigneeName: `${toText(toPlain(plainOrder.user).firstName)} ${toText(toPlain(plainOrder.user).lastName)}`.trim(),
      customer: {
        address: toText(customer.address),
        email: toText(customer.email),
        id: toNumber(customer.id) || null,
        name: `${toText(customer.firstName)} ${toText(customer.lastName)}`.trim(),
        phoneNumber: toText(customer.phoneNumber),
      },
      financial: { amountToCollect: toNumber(plainOrder.toBeCollected), commission: toNumber(plainOrder.commission), discount: toNumber(plainOrder.totalDiscounts), downPayment: toNumber(plainOrder.downPayment), fine: toNumber(plainOrder.fine), shippingFees: toNumber(plainOrder.shippingFees), totalCost: toNumber(plainOrder.totalCost), totalPrice: toNumber(plainOrder.totalPrice) },
      notes,
      order: {
        ...summary,
        deliveryDate: toIsoString(plainOrder.deliveryDate),
        itemsCount: orderLines.length,
        notes: toText(plainOrder.notes),
        shipmentType: toText(plainOrder.shipmentType),
      },
      items: orderLines.map((line) => {
        const plainLine = toPlain(line);
        const product = toPlain(plainLine.product);
        const vendor = toPlain(product.vendor);
        const type = toPlain(product.type);

        return {
          color: toText(plainLine.color),
          id: toNumber(plainLine.id),
          image: toText(product.image),
          material: toText(plainLine.material),
          productId: toNumber(product.id) || null,
          productName: toText(product.title, toText(plainLine.title)),
          quantity: toNumber(plainLine.quantity),
          size: toText(plainLine.size),
          sku: toText(plainLine.sku),
          typeName: toText(type.name),
          unitCost: toNumber(plainLine.unitCost),
          vendorId: toNumber(vendor.id) || null,
          vendorName: toText(vendor.name),
        };
      }),
      timeline,
    };

    return view;
  }

  public async getSummary(filters: OrderListQuery, vendorId?: number | null): Promise<OrderSummaryResponse> {
    const orders = await orderModel.findAll({ attributes: ["expectedDeliveryDate", "status"], include: buildIncludes(), subQuery: false, where: buildFilters(filters, vendorId) });
    const counts = { canceledOrRefundedOrders: 0, deliveredOrders: 0, inProgressOrders: 0, pendingOrders: 0, totalOrders: orders.length, urgentOrders: 0 };
    for (const order of orders) {
      const plainOrder = toPlain(order);
      const status = toNumber(plainOrder.status);
      if (ORDER_SUMMARY_STATUS_GROUPS.pending.includes(status)) counts.pendingOrders += 1;
      if (ORDER_SUMMARY_STATUS_GROUPS.inProgress.includes(status)) counts.inProgressOrders += 1;
      if (ORDER_SUMMARY_STATUS_GROUPS.delivered.includes(status)) counts.deliveredOrders += 1;
      if (ORDER_SUMMARY_STATUS_GROUPS.canceledOrRefunded.includes(status)) counts.canceledOrRefundedOrders += 1;
      if (getOrderPriorityFromDeliveryStatus(plainOrder.deliveryStatus, plainOrder.expectedDeliveryDate) === "urgent" && !FINAL_ORDER_STATUSES.includes(status)) counts.urgentOrders += 1;
    }
    return { cards: [
      { key: "urgentOrders", label: "مستعجل جدا", value: counts.urgentOrders },
      { key: "canceledOrRefundedOrders", label: "ملغي / مرتجع", value: counts.canceledOrRefundedOrders },
      { key: "deliveredOrders", label: "تم التسليم", value: counts.deliveredOrders },
      { key: "inProgressOrders", label: "قيد التصنيع", value: counts.inProgressOrders },
      { key: "pendingOrders", label: "معلق", value: counts.pendingOrders },
      { key: "totalOrders", label: "إجمالي الطلبات", value: counts.totalOrders },
    ] };
  }

  public async getMeta(): Promise<OrderMetaResponse> {
    const [vendors, assignees] = await Promise.all([
      vendorModel.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] }),
      userModel.findAll({ attributes: ["firstName", "id", "lastName"], order: [["firstName", "ASC"]] }),
    ]);
    return {
      assignees: assignees.map((user: unknown) => ({ id: toNumber(toPlain(user).id), label: `${toText(toPlain(user).firstName)} ${toText(toPlain(user).lastName)}`.trim() })),
      deliveryByOptions: Object.entries(DELIVERY_BY).map(([, id]) => ({ id: Number(id), label: DELIVERY_BY_ARABIC[id as keyof typeof DELIVERY_BY_ARABIC] ?? String(id) })),
      manufactureStatuses: Object.entries(MANUFACTURE_STATUS).map(([label, id]) => ({ id: Number(id), label })),
      paymentStatuses: Object.entries(PAYMENT_STATUS).map(([label, id]) => ({ id: Number(id), label })),
      priorities: [{ id: "onSchedule", label: "بالمدة" }, { id: "almostDue", label: "مستعجل" }, { id: "urgent", label: "مستعجل جدا" }],
      statuses: Object.entries(ORDER_STATUS).map(([label, id]) => ({ id: Number(id), label })),
      vendors: vendors.map((vendor: unknown) => ({ id: toNumber(toPlain(vendor).id), label: toText(toPlain(vendor).name) })),
    };
  }

  public async getFinancialReport(vendorId: string | number | undefined, startDate?: string, endDate?: string): Promise<OrderFinancialReportResponse> {
    const start = startDate
      ? moment.tz(new Date(startDate), "Africa/Cairo").startOf("day").utc().toDate()
      : moment().tz("Africa/Cairo").startOf("month").utc().toDate();
    const end = endDate
      ? moment.tz(new Date(endDate), "Africa/Cairo").endOf("day").utc().toDate()
      : moment().tz("Africa/Cairo").endOf("day").utc().toDate();

    const whereConditions: unknown[] = [
      sequelize.where(sequelize.col("orderDate"), { [Op.gte]: start }),
      sequelize.where(sequelize.col("orderDate"), { [Op.lte]: end }),
    ];

    if (vendorId && String(vendorId) !== "0") {
      whereConditions.push(
        sequelize.where(sequelize.col("orderLines.product.vendor.id"), {
          [Op.eq]: Number(vendorId),
        }),
      );
    }

    const orders = await orderModel.findAll({
      include: [
        {
          as: "orderLines",
          include: [
            {
              as: "product",
              include: [{ as: "vendor", model: vendorModel }],
              model: productModel,
              required: true,
            },
          ],
          model: orderLineModel,
          required: true,
        },
      ],
      where: { [Op.and]: whereConditions },
    });

    const delivered: OrderFinancialReportSection = {
      ordersCount: 0,
      subTotal: 0,
      totalCommission: 0,
      totalCost: 0,
      totalDiscount: 0,
      totalDownPayment: 0,
      totalPaid: 0,
      totalProfit: 0,
      totalRevenue: 0,
      totalTax: 0,
      totalToBeCollected: 0,
    };

    const topVendors = new Map<number, OrderFinancialReportRankedItem>();
    const topProducts = new Map<number, OrderFinancialReportRankedItem>();

    let ordersCount = 0;
    let subTotal = 0;
    let totalCommission = 0;
    let totalCost = 0;
    let totalDiscount = 0;
    let totalDownPayment = 0;
    let totalPaid = 0;
    let totalTax = 0;
    let totalToBeCollected = 0;
    let shippingFees = 0;

    for (const order of orders) {
      const plainOrder = toPlain(order);
      const isDelivered = toNumber(plainOrder.status) === ORDER_STATUS.DELIVERED;
      const orderSubTotal = toNumber(plainOrder.subTotalPrice);
      const orderDiscount = toNumber(plainOrder.totalDiscounts);
      const orderCost = toNumber(plainOrder.totalCost);
      const orderPrice = toNumber(plainOrder.totalPrice);
      const orderCommission = toNumber(plainOrder.commission);
      const orderTax = toNumber(plainOrder.totalTax);
      const orderProfit = orderPrice - orderCost - orderCommission - orderTax;
      const orderDownPayment = toNumber(plainOrder.downPayment);
      const orderToBeCollected = toNumber(plainOrder.toBeCollected);

      if (isDelivered) {
        delivered.ordersCount += 1;
        delivered.subTotal += orderSubTotal;
        delivered.totalCommission += orderCommission;
        delivered.totalCost += orderCost;
        delivered.totalDiscount += orderDiscount;
        delivered.totalDownPayment += orderDownPayment;
        delivered.totalPaid += orderPrice;
        delivered.totalProfit += orderProfit;
        delivered.totalRevenue += orderPrice;
        delivered.totalTax += orderTax;
        delivered.totalToBeCollected += orderToBeCollected;
      }

      const orderLines = Array.isArray(plainOrder.orderLines) ? plainOrder.orderLines : [];
      for (const line of orderLines) {
        const plainLine = toPlain(line);
        const product = toPlain(plainLine.product);
        const vendor = toPlain(product.vendor);
        const lineRevenue = toNumber(plainLine.price);
        const lineProfit =
          lineRevenue - toNumber(plainLine.cost) - toNumber(plainLine.commission) - toNumber(plainLine.tax);
        const vendorIdNumber = toNumber(vendor.id);
        const productIdNumber = toNumber(product.id);

        if (vendorIdNumber) {
          const vendorEntry = topVendors.get(vendorIdNumber) ?? {
            profit: 0,
            revenue: 0,
            vendorId: vendorIdNumber,
            vendorName: toText(vendor.name),
          };
          vendorEntry.profit += lineProfit;
          vendorEntry.revenue += lineRevenue;
          topVendors.set(vendorIdNumber, vendorEntry);
        }

        if (productIdNumber) {
          const productEntry = topProducts.get(productIdNumber) ?? {
            productId: productIdNumber,
            productImage: toText(product.image),
            productName: toText(product.title),
            profit: 0,
            revenue: 0,
            sku: toText(plainLine.sku),
          };
          productEntry.profit += lineProfit;
          productEntry.revenue += lineRevenue;
          topProducts.set(productIdNumber, productEntry);
        }
      }

      ordersCount += 1;
      totalCommission += orderCommission;
      totalCost += orderCost;
      totalDiscount += orderDiscount;
      totalDownPayment += orderDownPayment;
      totalPaid += orderPrice;
      totalTax += orderTax;
      subTotal += orderSubTotal;
      totalToBeCollected += orderToBeCollected;
      shippingFees += toNumber(plainOrder.shippingFees);
    }

    return {
      DeliveredOrders: delivered,
      ordersCount,
      subTotal,
      topTenProducts: [...topProducts.values()].sort((left, right) => right.profit - left.profit).slice(0, 10),
      topTenVendors: [...topVendors.values()].sort((left, right) => right.profit - left.profit).slice(0, 10),
      totalCommission,
      totalCost,
      totalDiscount,
      totalDownPayment,
      totalPaid,
      totalProfit: subTotal - totalDiscount + shippingFees - totalCost - totalCommission - totalTax,
      totalRevenue: subTotal - totalDiscount + shippingFees,
      totalTax,
      totalToBeCollected,
    };
  }

  public async createOrderLog(entry: {
    action: string;
    entityId: number;
    entityType: "order";
    field?: string;
    from?: unknown;
    to?: unknown;
    userId: number;
  }): Promise<void> {
    await logModel.create(entry);
  }

  public async deleteOrder(orderId: number): Promise<void> {
    await orderModel.destroy({ where: { id: orderId } });
  }

  public async bulkDelete(orderIds: number[]): Promise<void> {
    await orderModel.destroy({
      where: {
        id: {
          [Op.in]: orderIds,
        },
      },
    });
  }

  public async findNoteById(noteId: number): Promise<unknown | null> {
    return noteModel.findByPk(noteId);
  }

  public async createOrderNote(orderId: number, userId: number, text: string): Promise<unknown> {
    return noteModel.create({
      entityId: orderId,
      entityType: "order",
      text,
      userId,
    });
  }

  public async updateOrderNote(noteId: number, text: string): Promise<unknown> {
    const note = await noteModel.findByPk(noteId);
    if (!note) return null;
    note.text = text;
    await note.save();
    return note;
  }

  public async deleteOrderNote(noteId: number): Promise<void> {
    await noteModel.destroy({ where: { id: noteId } });
  }

  public async createNoteAttachments(
    noteId: number,
    filePaths: string[],
    fileNames: string[],
    descriptions: string[],
  ): Promise<void> {
    for (let index = 0; index < filePaths.length; index += 1) {
      await attachmentModel.create({
        description: descriptions[index] || "",
        modelId: noteId,
        modelType: "Note",
        name: fileNames[index],
        url: filePaths[index],
      });
    }
  }
}
