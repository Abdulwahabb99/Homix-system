import { Op, fn, col, where } from "sequelize";

import { sequelize } from "../../infrastructure/database";
import { ConflictError, NotFoundError } from "../../shared/errors";
import { buildLogMessage } from "../orders/order.helpers";
import {
  ACCOUNTING_STATUS,
  ACCOUNT_STATUS_LABELS,
  CUSTOMER_RETURN_FINAL_STATUSES,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DELIVERY_BY_LABELS,
  CUSTOMER_RETURN_STATUS,
  EXPENSE_STATUS_LABELS,
  INVENTORY_STATUS,
  INVENTORY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  RETURN_TO_VENDOR_FINAL_STATUSES,
  RETURN_TO_VENDOR_STATUS,
  RETURN_TO_VENDOR_STATUS_LABELS,
  CUSTOMER_RETURN_STATUS_LABELS,
  SHIPMENT_STATUS,
  SHIPMENT_RETURN_TYPE,
  SHIPMENT_RETURN_TYPE_LABELS,
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_TYPE_LABELS,
} from "./shipment.constants";
import {
  buildShipmentNumber,
  buildUserName,
  getDaysBetween,
  getShipmentAgingDays,
  getShipmentStatusLabel,
  getShipmentTypeLabel,
  getVariantBySku,
  normalizeOperationCode,
  toIsoString,
  toNullableNumber,
  toNumber,
  toPlain,
  toText,
} from "./shipment.helpers";
import type {
  DeliveryAccountItem,
  DeliveryAccountsListQuery,
  DeliveryAccountsListResponse,
  ExpenseAccountItem,
  ExpenseMutationInput,
  ExpenseAccountsListQuery,
  ExpenseAccountsListResponse,
  InventoryItem,
  InventoryMutationInput,
  InventoryListQuery,
  InventoryListResponse,
  PerformanceQuery,
  PerformanceResponse,
  ReturnItem,
  ReturnListQuery,
  ReturnListResponse,
  ReturnMutationInput,
  ShipmentDetailsResponse,
  ShipmentListItem,
  ShipmentListQuery,
  ShipmentListResponse,
  ShipmentMetaResponse,
  ShipmentNote,
  ShipmentSummaryResponse,
} from "./shipment.types";

const orderModel = require("../../../app/modules/order/order.model");
const orderLineModel = require("../../../app/modules/orderLines/orderline.model");
const productModel = require("../../../app/modules/product/product.model");
const vendorModel = require("../../../app/modules/vendor/vendor.model");
const customerModel = require("../../../app/modules/customer/customer.model");
const noteModel = require("../../../app/modules/notes/notes.model");
const userModel = require("../../../app/modules/user/user.model");
const logModel = require("../../../app/modules/logs/log.model");
const productTypeModel = require("../../../app/modules/product/productType.model");
const shipmentInventoryModel = require("../../../app/modules/shipments/shipmentInventory.model");
const shipmentExpenseModel = require("../../../app/modules/shipments/shipmentExpense.model");
const shipmentReturnModel = require("../../../app/modules/shipments/shipmentReturn.model");

const buildInventoryItem = (inventoryValue: unknown): InventoryItem => {
  const inventory = toPlain(inventoryValue);
  const product = toPlain(inventory.product);
  const vendor = toPlain(product.vendor);
  const productCode = toText(inventory.productCode);
  const variant = getVariantBySku(product.variants, productCode);
  const status = toNumber(inventory.status) || INVENTORY_STATUS.IN_STOCK;

  return {
    color: toText(inventory.color, toText(variant?.option2)),
    costPrice: toNumber(inventory.costPrice),
    id: toNumber(inventory.id),
    image: toText(product.image),
    productCode,
    productId: toNullableNumber(inventory.productId),
    productName: toText(product.title, toText(inventory.productName)),
    quantity: toNumber(inventory.quantity),
    size: toText(inventory.size, toText(variant?.option1)),
    status,
    statusLabel: INVENTORY_STATUS_LABELS[status] ?? String(status),
    vendorId: toNullableNumber(product.vendorId ?? inventory.vendorId),
    vendorName: toText(vendor.name, toText(inventory.vendorName)),
  };
};

