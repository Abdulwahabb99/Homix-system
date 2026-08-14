import { Op, fn, col, where } from "sequelize";

import { sequelize } from "../../infrastructure/database";
import { ConflictError, NotFoundError } from "../../shared/errors";
import { buildLogMessage } from "../orders/order.helpers";
import { ORDER_SOURCE_ARABIC, ORDER_SOURCE, PAYMENT_STATUS, SHIPMENT_SCHEDULE_STATUS_ARABIC } from "../../../config/constants";
import {
  ACCOUNTING_STATUS,
  ACCOUNT_STATUS_LABELS,
  CUSTOMER_RETURN_FINAL_STATUSES,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DELIVERY_BY_LABELS,
  CUSTOMER_RETURN_STATUS,
  EXPENSE_TYPE_LABELS,
  EXPENSE_STATUS_LABELS,
  GOVERNORATE_LABELS,
  INVENTORY_STATUS,
  INVENTORY_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  RETURN_TO_VENDOR_FINAL_STATUSES,
  RETURN_TO_VENDOR_STATUS,
  RETURN_TO_VENDOR_STATUS_LABELS,
  SHIPMENT_SCHEDULE_STATUS_LABELS,
  SHIPMENT_PRIORITY_LABELS,
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
  SHIPMENT_NUMBER_PREFIX,
  getDaysBetween,
  getShipmentAgingDays,
  getShipmentPriorityLabel,
  resolveShipmentDeliveryStatus,
  resolveShipmentPriority,
  getShipmentStatusLabel,
  getShipmentTypeLabel,
  getVariantBySku,
  normalizeOperationCode,
  toDateRangeBoundary,
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
  ShippingCompanyItem,
  ShippingCompanyListResponse,
  ShippingCompanyMutationInput,
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
const shippingCompanyModel = require("../../../app/modules/shipments/shippingCompany.model");
const ORDER_SOURCE_LABELS = ORDER_SOURCE_ARABIC as Record<number, string>;
const SHIPMENT_SCHEDULE_LABELS = SHIPMENT_SCHEDULE_STATUS_ARABIC as Record<number, string>;
const SHIPMENT_SORTABLE_FIELDS = ["orderDate", "priority", "subTotalPrice", "totalPrice"] as const;

type ShipmentSortField = (typeof SHIPMENT_SORTABLE_FIELDS)[number];
type ShipmentSortDirection = 1 | -1;
type ShipmentSortEntry = [ShipmentSortField, ShipmentSortDirection];

const getShipmentCollectionAmount = (order: Record<string, unknown>): number => (
  toNumber(order.paymentStatus) === PAYMENT_STATUS.PAID ? 0 : toNumber(order.toBeCollected || order.totalPrice)
);

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

  // Shipment numbers are derived (SH + order number), so the filter is applied
  // against the order number with the SH prefix stripped off.
  if (filters.shipmentNumber) {
    const orderNumberPart = filters.shipmentNumber
      .trim()
      .replace(new RegExp(`^${SHIPMENT_NUMBER_PREFIX}`, "i"), "")
      .toLowerCase();

    if (orderNumberPart) {
      andConditions.push({
        [Op.or]: [
          where(fn("lower", col("Order.name")), { [Op.like]: `%${orderNumberPart}%` }),
          where(fn("lower", col("Order.number")), { [Op.like]: `%${orderNumberPart}%` }),
          where(fn("lower", col("Order.orderNumber")), { [Op.like]: `%${orderNumberPart}%` }),
        ],
      });
    }
  }

  if (filters.orderSource) {
    andConditions.push(where(col("Order.orderSource"), {
      [Op.in]: filters.orderSource.split(",").map(Number),
    }));
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

  if (filters.scheduleStatus) {
    andConditions.push(where(col("Order.scheduleStatus"), {
      [Op.in]: filters.scheduleStatus.split(",").map(Number),
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
    andConditions.push(where(col("Order.deliveryBy"), { [Op.in]: filters.deliveryBy.split(",").map(Number) }));
  }

  if (filters.startDate) {
    const startDate = toDateRangeBoundary(filters.startDate, "start");
    if (startDate) {
      andConditions.push(where(col("Order.shippingReceiveDate"), { [Op.gte]: startDate }));
    }
  }

  if (filters.endDate) {
    const endDate = toDateRangeBoundary(filters.endDate, "end");
    if (endDate) {
      andConditions.push(where(col("Order.shippingReceiveDate"), { [Op.lte]: endDate }));
    }
  }

  if (filters.deliveryDateFrom) {
    const deliveryDateFrom = toDateRangeBoundary(filters.deliveryDateFrom, "start");
    if (deliveryDateFrom) {
      andConditions.push(where(col("Order.deliveryDate"), { [Op.gte]: deliveryDateFrom }));
    }
  }

  if (filters.deliveryDateTo) {
    const deliveryDateTo = toDateRangeBoundary(filters.deliveryDateTo, "end");
    if (deliveryDateTo) {
      andConditions.push(where(col("Order.deliveryDate"), { [Op.lte]: deliveryDateTo }));
    }
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
    as: "shippingCompanyRecord",
    attributes: ["id", "name"],
    model: shippingCompanyModel,
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
  const shippingCompanyRecord = toPlain(order.shippingCompanyRecord);
  const deliveryBy = toNullableNumber(order.deliveryBy);
  const shippingCompanyName = toText(shippingCompanyRecord.name, toText(order.shippingCompany));
  const deliveryStatus = resolveShipmentDeliveryStatus(order.deliveryStatus, order.expectedDeliveryDate);
  const deliveryPriority = resolveShipmentPriority(order.priority, order.deliveryStatus, order.expectedDeliveryDate);

  return {
    assigneeId: toNullableNumber(order.userId),
    amountToCollect: getShipmentCollectionAmount(order),
    customerName: `${toText(customer.firstName)} ${toText(customer.lastName)}`.trim(),
    customerPhone: toText(customer.phoneNumber),
    daysCounter: getShipmentAgingDays(order.shipmentStatus, order.shippingReceiveDate, order.deliveryDate, order.updatedAt),
    deliveryBy,
    deliveryByLabel: deliveryBy ? DELIVERY_BY_LABELS[deliveryBy] ?? String(deliveryBy) : "",
    deliveryPriority,
    deliveryPriorityLabel: getShipmentPriorityLabel(deliveryPriority),
    deliveryStatus,
    priority: deliveryPriority,
    priorityLabel: getShipmentPriorityLabel(deliveryPriority),
    deliveryDate: toIsoString(order.deliveryDate),
    governorate: toText(order.governorate),
    id: toNumber(order.id),
    operationNumber: normalizeOperationCode(order.code),
    orderSource: toNullableNumber(order.orderSource),
    orderSourceLabel: ORDER_SOURCE_LABELS[toNumber(order.orderSource)] ?? "",
    orderNumber: toText(order.orderNumber, toText(order.number, toText(order.name))),
    paymentStatus: toNullableNumber(order.paymentStatus),
    paymentStatusLabel: PAYMENT_STATUS_LABELS[toNumber(order.paymentStatus)] ?? "",
    receivedInWarehouseDate: toIsoString(order.shippingReceiveDate),
    scheduledDeliveryDate: toIsoString(order.expectedDeliveryDate),
    scheduleStatus: toNullableNumber(order.scheduleStatus),
    scheduleStatusLabel: SHIPMENT_SCHEDULE_LABELS[toNumber(order.scheduleStatus)] ?? "",
    sellerName: toText(vendor.name),
    shippingCompany: toNullableNumber(shippingCompanyRecord.id),
    shippingCompanyName,
    shipmentNumber: buildShipmentNumber(order),
    shipmentStatus: toNullableNumber(order.shipmentStatus),
    shipmentStatusLabel: getShipmentStatusLabel(order.shipmentStatus),
    shipmentType: toText(order.shipmentType),
    shipmentTypeLabel: getShipmentTypeLabel(order.shipmentType),
    shippingCost: toNumber(order.shippingFees),
  };
};

const matchesShipmentPriority = (item: ShipmentListItem, priorityFilter?: string): boolean => {
  if (!priorityFilter) {
    return true;
  }

  return priorityFilter
    .split(",")
    .map((value) => Number(value.trim()))
    .includes(item.deliveryPriority ?? 0);
};

const matchesShipmentDeliveryStatus = (item: ShipmentListItem, deliveryStatusFilter?: string): boolean => {
  if (!deliveryStatusFilter) {
    return true;
  }

  return deliveryStatusFilter
    .split(",")
    .map((value) => Number(value.trim()))
    .includes(item.deliveryStatus ?? 0);
};

const getShipmentSortEntries = (sort?: ShipmentListQuery["sort"]): ShipmentSortEntry[] => {
  if (!sort) {
    return [];
  }

  return SHIPMENT_SORTABLE_FIELDS.flatMap((field) => {
    const direction = sort[field];
    return direction === 1 || direction === -1 ? [[field, direction] satisfies ShipmentSortEntry] : [];
  });
};

const getShipmentSortValue = (
  field: ShipmentSortField,
  entry: { item: ShipmentListItem; row: Record<string, unknown> },
): number => {
  if (field === "priority") {
    return entry.item.deliveryPriority ?? 0;
  }

  if (field === "orderDate") {
    const timestamp = new Date(toIsoString(entry.row.orderDate) ?? "").getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  return toNumber(entry.row[field]);
};

const compareShipmentEntries = (
  left: { item: ShipmentListItem; row: Record<string, unknown> },
  right: { item: ShipmentListItem; row: Record<string, unknown> },
  sortEntries: ShipmentSortEntry[],
): number => {
  for (const [field, direction] of sortEntries) {
    const leftValue = getShipmentSortValue(field, left);
    const rightValue = getShipmentSortValue(field, right);
    if (leftValue === rightValue) {
      continue;
    }

    return direction === -1 ? rightValue - leftValue : leftValue - rightValue;
  }

  return right.item.id - left.item.id;
};

const buildShipmentSort = (sortEntries: ShipmentSortEntry[]): Array<[string, "ASC" | "DESC"]> => {
  const databaseEntries = sortEntries
    .filter(([field]) => field !== "priority")
    .map(([field, direction]) => [field, direction === -1 ? "DESC" : "ASC"] as [string, "ASC" | "DESC"]);

  return databaseEntries.length > 0 ? databaseEntries : [["shippingReceiveDate", "DESC"]];
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

const mapTimeline = (
  logs: unknown[],
  userNamesById: Record<string, string> = {},
  vendorNamesById: Record<string, string> = {},
  shippingCompanyNamesById: Record<string, string> = {},
) =>
  logs.map((logValue) => {
    const log = toPlain(logValue);
    const userName = userNamesById[String(toNumber(log.userId))] ?? "";
    return {
      changedAt: toIsoString(log.createdAt) ?? "",
      id: toNumber(log.id),
      message: buildLogMessage(log, { shippingCompanyNamesById, userNamesById, vendorNamesById }),
      userName,
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

const mapShippingCompanyItem = (companyValue: unknown): ShippingCompanyItem => {
  const company = toPlain(companyValue);

  return {
    createdAt: toIsoString(company.createdAt) ?? "",
    id: toNumber(company.id),
    name: toText(company.name),
    updatedAt: toIsoString(company.updatedAt) ?? "",
  };
};

export class ShipmentRepository {
  public async findShipmentEntity(shipmentId: number): Promise<unknown | null> {
    return orderModel.findByPk(shipmentId);
  }

  public async findReturnById(returnId: number): Promise<unknown | null> {
    return shipmentReturnModel.findByPk(returnId);
  }

  public async findShippingCompanyById(shippingCompanyId: number): Promise<unknown | null> {
    return shippingCompanyModel.findByPk(shippingCompanyId);
  }

  public async normalizeShippingCompanyPayload(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const nextPayload = { ...payload };
    const rawShippingCompany = nextPayload.shippingCompany;
    const normalizedShippingCompanyId = rawShippingCompany === undefined || rawShippingCompany === ""
      ? null
      : toNullableNumber(rawShippingCompany);

    if (normalizedShippingCompanyId) {
      const company = await this.findShippingCompanyById(normalizedShippingCompanyId);
      if (!company) {
        throw new NotFoundError("Shipping company not found");
      }

      const plainCompany = toPlain(company);
      nextPayload.shippingCompany = toText(plainCompany.name);
      return nextPayload;
    }

    if (rawShippingCompany === null || rawShippingCompany === "") {
      nextPayload.shippingCompany = null;
    }

    return nextPayload;
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
    const shippingCompanies = await shippingCompanyModel.findAll({
      order: [["name", "ASC"]],
    });

    return {
      deliveryByOptions: Object.entries(DELIVERY_BY_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      accountingStatuses: Object.entries(ACCOUNT_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      customerReturnStatuses: Object.entries(CUSTOMER_RETURN_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      expenseTypes: Object.entries(EXPENSE_TYPE_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      governorates: Object.entries(GOVERNORATE_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      inventoryStatuses: Object.entries(INVENTORY_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      orderSources: Object.entries(ORDER_SOURCE).map(([, id]) => ({ id: Number(id), label: ORDER_SOURCE_LABELS[Number(id)] ?? String(id) })),
      paymentStatuses: Object.entries(PAYMENT_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      priorities: Object.entries(SHIPMENT_PRIORITY_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      scheduleStatuses: Object.entries(SHIPMENT_SCHEDULE_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
      shippingCompanies: shippingCompanies.map((company: unknown) => ({ id: toNumber(toPlain(company).id), label: toText(toPlain(company).name) })),
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
      vendorReturnStatuses: Object.entries(RETURN_TO_VENDOR_STATUS_LABELS).map(([id, label]) => ({ id: Number(id), label })),
    };
  }

  public async getSummary(filters: Omit<ShipmentListQuery, "page" | "size">, vendorId?: number | null): Promise<ShipmentSummaryResponse> {
    const whereClause = buildShipmentWhereClause(filters, vendorId);
    const orders = await orderModel.findAll({
      include: buildIncludes(),
      subQuery: false,
      where: whereClause,
    });
    const items: ShipmentListItem[] = orders
      .map((order: unknown) => mapShipmentListItem(order))
      .filter((item: ShipmentListItem) => matchesShipmentPriority(item, filters.priority))
      .filter((item: ShipmentListItem) => matchesShipmentDeliveryStatus(item, filters.deliveryStatus));
    const deliveredCount = items.filter((item: ShipmentListItem) => item.shipmentStatus === SHIPMENT_STATUS.DELIVERED).length;
    const inDeliveryStatuses = [
      SHIPMENT_STATUS.READY_FOR_SHIPPING,
      SHIPMENT_STATUS.SCHEDULED,
      SHIPMENT_STATUS.OUT_FOR_DELIVERY,
    ];
    const inDeliveryCount = items.filter((item: ShipmentListItem) =>
      inDeliveryStatuses.some((status) => status === (item.shipmentStatus ?? 0))).length;
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
    const sortEntries = getShipmentSortEntries(filters.sort);

    if (filters.priority || filters.deliveryStatus || sortEntries.some(([field]) => field === "priority")) {
      const rows = await orderModel.findAll({
        include: buildIncludes(),
        order: buildShipmentSort(sortEntries),
        subQuery: false,
        where: whereClause,
      });
      const filteredItems = rows
        .map((row: unknown) => ({ item: mapShipmentListItem(row), row: toPlain(row) }))
        .filter(({ item }: { item: ShipmentListItem; row: Record<string, unknown> }) => matchesShipmentPriority(item, filters.priority))
        .filter(({ item }: { item: ShipmentListItem; row: Record<string, unknown> }) => matchesShipmentDeliveryStatus(item, filters.deliveryStatus));
      if (sortEntries.length > 0) {
        filteredItems.sort(
          (
            left: { item: ShipmentListItem; row: Record<string, unknown> },
            right: { item: ShipmentListItem; row: Record<string, unknown> },
          ) => compareShipmentEntries(left, right, sortEntries),
        );
      }
      const start = (filters.page - 1) * filters.size;
      const end = start + filters.size;

      return {
        items: filteredItems.slice(start, end).map(({ item }: { item: ShipmentListItem; row: Record<string, unknown> }) => item),
        page: filters.page ?? DEFAULT_PAGE_NUMBER,
        size: filters.size ?? DEFAULT_PAGE_SIZE,
        totalCount: filteredItems.length,
      };
    }

    const result = await orderModel.findAndCountAll({
      include: buildIncludes(),
      limit: filters.size,
      offset: (filters.page - 1) * filters.size,
      order: buildShipmentSort(sortEntries),
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
    const usersResult = await userModel.findAll({
      attributes: ["firstName", "id", "lastName"],
      where: { id: { [Op.in]: logs.map((log: unknown) => toNumber(toPlain(log).userId)).filter(Boolean) } },
    });
    const users = Array.isArray(usersResult) ? usersResult : [];
    const userNamesById = Object.fromEntries(users.map((user: unknown) => {
      const plainUser = toPlain(user);
      return [String(toNumber(plainUser.id)), `${toText(plainUser.firstName)} ${toText(plainUser.lastName)}`.trim()];
    }));
    const vendorIds = logs
      .map((log: unknown) => toPlain(log))
      .filter((log: Record<string, unknown>) => toText(log.field) === "vendorId")
      .flatMap((log: Record<string, unknown>) => [toNumber(log.from), toNumber(log.to)])
      .filter((id: number) => id > 0);
    const vendorsResult = vendorIds.length > 0
      ? await vendorModel.findAll({ attributes: ["id", "name"], where: { id: { [Op.in]: vendorIds } } })
      : [];
    const vendors = Array.isArray(vendorsResult) ? vendorsResult : [];
    const vendorNamesById = Object.fromEntries(vendors.map((vendor: unknown) => {
      const plainVendor = toPlain(vendor);
      return [String(toNumber(plainVendor.id)), toText(plainVendor.name)];
    }));
    const shippingCompanyIds = logs
      .map((log: unknown) => toPlain(log))
      .filter((log: Record<string, unknown>) => toText(log.field) === "shippingCompany")
      .flatMap((log: Record<string, unknown>) => [toNumber(log.from), toNumber(log.to)])
      .filter((id: number) => id > 0);
    const shippingCompaniesResult = shippingCompanyIds.length > 0
      ? await shippingCompanyModel.findAll({ attributes: ["id", "name"], where: { id: { [Op.in]: shippingCompanyIds } } })
      : [];
    const shippingCompanies = Array.isArray(shippingCompaniesResult) ? shippingCompaniesResult : [];
    const shippingCompanyNamesById = Object.fromEntries(shippingCompanies.map((company: unknown) => {
      const plainCompany = toPlain(company);
      return [String(toNumber(plainCompany.id)), toText(plainCompany.name)];
    }));
    return {
      customer: {
        address: toText(customer.address),
        name: `${toText(customer.firstName)} ${toText(customer.lastName)}`.trim(),
        phoneNumber: toText(customer.phoneNumber),
      },
      financial: {
        amountToCollect: getShipmentCollectionAmount(order),
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
          variant: {
            color: toText(variant?.option2, toText(line.color)),
            id: toText(variant?.shopifyId, toText(variant?.id, toText(line.variant_id))),
            inventoryQuantity: toNumber(variant?.inventory_quantity) || null,
            material: toText(variant?.option3),
            price: toNumber(variant?.price),
            size: toText(variant?.option1, toText(line.size)),
            sku: toText(variant?.sku, toText(line.sku)),
            title: toText(variant?.title),
          },
          vendorName: toText(vendor.name),
        };
      }),
      shipment: {
        ...mapShipmentListItem(order),
        shippedFromInventory: Boolean(order.shippedFromInventory),
        shippingCompanyName: toText(toPlain(order.shippingCompanyRecord).name, toText(order.shippingCompany)),
      },
      timeline: mapTimeline(logs, userNamesById, vendorNamesById, shippingCompanyNamesById),
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
        deliveryBy: toText(toPlain(order.shippingCompanyRecord).name, toText(order.shippingCompany))
          || (deliveryBy ? DELIVERY_BY_LABELS[deliveryBy] ?? String(deliveryBy) : ""),
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
      const type = toNumber(item.type);
      return {
        accountingDate: toIsoString(item.accountingDate),
        accountingStatus,
        accountingStatusLabel: EXPENSE_STATUS_LABELS[accountingStatus] ?? String(accountingStatus),
        amount: toNumber(item.amount),
        id: toNumber(item.id),
        reason: toText(item.reason),
        type,
        typeLabel: EXPENSE_TYPE_LABELS[type] ?? String(type),
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

  public async listShippingCompanies(search?: string): Promise<ShippingCompanyListResponse> {
    const companies = await shippingCompanyModel.findAll({
      order: [["name", "ASC"]],
      where: search
        ? where(fn("lower", col("ShippingCompany.name")), { [Op.like]: `%${search.toLowerCase()}%` })
        : undefined,
    });

    return {
      items: companies.map((company: unknown) => mapShippingCompanyItem(company)),
    };
  }

  public async createShippingCompany(payload: ShippingCompanyMutationInput): Promise<ShippingCompanyItem> {
    const existingCompany = await shippingCompanyModel.findOne({
      where: where(fn("lower", col("ShippingCompany.name")), { [Op.eq]: payload.name.toLowerCase() }),
    });
    if (existingCompany) {
      throw new ConflictError("Shipping company already exists");
    }

    const company = await shippingCompanyModel.create({ name: payload.name });
    return mapShippingCompanyItem(company);
  }

  public async updateShippingCompany(
    shippingCompanyId: number,
    payload: ShippingCompanyMutationInput,
  ): Promise<ShippingCompanyItem | null> {
    const company = await shippingCompanyModel.findByPk(shippingCompanyId);
    if (!company) {
      return null;
    }

    const existingCompany = await shippingCompanyModel.findOne({
      where: {
        [Op.and]: [
          where(fn("lower", col("ShippingCompany.name")), { [Op.eq]: payload.name.toLowerCase() }),
          { id: { [Op.ne]: shippingCompanyId } },
        ],
      },
    });
    if (existingCompany) {
      throw new ConflictError("Shipping company already exists");
    }

    const previousName = toText(toPlain(company).name);
    await company.update({ name: payload.name });
    await orderModel.update(
      { shippingCompany: payload.name },
      { where: { shippingCompany: previousName } },
    );

    return mapShippingCompanyItem(company);
  }

  public async deleteShippingCompany(shippingCompanyId: number): Promise<boolean> {
    const company = await shippingCompanyModel.findByPk(shippingCompanyId);
    if (!company) {
      return false;
    }

    const companyName = toText(toPlain(company).name);
    const linkedOrdersCount = await orderModel.count({
      where: { shippingCompany: companyName },
    });
    if (linkedOrdersCount > 0) {
      throw new ConflictError("Shipping company is linked to shipments");
    }

    await company.destroy();
    return true;
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
      type: toNumber(expense.type),
      typeLabel: EXPENSE_TYPE_LABELS[toNumber(expense.type)] ?? String(expense.type),
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
      type: toNumber(expense.type),
      typeLabel: EXPENSE_TYPE_LABELS[toNumber(expense.type)] ?? String(expense.type),
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
      const startDate = toDateRangeBoundary(filters.startDate, "start");
      if (startDate) {
        whereClause[dateColumn] = { ...(whereClause[dateColumn] as Record<string, unknown> ?? {}), [Op.gte]: startDate };
      }
    }
    if (filters.endDate) {
      const endDate = toDateRangeBoundary(filters.endDate, "end");
      if (endDate) {
        whereClause[dateColumn] = { ...(whereClause[dateColumn] as Record<string, unknown> ?? {}), [Op.lte]: endDate };
      }
    }

    const orders = await orderModel.findAll({
      include: buildIncludes(),
      order: [["deliveryDate", "ASC"]],
      subQuery: false,
      where: whereClause,
    });

    const items: ShipmentListItem[] = orders.map((order: unknown) => mapShipmentListItem(order));
    const chartMap = new Map<string, number>();
    const providerMap = new Map<string, {
      deliveredOrdersCount: number;
      deliveryBy: number | null;
      deliveryByLabel: string;
      shippingCompanyName: string;
      totalDays: number;
      totalGmv: number;
    }>();
    const vendorMap = new Map<string, {
      deliveredOrdersCount: number;
      sellerName: string;
      totalDays: number;
      totalGmv: number;
    }>();

    for (const item of items) {
      const deliveryDate = item.deliveryDate ? new Date(item.deliveryDate) : null;
      const label = deliveryDate
        ? (filters.period === "monthly"
          ? deliveryDate.toISOString().slice(0, 7)
          : deliveryDate.toISOString().slice(0, 10))
        : "غير محدد";
      chartMap.set(label, (chartMap.get(label) ?? 0) + 1);

      const providerKey = `${item.deliveryBy ?? "null"}::${item.shippingCompanyName || ""}`;
      const providerValue = providerMap.get(providerKey) ?? {
        deliveredOrdersCount: 0,
        deliveryBy: item.deliveryBy,
        deliveryByLabel: item.deliveryByLabel,
        shippingCompanyName: item.shippingCompanyName,
        totalDays: 0,
        totalGmv: 0,
      };
      providerValue.deliveredOrdersCount += 1;
      providerValue.totalDays += item.daysCounter ?? 0;
      providerValue.totalGmv += item.amountToCollect;
      providerMap.set(providerKey, providerValue);

      const vendorKey = item.sellerName || "غير محدد";
      const vendorValue = vendorMap.get(vendorKey) ?? {
        deliveredOrdersCount: 0,
        sellerName: item.sellerName || "غير محدد",
        totalDays: 0,
        totalGmv: 0,
      };
      vendorValue.deliveredOrdersCount += 1;
      vendorValue.totalDays += item.daysCounter ?? 0;
      vendorValue.totalGmv += item.amountToCollect;
      vendorMap.set(vendorKey, vendorValue);
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
      providers: Array.from(providerMap.values()).map((providerValue) => ({
        averageDeliveryDays: providerValue.deliveredOrdersCount > 0
          ? Math.round((providerValue.totalDays / providerValue.deliveredOrdersCount) * 10) / 10
          : 0,
        deliveredOrdersCount: providerValue.deliveredOrdersCount,
        deliveryBy: providerValue.deliveryBy,
        deliveryByLabel: providerValue.deliveryByLabel,
        returnsCount: 0,
        shippingCompanyName: providerValue.shippingCompanyName,
        successRate: 100,
        totalGmv: providerValue.totalGmv,
      })),
      vendors: Array.from(vendorMap.values()).map((vendorValue) => ({
        averageDeliveryDays: vendorValue.deliveredOrdersCount > 0
          ? Math.round((vendorValue.totalDays / vendorValue.deliveredOrdersCount) * 10) / 10
          : 0,
        deliveredOrdersCount: vendorValue.deliveredOrdersCount,
        returnsCount: 0,
        sellerName: vendorValue.sellerName,
        successRate: 100,
        totalGmv: vendorValue.totalGmv,
      })),
    };
  }

  public async updateShipment(shipmentId: number, payload: Record<string, unknown>): Promise<unknown | null> {
    const shipment = await orderModel.findByPk(shipmentId);
    if (!shipment) {
      return null;
    }

    const nextPayload = await this.normalizeShippingCompanyPayload(payload);
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