const buildShipmentWhereClause = (
  filters: Omit<ShipmentListQuery, "page" | "size">,
  vendorId?: number | null,
): Record<string, unknown> => {
  const andConditions: unknown[] = [{ shippedFromInventory: true }];

  if (vendorId) {
    andConditions.push(where(col("orderLines.product.vendor.id"), { [Op.eq]: vendorId }));
  }

  if (filters.operationCode) {
    andConditions.push(where(fn("lower", col("Order.code")), { [Op.like]: `%${filters.operationCode.toLowerCase()}%` }));
  }

  if (filters.orderNumber) {
    andConditions.push({
      [Op.or]: [
        where(fn("lower", col("Order.name")), { [Op.like]: `%${filters.orderNumber.toLowerCase()}%` }),
        where(fn("lower", col("Order.number")), { [Op.like]: `%${filters.orderNumber.toLowerCase()}%` }),
        where(fn("lower", col("Order.orderNumber")), { [Op.like]: `%${filters.orderNumber.toLowerCase()}%` }),
      ],
    });
  }

  if (filters.customerName) {
    andConditions.push(where(fn("lower", fn("concat", col("customer.firstName"), " ", col("customer.lastName"))), {
      [Op.like]: `%${filters.customerName.toLowerCase()}%`,
    }));
  }

  if (filters.customerPhone) {
    andConditions.push(where(col("customer.phoneNumber"), { [Op.like]: `%${filters.customerPhone}%` }));
  }

  if (filters.vendorName) {
    andConditions.push(where(fn("lower", col("orderLines.product.vendor.name")), { [Op.like]: `%${filters.vendorName.toLowerCase()}%` }));
  }

  if (filters.shipmentStatus) {
    andConditions.push(where(col("Order.shipmentStatus"), {
      [Op.in]: filters.shipmentStatus.split(",").map(Number),
    }));
  }

  if (filters.shipmentType) {
    andConditions.push(where(fn("lower", col("Order.shipmentType")), { [Op.like]: `%${filters.shipmentType.toLowerCase()}%` }));
  }

  if (filters.paymentStatus) {
    andConditions.push(where(col("Order.paymentStatus"), {
      [Op.in]: filters.paymentStatus.split(",").map(Number),
    }));
  }

  if (filters.deliveryBy) {
    andConditions.push({
      [Op.or]: [
        where(col("Order.deliveryBy"), { [Op.in]: filters.deliveryBy.split(",").map(Number) }),
        where(fn("lower", col("Order.shippingCompany")), { [Op.like]: `%${filters.deliveryBy.toLowerCase()}%` }),
      ],
    });
  }

  if (filters.startDate) {
    andConditions.push(where(col("Order.shippingReceiveDate"), { [Op.gte]: new Date(`${filters.startDate}T00:00:00.000Z`) }));
  }

  if (filters.endDate) {
    andConditions.push(where(col("Order.shippingReceiveDate"), { [Op.lte]: new Date(`${filters.endDate}T23:59:59.999Z`) }));
  }

  if (filters.deliveryDateFrom) {
    andConditions.push(where(col("Order.deliveryDate"), { [Op.gte]: new Date(`${filters.deliveryDateFrom}T00:00:00.000Z`) }));
  }

  if (filters.deliveryDateTo) {
    andConditions.push(where(col("Order.deliveryDate"), { [Op.lte]: new Date(`${filters.deliveryDateTo}T23:59:59.999Z`) }));
  }

  return andConditions.length > 0 ? { [Op.and]: andConditions } : {};
};

const buildIncludes = () => [
  {
    as: "orderLines",
    include: [
      {
        as: "product",
        include: [
          { as: "vendor", model: vendorModel, required: false },
          { as: "type", model: productTypeModel, required: false },
        ],
        model: productModel,
        required: false,
      },
    ],
    model: orderLineModel,
    required: false,
  },
  {
    as: "customer",
    model: customerModel,
    required: false,
  },
  {
    as: "notesList",
    include: [
      {
        as: "user",
        attributes: ["firstName", "lastName"],
        model: userModel,
        required: false,
      },
    ],
    model: noteModel,
    required: false,
  },
  {
    as: "user",
    attributes: ["firstName", "lastName"],
    model: userModel,
    required: false,
  },
];

const mapShipmentListItem = (orderValue: unknown): ShipmentListItem => {
  const order = toPlain(orderValue);
  const orderLines = Array.isArray(order.orderLines) ? order.orderLines.map((line) => toPlain(line)) : [];
  const firstLine = orderLines[0] ?? {};
  const product = toPlain(firstLine.product);
  const vendor = toPlain(product.vendor);
  const customer = toPlain(order.customer);
  const deliveryBy = toNullableNumber(order.deliveryBy);

  return {
    amountToCollect: toNumber(order.toBeCollected || order.totalPrice),
    customerName: `${toText(customer.firstName)} ${toText(customer.lastName)}`.trim(),
    customerPhone: toText(customer.phoneNumber),
    daysCounter: getShipmentAgingDays(order.shipmentStatus, order.shippingReceiveDate, order.deliveryDate, order.updatedAt),
    deliveryBy: toText(order.shippingCompany) || (deliveryBy ? DELIVERY_BY_LABELS[deliveryBy] ?? String(deliveryBy) : ""),
    deliveryDate: toIsoString(order.deliveryDate),
    governorate: toText(order.governorate),
    id: toNumber(order.id),
    operationNumber: normalizeOperationCode(order.code),
    orderNumber: toText(order.orderNumber, toText(order.number, toText(order.name))),
    paymentStatus: toNullableNumber(order.paymentStatus),
    paymentStatusLabel: PAYMENT_STATUS_LABELS[toNumber(order.paymentStatus)] ?? "",
    receivedInWarehouseDate: toIsoString(order.shippingReceiveDate),
    scheduledDeliveryDate: toIsoString(order.expectedDeliveryDate),
    sellerName: toText(vendor.name),
    shipmentNumber: buildShipmentNumber(order.id),
    shipmentStatus: toNullableNumber(order.shipmentStatus),
    shipmentStatusLabel: getShipmentStatusLabel(order.shipmentStatus),
    shipmentType: toText(order.shipmentType),
    shipmentTypeLabel: getShipmentTypeLabel(order.shipmentType),
    shippingCost: toNumber(order.shippingFees),
  };
};

const mapShipmentNote = (noteValue: unknown) => {
  const note = toPlain(noteValue);
  return {
    createdAt: toIsoString(note.createdAt) ?? "",
    id: toNumber(note.id),
    text: toText(note.text),
    userName: buildUserName(note.user),
  } satisfies ShipmentNote;
};

const mapTimeline = (logs: unknown[]) =>
  logs.map((logValue) => {
    const log = toPlain(logValue);
    return {
      changedAt: toIsoString(log.createdAt) ?? "",
      id: toNumber(log.id),
      message: buildLogMessage(log),
      userName: "",
    };
  });

const getFallbackReturnStatus = (returnType: number): number => {
  return returnType === SHIPMENT_RETURN_TYPE.TO_VENDOR
    ? RETURN_TO_VENDOR_STATUS.VENDOR_NOTIFIED
    : CUSTOMER_RETURN_STATUS.PICKED_UP;
};

const getShipmentStatusForReturnType = (returnType: number): number => {
  return returnType === SHIPMENT_RETURN_TYPE.TO_VENDOR
    ? SHIPMENT_STATUS.RETURNED_TO_VENDOR
    : SHIPMENT_STATUS.RETURNED_FROM_CUSTOMER;
};

const getReturnStatusLabel = (returnType: number, status: number): string => {
  if (returnType === SHIPMENT_RETURN_TYPE.TO_VENDOR) {
    return RETURN_TO_VENDOR_STATUS_LABELS[status] ?? String(status);
  }

  return CUSTOMER_RETURN_STATUS_LABELS[status] ?? String(status);
};

const isFinalReturnStatus = (returnType: number, status: number): boolean => {
  return returnType === SHIPMENT_RETURN_TYPE.TO_VENDOR
    ? RETURN_TO_VENDOR_FINAL_STATUSES.includes(status as never)
    : CUSTOMER_RETURN_FINAL_STATUSES.includes(status as never);
};

const shouldAutoForfeitVendorReturn = (returnValue: unknown): boolean => {
  const plainReturn = toPlain(returnValue);
  if (toNumber(plainReturn.returnType) !== SHIPMENT_RETURN_TYPE.TO_VENDOR) {
    return false;
  }

  if (toNumber(plainReturn.status) !== RETURN_TO_VENDOR_STATUS.VENDOR_NOTIFIED) {
    return false;
  }

  const daysCounter = getDaysBetween(plainReturn.startedAt ?? plainReturn.returnDate, undefined);
  return (daysCounter ?? 0) >= 12;
};

export class ShipmentRepository {
  public async findShipmentEntity(shipmentId: number): Promise<unknown | null> {
    return orderModel.findByPk(shipmentId);
  }

  public async findReturnById(returnId: number): Promise<unknown | null> {
    return shipmentReturnModel.findByPk(returnId);
  }

  public async getMeta(): Promise<ShipmentMetaResponse> {
    const shipmentsCount = await orderModel.count({ where: { shippedFromInventory: true } });
    const returnsToVendorCount = await orderModel.count({
      where: {
        shippedFromInventory: true,
        shipmentStatus: SHIPMENT_STATUS.RETURNED_TO_VENDOR,
      },
    });
    const returnsFromCustomerCount = await orderModel.count({
      where: {
        shippedFromInventory: true,
        shipmentStatus: SHIPMENT_STATUS.RETURNED_FROM_CUSTOMER,
      },
    });

    return {
      deliveryByOptions: Object.entries(DELIVERY_BY_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      paymentStatuses: Object.entries(PAYMENT_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      shipmentStatuses: Object.entries(SHIPMENT_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      shipmentTypes: [
        { id: "grouped", label: SHIPMENT_TYPE_LABELS.grouped ?? "شحن مجمع" },
        { id: "separate", label: SHIPMENT_TYPE_LABELS.separate ?? "شحن منفصل" },
      ],
      tabs: [
        { count: shipmentsCount, id: "shipments", label: "الشحنات" },
        { count: returnsToVendorCount + returnsFromCustomerCount, id: "returns", label: "المرتجعات" },
        { id: "inventory", label: "المخزون" },
        { id: "accounts", label: "الحسابات" },
        { id: "performance", label: "تقارير الأداء" },
      ],
    };
  }

  public async getSummary(filters: Omit<ShipmentListQuery, "page" | "size">, vendorId?: number | null): Promise<ShipmentSummaryResponse> {
    const whereClause = buildShipmentWhereClause(filters, vendorId);
    const orders = await orderModel.findAll({
      include: buildIncludes(),
      subQuery: false,
      where: whereClause,
    });
    const items: ShipmentListItem[] = orders.map((order: unknown) => mapShipmentListItem(order));
    const deliveredCount = items.filter((item: ShipmentListItem) => item.shipmentStatus === SHIPMENT_STATUS.DELIVERED).length;
    const inDeliveryCount = items.filter((item: ShipmentListItem) => item.shipmentStatus === SHIPMENT_STATUS.READY_FOR_SHIPPING).length;
    const failedStatuses = [
      SHIPMENT_STATUS.CANCELED,
      SHIPMENT_STATUS.REJECTED,
      SHIPMENT_STATUS.RETURNED_FROM_CUSTOMER,
      SHIPMENT_STATUS.RETURNED_TO_VENDOR,
      SHIPMENT_STATUS.FAILED_DELIVERY,
    ];
    const failedOrReturnedCount = items.filter((item: ShipmentListItem) =>
      failedStatuses.some((status) => status === (item.shipmentStatus ?? 0)))
      .length;
    const totalGmv = items.reduce((sum: number, item: ShipmentListItem) => sum + item.amountToCollect, 0);
    const successRate = items.length > 0 ? Math.round((deliveredCount / items.length) * 1000) / 10 : 0;

    return {
      cards: [
        { description: "إجمالي الشحنات ضمن الفلاتر الحالية", key: "totalShipments", label: "الشحنات", value: items.length },
        { description: "الشحنات التي تم تسليمها", key: "deliveredShipments", label: "تم التسليم", value: deliveredCount },
        { description: "الشحنات الجاهزة أو قيد التوصيل", key: "inDeliveryShipments", label: "قيد التوصيل", value: inDeliveryCount },
        { description: "ملغي أو مرتجع أو فشل", key: "failedOrReturnedShipments", label: "مرتجع / ملغي / فاشل", value: failedOrReturnedCount },
        { description: `معدل النجاح ${successRate}%`, key: "successRate", label: "معدل النجاح", value: successRate },
        { description: "إجمالي المبلغ المطلوب تحصيله", key: "totalGmv", label: "إجمالي التحصيل", value: totalGmv },
      ],
    };
  }

  public async listShipments(filters: ShipmentListQuery, vendorId?: number | null): Promise<ShipmentListResponse> {
    const whereClause = buildShipmentWhereClause(filters, vendorId);
    const result = await orderModel.findAndCountAll({
      include: buildIncludes(),
      limit: filters.size,
      offset: (filters.page - 1) * filters.size,
      order: [["shippingReceiveDate", "DESC"]],
      subQuery: false,
      where: whereClause,
    });

    return {
      items: result.rows.map((row: unknown) => mapShipmentListItem(row)),
      page: filters.page ?? DEFAULT_PAGE_NUMBER,
      size: filters.size ?? DEFAULT_PAGE_SIZE,
      totalCount: result.count,
    };
  }

  public async getShipmentById(shipmentId: number, vendorId?: number | null): Promise<ShipmentDetailsResponse | null> {
    const shipment = await orderModel.findOne({
      include: buildIncludes(),
      subQuery: false,
      where: {
        id: shipmentId,
        ...(vendorId ? { "$orderLines.product.vendor.id$": vendorId } : {}),
      },
    });

    if (!shipment) {
      return null;
    }

    const order = toPlain(shipment);
    const orderLines = Array.isArray(order.orderLines) ? order.orderLines.map((line) => toPlain(line)) : [];
    const customer = toPlain(order.customer);
    const firstVendor = toPlain(toPlain(toPlain(orderLines[0]).product).vendor);
    const logs = await logModel.findAll({
      order: [["createdAt", "ASC"]],
      where: { entityId: shipmentId, entityType: "order" },
    });

    return {
      customer: {
        address: toText(customer.address),
        name: `${toText(customer.firstName)} ${toText(customer.lastName)}`.trim(),
        phoneNumber: toText(customer.phoneNumber),
      },
      financial: {
        amountToCollect: toNumber(order.toBeCollected || order.totalPrice),
        shippingCost: toNumber(order.shippingFees),
        totalPrice: toNumber(order.totalPrice),
      },
      notes: Array.isArray(order.notesList) ? order.notesList.map((note) => mapShipmentNote(note)) : [],
      products: orderLines.map((line) => {
        const product = toPlain(line.product);
        const vendor = toPlain(product.vendor);
        const variant = getVariantBySku(product.variants, toText(line.sku));
        return {
          color: toText(line.color),
          image: toText(product.image),
          price: toNumber(line.price) * Math.max(1, toNumber(line.quantity)),
          productCode: toText(line.sku, toText(variant?.sku)),
          productName: toText(product.title, toText(line.title)),
          quantity: toNumber(line.quantity),
          size: toText(line.size),
          vendorName: toText(vendor.name),
        };
      }),
      shipment: {
        ...mapShipmentListItem(order),
        shippingCompany: toText(order.shippingCompany),
      },
      timeline: mapTimeline(logs),
      vendor: {
        name: toText(firstVendor.name),
      },
    };
  }

  private async listReturnsByStatus(
    shipmentStatus: number,
    filters: ReturnListQuery,
    vendorId?: number | null,
  ): Promise<ReturnListResponse> {
    const whereClause = buildShipmentWhereClause(
      {
        operationCode: filters.operationCode,
        orderNumber: filters.orderNumber,
        shipmentStatus: String(shipmentStatus),
      },
      vendorId,
    );

    if (filters.sellerName) {
      const andConditions = (whereClause as { [key: string]: unknown[] })[Op.and as unknown as string] ?? [];
      andConditions.push(where(fn("lower", col("orderLines.product.vendor.name")), {
        [Op.like]: `%${filters.sellerName.toLowerCase()}%`,
      }));
      (whereClause as { [key: string]: unknown[] })[Op.and as unknown as string] = andConditions;
    }

    const result = await orderModel.findAndCountAll({
      include: buildIncludes(),
      limit: filters.size,
      offset: (filters.page - 1) * filters.size,
      order: [["updatedAt", "DESC"]],
      subQuery: false,
      where: whereClause,
    });

    const returnType = shipmentStatus === SHIPMENT_STATUS.RETURNED_TO_VENDOR
      ? SHIPMENT_RETURN_TYPE.TO_VENDOR
      : SHIPMENT_RETURN_TYPE.FROM_CUSTOMER;
    const orderIds = result.rows.map((row: unknown) => toNumber(toPlain(row).id)).filter((id: number) => id > 0);
    const persistedReturns = orderIds.length > 0
      ? await shipmentReturnModel.findAll({
          where: {
            orderId: { [Op.in]: orderIds },
            returnType,
          },
        })
      : [];
    const persistedMap = new Map<number, Record<string, unknown>>();
    for (const row of persistedReturns) {
      if (shouldAutoForfeitVendorReturn(row)) {
        await row.update({
          completedAt: new Date(),
          status: RETURN_TO_VENDOR_STATUS.FORFEIT,
        });
      }
      const plainReturn = toPlain(row);
      persistedMap.set(toNumber(plainReturn.orderId), plainReturn);
    }

    const items = result.rows.map((row: unknown) => {
      const order = toPlain(row);
      const persistedReturn = persistedMap.get(toNumber(order.id));
      const firstLine = Array.isArray(order.orderLines) ? toPlain(order.orderLines[0]) : {};
      const vendor = toPlain(toPlain(firstLine.product).vendor);
      const notes = Array.isArray(order.notesList) ? order.notesList.map((note) => toPlain(note)) : [];
      const status = persistedReturn
        ? toNumber(persistedReturn.status)
        : getFallbackReturnStatus(returnType);
      const startedAt = persistedReturn?.startedAt ?? persistedReturn?.returnDate ?? order.updatedAt;
      const completedAt = persistedReturn && isFinalReturnStatus(returnType, status)
        ? (persistedReturn.completedAt ?? persistedReturn.updatedAt ?? persistedReturn.returnDate)
        : undefined;

      return {
        daysCounter: getDaysBetween(startedAt, completedAt),
        id: persistedReturn ? toNumber(persistedReturn.id) : toNumber(order.id),
        operationNumber: normalizeOperationCode(order.code),
        orderNumber: toText(order.orderNumber, toText(order.number, toText(order.name))),
        reason: toText(persistedReturn?.reason, toText(notes[0]?.text, toText(order.notes))),
        returnDate: toIsoString(persistedReturn?.returnDate ?? order.updatedAt),
        returnType,
        returnTypeLabel: SHIPMENT_RETURN_TYPE_LABELS[returnType] ?? String(returnType),
        sellerName: toText(vendor.name),
        status,
        statusLabel: getReturnStatusLabel(returnType, status),
      };
    });

    const filteredItems = filters.status
      ? items.filter((item: ReturnItem) => item.status === filters.status)
      : items;

    return {
      items: filteredItems,
      page: filters.page,
      size: filters.size,
      totalCount: filteredItems.length,
    };
  }

  public listVendorReturns(filters: ReturnListQuery, vendorId?: number | null): Promise<ReturnListResponse> {
    return this.listReturnsByStatus(SHIPMENT_STATUS.RETURNED_TO_VENDOR, filters, vendorId);
  }

  public listCustomerReturns(filters: ReturnListQuery, vendorId?: number | null): Promise<ReturnListResponse> {
    return this.listReturnsByStatus(SHIPMENT_STATUS.RETURNED_FROM_CUSTOMER, filters, vendorId);
  }

  public async createReturnRecord(returnType: number, payload: ReturnMutationInput): Promise<ReturnItem> {
    const shipment = await orderModel.findByPk(payload.orderId, {
      include: buildIncludes(),
    });
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    const existingRecord = await shipmentReturnModel.findOne({
      where: {
        orderId: payload.orderId,
        returnType,
      },
    });
    if (existingRecord) {
      throw new ConflictError("Return record already exists");
    }

    const plainShipment = toPlain(shipment);
    const firstLine = Array.isArray(plainShipment.orderLines) ? toPlain(plainShipment.orderLines[0]) : {};
    const vendor = toPlain(toPlain(firstLine.product).vendor);
    const status = payload.status ?? getFallbackReturnStatus(returnType);
    const returnDate = payload.returnDate ? new Date(payload.returnDate) : new Date();
    await shipment.update({
      shipmentStatus: getShipmentStatusForReturnType(returnType),
    });
    const createdRecord = await shipmentReturnModel.create({
      completedAt: isFinalReturnStatus(returnType, status) ? returnDate : null,
      orderId: payload.orderId,
      reason: payload.reason,
      returnDate,
      returnType,
      startedAt: returnDate,
      status,
    });
    const record = toPlain(createdRecord);

    return {
      daysCounter: getDaysBetween(record.startedAt, record.completedAt),
      id: toNumber(record.id),
      operationNumber: normalizeOperationCode(plainShipment.code),
      orderNumber: toText(plainShipment.orderNumber, toText(plainShipment.number, toText(plainShipment.name))),
      reason: toText(record.reason),
      returnDate: toIsoString(record.returnDate),
      returnType,
      returnTypeLabel: SHIPMENT_RETURN_TYPE_LABELS[returnType] ?? String(returnType),
      sellerName: toText(vendor.name),
      status,
      statusLabel: getReturnStatusLabel(returnType, status),
    };
  }

  public async updateReturnRecord(returnId: number, returnType: number, payload: Partial<ReturnMutationInput>): Promise<ReturnItem | null> {
    const returnRecord = await shipmentReturnModel.findByPk(returnId);
    if (!returnRecord) {
      return null;
    }

    if (shouldAutoForfeitVendorReturn(returnRecord)) {
      await returnRecord.update({
        completedAt: new Date(),
        status: RETURN_TO_VENDOR_STATUS.FORFEIT,
      });
    }

    const plainReturn = toPlain(returnRecord);
    if (toNumber(plainReturn.returnType) !== returnType) {
      return null;
    }

    const shipment = await orderModel.findByPk(toNumber(plainReturn.orderId), {
      include: buildIncludes(),
    });
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    const shipmentStatus = getShipmentStatusForReturnType(returnType);
    const plainShipmentBeforeSync = toPlain(shipment);
    if (toNumber(plainShipmentBeforeSync.shipmentStatus) !== shipmentStatus) {
      await shipment.update({ shipmentStatus });
    }

    const nextStatus = payload.status ?? toNumber(plainReturn.status);
    const nextReturnDate = payload.returnDate !== undefined
      ? (payload.returnDate ? new Date(payload.returnDate) : null)
      : plainReturn.returnDate;
    await returnRecord.update({
      ...(payload.reason !== undefined ? { reason: payload.reason } : {}),
      ...(payload.returnDate !== undefined ? { returnDate: nextReturnDate } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      completedAt: isFinalReturnStatus(returnType, nextStatus)
        ? (plainReturn.completedAt ?? nextReturnDate ?? new Date())
        : null,
    });

    const updated = toPlain(returnRecord);
    const plainShipment = toPlain(shipment);
    const firstLine = Array.isArray(plainShipment.orderLines) ? toPlain(plainShipment.orderLines[0]) : {};
    const vendor = toPlain(toPlain(firstLine.product).vendor);

    return {
      daysCounter: getDaysBetween(updated.startedAt, updated.completedAt),
      id: toNumber(updated.id),
      operationNumber: normalizeOperationCode(plainShipment.code),
      orderNumber: toText(plainShipment.orderNumber, toText(plainShipment.number, toText(plainShipment.name))),
      reason: toText(updated.reason),
      returnDate: toIsoString(updated.returnDate),
      returnType,
      returnTypeLabel: SHIPMENT_RETURN_TYPE_LABELS[returnType] ?? String(returnType),
      sellerName: toText(vendor.name),
      status: nextStatus,
      statusLabel: getReturnStatusLabel(returnType, nextStatus),
    };
  }

  public async listInventory(filters: InventoryListQuery, vendorId?: number | null): Promise<InventoryListResponse> {
    const whereClause: Record<string, unknown> = {};

    const rows = await shipmentInventoryModel.findAll({
      include: [
        {
          as: "product",
          include: [{ as: "vendor", model: vendorModel, required: false }],
          model: productModel,
          required: false,
        },
      ],
      order: [["updatedAt", "DESC"]],
      where: whereClause,
    });

    const items: InventoryItem[] = rows.map((row: unknown) => buildInventoryItem(row)).filter((item: InventoryItem) => {
      if (vendorId && item.vendorId !== vendorId) {
        return false;
      }
      if (filters.vendorName && !item.vendorName.toLowerCase().includes(filters.vendorName.toLowerCase())) {
        return false;
      }
      if (filters.productCode && !item.productCode.toLowerCase().includes(filters.productCode.toLowerCase())) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      return true;
    });

    const start = (filters.page - 1) * filters.size;
    const paginatedItems = items.slice(start, start + filters.size);

    return {
      items: paginatedItems,
      page: filters.page,
      size: filters.size,
      totalCount: items.length,
    };
  }

  public async createInventoryItem(payload: InventoryMutationInput): Promise<InventoryItem> {
    const product = await productModel.findByPk(payload.productId, {
      include: [{ as: "vendor", model: vendorModel, required: false }],
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const status = payload.status ?? (payload.quantity > 0 ? INVENTORY_STATUS.IN_STOCK : INVENTORY_STATUS.OUT_OF_STOCK);
    const createdItem = await shipmentInventoryModel.create({
      color: payload.color,
      costPrice: payload.costPrice,
      productCode: payload.productCode,
      productId: payload.productId,
      quantity: payload.quantity,
      size: payload.size,
      status,
    });
    createdItem.setDataValue("product", product);
    return buildInventoryItem(createdItem);
  }

  public async updateInventoryItem(inventoryItemId: number, payload: Partial<InventoryMutationInput>): Promise<InventoryItem | null> {
    const inventoryItem = await shipmentInventoryModel.findByPk(inventoryItemId);
    if (!inventoryItem) {
      return null;
    }

    let linkedProduct = null;
    if (payload.productId !== undefined) {
      linkedProduct = await productModel.findByPk(payload.productId, {
        include: [{ as: "vendor", model: vendorModel, required: false }],
      });
      if (!linkedProduct) {
        throw new NotFoundError("Product not found");
      }
    }

    const nextPayload = { ...payload };
    if (nextPayload.quantity !== undefined && nextPayload.status === undefined) {
      nextPayload.status = nextPayload.quantity > 0 ? INVENTORY_STATUS.IN_STOCK : INVENTORY_STATUS.OUT_OF_STOCK;
    }

    await inventoryItem.update(nextPayload);
    if (!linkedProduct) {
      linkedProduct = await productModel.findByPk(toNumber(inventoryItem.getDataValue("productId")), {
        include: [{ as: "vendor", model: vendorModel, required: false }],
      });
    }
    inventoryItem.setDataValue("product", linkedProduct);
    return buildInventoryItem(inventoryItem);
  }

  public async deleteInventoryItem(inventoryItemId: number): Promise<boolean> {
    const inventoryItem = await shipmentInventoryModel.findByPk(inventoryItemId);
    if (!inventoryItem) {
      return false;
    }

    await inventoryItem.destroy();
    return true;
  }

  public async listDeliveryAccounts(filters: DeliveryAccountsListQuery, vendorId?: number | null): Promise<DeliveryAccountsListResponse> {
    const whereClause: Record<string, unknown> = {
      shippedFromInventory: true,
      shipmentStatus: SHIPMENT_STATUS.DELIVERED,
    };

    const result = await orderModel.findAndCountAll({
      include: buildIncludes(),
      limit: filters.size,
      offset: (filters.page - 1) * filters.size,
      order: [["deliveryDate", "DESC"]],
      subQuery: false,
      where: {
        ...whereClause,
        ...(vendorId ? { "$orderLines.product.vendor.id$": vendorId } : {}),
      },
    });

    const items = result.rows.map((row: unknown) => {
      const order = toPlain(row);
      const firstLine = Array.isArray(order.orderLines) ? toPlain(order.orderLines[0]) : {};
      const product = toPlain(firstLine.product);
      const vendor = toPlain(product.vendor);
      const paymentStatus = toNumber(order.paymentStatus);
      const accountingStatus = paymentStatus === 2 ? ACCOUNTING_STATUS.SETTLED : ACCOUNTING_STATUS.PENDING;
      const deliveryBy = toNullableNumber(order.deliveryBy);

      return {
        accountingDate: toIsoString(order.updatedAt),
        accountingStatus,
        accountingStatusLabel: ACCOUNT_STATUS_LABELS[accountingStatus] ?? String(accountingStatus),
        amountToCollect: toNumber(order.toBeCollected || order.totalPrice),
        deliveryBy: toText(order.shippingCompany) || (deliveryBy ? DELIVERY_BY_LABELS[deliveryBy] ?? String(deliveryBy) : ""),
        deliveryDate: toIsoString(order.deliveryDate),
        operationNumber: normalizeOperationCode(order.code),
        orderNumber: toText(order.orderNumber, toText(order.number, toText(order.name))),
        paymentMethod: String(paymentStatus || ""),
        paymentMethodLabel: PAYMENT_STATUS_LABELS[paymentStatus] ?? "",
        productCode: toText(firstLine.sku),
        reference: toText(order.shopifyId),
        sellerName: toText(vendor.name),
        sellingPrice: toNumber(firstLine.price) * Math.max(1, toNumber(firstLine.quantity)),
        shippingCost: toNumber(order.shippingFees),
      } satisfies DeliveryAccountItem;
    }).filter((item: DeliveryAccountItem) => {
      if (filters.orderNumber && !item.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) {
        return false;
      }
      if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) {
        return false;
      }
      if (filters.accountingStatus && item.accountingStatus !== filters.accountingStatus) {
        return false;
      }
      return true;
    });

    return {
      items,
      page: filters.page,
      size: filters.size,
      totalCount: items.length,
    };
  }

  public async listExpenseAccounts(filters: ExpenseAccountsListQuery): Promise<ExpenseAccountsListResponse> {
    const rows = await shipmentExpenseModel.findAll({
      order: [["accountingDate", "DESC"], ["createdAt", "DESC"]],
    });
    const items: ExpenseAccountItem[] = rows.map((row: unknown) => {
      const item = toPlain(row);
      const accountingStatus = toNumber(item.accountingStatus) || ACCOUNTING_STATUS.PENDING;
      return {
        accountingDate: toIsoString(item.accountingDate),
        accountingStatus,
        accountingStatusLabel: EXPENSE_STATUS_LABELS[accountingStatus] ?? String(accountingStatus),
        amount: toNumber(item.amount),
        id: toNumber(item.id),
        reason: toText(item.reason),
        type: toText(item.type),
      };
    });
    const filteredItems = items.filter((item: ExpenseAccountItem) => {
      if (filters.type && item.type !== filters.type) {
        return false;
      }
      if (filters.accountingStatus && item.accountingStatus !== filters.accountingStatus) {
        return false;
      }
      return true;
    });

    return {
      items: filteredItems,
      page: filters.page,
      size: filters.size,
      totalCount: filteredItems.length,
    };
  }

  public async createExpenseAccount(payload: ExpenseMutationInput): Promise<ExpenseAccountItem> {
    const createdExpense = await shipmentExpenseModel.create({
      accountingDate: payload.accountingDate || null,
      accountingStatus: payload.accountingStatus ?? ACCOUNTING_STATUS.PENDING,
      amount: payload.amount,
      reason: payload.reason,
      type: payload.type,
    });
    const expense = toPlain(createdExpense);
    const accountingStatus = toNumber(expense.accountingStatus) || ACCOUNTING_STATUS.PENDING;
    return {
      accountingDate: toIsoString(expense.accountingDate),
      accountingStatus,
      accountingStatusLabel: EXPENSE_STATUS_LABELS[accountingStatus] ?? String(accountingStatus),
      amount: toNumber(expense.amount),
      id: toNumber(expense.id),
      reason: toText(expense.reason),
      type: toText(expense.type),
    };
  }

  public async updateExpenseAccount(expenseId: number, payload: Partial<ExpenseMutationInput>): Promise<ExpenseAccountItem | null> {
    const expenseRecord = await shipmentExpenseModel.findByPk(expenseId);
    if (!expenseRecord) {
      return null;
    }

    await expenseRecord.update({
      ...payload,
      ...(payload.accountingDate !== undefined ? { accountingDate: payload.accountingDate || null } : {}),
    });
    const expense = toPlain(expenseRecord);
    const accountingStatus = toNumber(expense.accountingStatus) || ACCOUNTING_STATUS.PENDING;
    return {
      accountingDate: toIsoString(expense.accountingDate),
      accountingStatus,
      accountingStatusLabel: EXPENSE_STATUS_LABELS[accountingStatus] ?? String(accountingStatus),
      amount: toNumber(expense.amount),
      id: toNumber(expense.id),
      reason: toText(expense.reason),
      type: toText(expense.type),
    };
  }

  public async deleteExpenseAccount(expenseId: number): Promise<boolean> {
    const expenseRecord = await shipmentExpenseModel.findByPk(expenseId);
    if (!expenseRecord) {
      return false;
    }

    await expenseRecord.destroy();
    return true;
  }

  public async getPerformance(filters: PerformanceQuery, vendorId?: number | null): Promise<PerformanceResponse> {
    const dateColumn = "deliveryDate";
    const whereClause: Record<string, unknown> = {
      shippedFromInventory: true,
      shipmentStatus: SHIPMENT_STATUS.DELIVERED,
      ...(vendorId ? { "$orderLines.product.vendor.id$": vendorId } : {}),
    };

    if (filters.startDate) {
      whereClause[dateColumn] = { ...(whereClause[dateColumn] as Record<string, unknown> ?? {}), [Op.gte]: new Date(`${filters.startDate}T00:00:00.000Z`) };
    }
    if (filters.endDate) {
      whereClause[dateColumn] = { ...(whereClause[dateColumn] as Record<string, unknown> ?? {}), [Op.lte]: new Date(`${filters.endDate}T23:59:59.999Z`) };
    }

    const orders = await orderModel.findAll({
      include: buildIncludes(),
      order: [["deliveryDate", "ASC"]],
      subQuery: false,
      where: whereClause,
    });

    const items: ShipmentListItem[] = orders.map((order: unknown) => mapShipmentListItem(order));
    const chartMap = new Map<string, number>();
    const providerMap = new Map<string, { deliveredOrdersCount: number; totalDays: number; totalGmv: number }>();

    for (const item of items) {
      const deliveryDate = item.deliveryDate ? new Date(item.deliveryDate) : null;
      const label = deliveryDate
        ? (filters.period === "monthly"
          ? deliveryDate.toISOString().slice(0, 7)
          : deliveryDate.toISOString().slice(0, 10))
        : "غير محدد";
      chartMap.set(label, (chartMap.get(label) ?? 0) + 1);

      const providerKey = item.deliveryBy || "غير محدد";
      const providerValue = providerMap.get(providerKey) ?? { deliveredOrdersCount: 0, totalDays: 0, totalGmv: 0 };
      providerValue.deliveredOrdersCount += 1;
      providerValue.totalDays += item.daysCounter ?? 0;
      providerValue.totalGmv += item.amountToCollect;
      providerMap.set(providerKey, providerValue);
    }

    const deliveredOrdersCount = items.length;
    const totalGmv = items.reduce((sum: number, item: ShipmentListItem) => sum + item.amountToCollect, 0);
    const averageDeliveryDays = items.length > 0
      ? Math.round((items.reduce((sum: number, item: ShipmentListItem) => sum + (item.daysCounter ?? 0), 0) / items.length) * 10) / 10
      : 0;

    return {
      chart: Array.from(chartMap.entries()).map(([label, deliveredOrdersCountValue]) => ({
        deliveredOrdersCount: deliveredOrdersCountValue,
        label,
      })),
      overview: {
        averageDeliveryDays,
        deliveredOrdersCount,
        totalGmv,
      },
      providers: Array.from(providerMap.entries()).map(([deliveryBy, providerValue]) => ({
        averageDeliveryDays: providerValue.deliveredOrdersCount > 0
          ? Math.round((providerValue.totalDays / providerValue.deliveredOrdersCount) * 10) / 10
          : 0,
        deliveredOrdersCount: providerValue.deliveredOrdersCount,
        deliveryBy,
        returnsCount: 0,
        successRate: 100,
        totalGmv: providerValue.totalGmv,
      })),
    };
  }

  public async updateShipment(shipmentId: number, payload: Record<string, unknown>): Promise<unknown | null> {
    const shipment = await orderModel.findByPk(shipmentId);
    if (!shipment) {
      return null;
    }

    const nextPayload = { ...payload };
    for (const key of ["shippingReceiveDate", "deliveryDate"]) {
      if (nextPayload[key] === "") {
        nextPayload[key] = null;
      }
    }

    await shipment.update(nextPayload);
    return shipment;
  }

  public async deleteShipment(shipmentId: number): Promise<boolean> {
    const shipment = await orderModel.findByPk(shipmentId);
    if (!shipment) {
      return false;
    }

    await shipment.destroy();
    return true;
  }

  public async findNoteById(noteId: number): Promise<unknown | null> {
    return noteModel.findByPk(noteId);
  }

  public async createShipmentNote(shipmentId: number, text: string, userId: number): Promise<ShipmentNote> {
    const createdNote = await noteModel.create({
      entityId: shipmentId,
      entityType: "shipment",
      text,
      userId,
    });

    return mapShipmentNote(createdNote);
  }

  public async updateShipmentNote(noteId: number, text: string): Promise<ShipmentNote | null> {
    const note = await noteModel.findByPk(noteId);
    if (!note) {
      return null;
    }

    note.text = text;
    await note.save();

    return mapShipmentNote(note);
  }

  public async deleteShipmentNote(noteId: number): Promise<boolean> {
    const note = await noteModel.findByPk(noteId);
    if (!note) {
      return false;
    }

    await note.destroy();
    return true;
  }
}
