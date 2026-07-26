import moment from "moment-timezone";
import { Op } from "sequelize";

import {
  DELIVERY_BY,
  DELIVERY_BY_ARABIC,
  DELIVERY_STATUS,
  MANUFACTURE_STATUS_ARABIC,
  ORDER_SOURCE_ARABIC,
  ORDER_STATUS,
  ORDER_SOURCE,
  ORDER_STATUS_Arabic,
  PAYMENT_STATUS_ARABIC,
  SHIPMENTS_STATUS,
} from "../../../config/constants";
import { ACTIVE_VENDOR_ORDER_STATUSES, FINAL_ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_SUMMARY_STATUS_GROUPS } from "./order.constants";
import {
  buildLogMessage,
  getDaysSince,
  getDeliveryPriorityLabel,
  resolveDeliveryStatus,
  getHistoryActorLabel,
  resolveOrderPriority,
  getStatusLabel,
  getManufactureLabel,
  getPaymentLabel,
  toIsoString,
  toNumber,
  toPlain,
  toText,
} from "./order.helpers";
import type { OrderDetailsResponse, OrderDetailsView, OrderFinancialReportQuery, OrderFinancialReportResponse, OrderFinancialReportSection, OrderFinancialReportSectionSummary, OrderFinancialReportVendorRow, OrderListItem, OrderListQuery, OrderListResponse, OrderMetaResponse, OrderStatusHistoryItem, OrderSummaryResponse, OrderTimelineItem } from "./order.types";

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
const dashboardDailyMetricModel = require("../dashboard/dashboard-daily-metric.model");
const ORDER_SOURCE_LABELS = ORDER_SOURCE_ARABIC as Record<number, string>;
const ORDER_SORTABLE_FIELDS = ["orderDate", "priority", "subTotalPrice", "totalPrice"] as const;

type OrderSortField = (typeof ORDER_SORTABLE_FIELDS)[number];
type OrderSortDirection = 1 | -1;
type OrderSortEntry = [OrderSortField, OrderSortDirection];

const SUMMARY_AGGREGATE_UNSUPPORTED_FILTERS: Array<keyof OrderListQuery> = [
  "customerName",
  "deliveryBy",
  "deliveryStatus",
  "manufactureStatus",
  "operationCode",
  "orderSource",
  "orderNumber",
  "paymentStatus",
  "priority",
  "productCode",
  "status",
  "userId",
  "vendorName",
];

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
  if (filters.orderSource) {
    andConditions.push(sequelize.where(sequelize.col("Order.orderSource"), { [Op.in]: filters.orderSource.split(",").map(Number) }));
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

const parseCsvNumbers = (value?: string): number[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const getOrderSortEntries = (sort?: OrderListQuery["sort"]): OrderSortEntry[] => {
  if (!sort) {
    return [];
  }

  return ORDER_SORTABLE_FIELDS.flatMap((field) => {
    const direction = sort[field];
    return direction === 1 || direction === -1 ? [[field, direction] satisfies OrderSortEntry] : [];
  });
};

const getOrderSortValue = (
  field: OrderSortField,
  entry: { item: OrderListItem; row: Record<string, unknown> },
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

const compareOrderEntries = (
  left: { item: OrderListItem; row: Record<string, unknown> },
  right: { item: OrderListItem; row: Record<string, unknown> },
  sortEntries: OrderSortEntry[],
): number => {
  for (const [field, direction] of sortEntries) {
    const leftValue = getOrderSortValue(field, left);
    const rightValue = getOrderSortValue(field, right);
    if (leftValue === rightValue) {
      continue;
    }

    return direction === -1 ? rightValue - leftValue : leftValue - rightValue;
  }

  return right.item.id - left.item.id;
};

const buildOrderSort = (sortEntries: OrderSortEntry[]): Array<[string, "ASC" | "DESC"]> => {
  const databaseEntries = sortEntries
    .filter(([field]) => field !== "priority")
    .map(([field, direction]) => [field, direction === -1 ? "DESC" : "ASC"] as [string, "ASC" | "DESC"]);

  return databaseEntries.length > 0 ? databaseEntries : [["orderDate", "DESC"]];
};

const getOrderLineVariant = (lineValue: unknown): Record<string, unknown> => {
  const line = toPlain(lineValue);
  const product = toPlain(line.product);
  const variants = Array.isArray(product.variants) ? product.variants.map((variant) => toPlain(variant)) : [];

  return variants.find((variant) =>
    toText(variant.sku) === toText(line.sku)
    || toText(variant.shopifyId) === toText(line.variant_id)
    || toText(variant.id) === toText(line.variant_id)) ?? {};
};

const resolveAggregateScope = (
  filters: OrderListQuery,
  vendorId?: number | null,
): { role: "admin" | "vendor"; scopeId: number } | null => {
  if (vendorId) {
    const requestedVendorIds = parseCsvNumbers(filters.vendorId);
    if (requestedVendorIds.length > 0 && (requestedVendorIds.length !== 1 || requestedVendorIds[0] !== vendorId)) {
      return null;
    }

    return { role: "vendor", scopeId: vendorId };
  }

  const requestedVendorIds = parseCsvNumbers(filters.vendorId);
  if (requestedVendorIds.length === 0) {
    return { role: "admin", scopeId: 0 };
  }

  if (requestedVendorIds.length !== 1) {
    return null;
  }

  return { role: "vendor", scopeId: requestedVendorIds[0] ?? 0 };
};

const canUseAggregateSummary = (filters: OrderListQuery, vendorId?: number | null): boolean => {
  if (!filters.startDate || !filters.endDate) {
    return false;
  }

  if (SUMMARY_AGGREGATE_UNSUPPORTED_FILTERS.some((key) => Boolean(filters[key]))) {
    return false;
  }

  return Boolean(resolveAggregateScope(filters, vendorId));
};

const isValidDate = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  return moment(value).isValid();
};

const clampDayToMonth = (value: moment.Moment, dayOfMonth: number): moment.Moment =>
  value.clone().date(Math.min(dayOfMonth, value.daysInMonth()));

const resolveFinancialCycleRange = (
  billingDayInput?: 13 | 28,
  referenceDateInput?: string,
): {
  billingDay: 13 | 28;
  end: moment.Moment;
  reference: moment.Moment;
  start: moment.Moment;
} => {
  const reference = isValidDate(referenceDateInput)
    ? moment.tz(referenceDateInput, "Africa/Cairo")
    : moment().tz("Africa/Cairo");

  let cycleEnd: moment.Moment;
  if (billingDayInput === 13 || billingDayInput === 28) {
    const currentMonthEnd = clampDayToMonth(reference.clone(), billingDayInput).endOf("day");
    cycleEnd = reference.isBefore(currentMonthEnd.clone().startOf("day"))
      ? clampDayToMonth(reference.clone().subtract(1, "month"), billingDayInput).endOf("day")
      : currentMonthEnd;
  } else if (reference.date() >= 29) {
    cycleEnd = clampDayToMonth(reference.clone(), 28).endOf("day");
  } else if (reference.date() >= 14) {
    cycleEnd = clampDayToMonth(reference.clone(), 13).endOf("day");
  } else {
    cycleEnd = clampDayToMonth(reference.clone().subtract(1, "month"), 28).endOf("day");
  }

  const billingDay = cycleEnd.date() === 13 ? 13 : 28;
  const cycleStart = billingDay === 13
    ? clampDayToMonth(cycleEnd.clone().subtract(1, "month"), 29).startOf("day")
    : clampDayToMonth(cycleEnd.clone(), 14).startOf("day");

  return {
    billingDay,
    end: cycleEnd,
    reference,
    start: cycleStart,
  };
};

const createFinancialSummary = (): OrderFinancialReportSectionSummary => ({
  collectionTotal: 0,
  companyDue: 0,
  fines: 0,
  ordersCount: 0,
  vendorDue: 0,
  warehouseCost: 0,
});

const createFinancialRow = (vendorId: number | null, vendorName: string): OrderFinancialReportVendorRow => ({
  collectionTotal: 0,
  companyDue: 0,
  fines: 0,
  ordersCount: 0,
  vendorDue: 0,
  vendorId,
  vendorName,
  warehouseCost: 0,
});

const appendFinancialRow = (
  summary: OrderFinancialReportSectionSummary,
  row: OrderFinancialReportVendorRow,
  values: {
    collectionTotal: number;
    companyDue: number;
    fines: number;
    ordersCount: number;
    vendorDue: number;
    warehouseCost: number;
  },
): void => {
  summary.collectionTotal += values.collectionTotal;
  summary.companyDue += values.companyDue;
  summary.fines += values.fines;
  summary.ordersCount += values.ordersCount;
  summary.vendorDue += values.vendorDue;
  summary.warehouseCost += values.warehouseCost;

  row.collectionTotal += values.collectionTotal;
  row.companyDue += values.companyDue;
  row.fines += values.fines;
  row.ordersCount += values.ordersCount;
  row.vendorDue += values.vendorDue;
  row.warehouseCost += values.warehouseCost;
};

const sortFinancialItems = (items: OrderFinancialReportVendorRow[]): OrderFinancialReportVendorRow[] =>
  [...items].sort((left, right) => {
    const salesDifference = right.collectionTotal - left.collectionTotal;
    if (salesDifference !== 0) {
      return salesDifference;
    }

    return left.vendorName.localeCompare(right.vendorName, "ar");
  });

const mapOrderSummary = (value: unknown): OrderListItem => {
  const order = toPlain(value);
  const orderLine = Array.isArray(order.orderLines) ? toPlain(order.orderLines[0]) : {};
  const product = toPlain(orderLine.product);
  const vendor = toPlain(product.vendor);
  const user = toPlain(order.user);
  const priority = resolveOrderPriority(order.priority, order.deliveryStatus, order.expectedDeliveryDate);

  return {
    code: toText(order.code),
    customerName: `${toText(toPlain(order.customer).firstName)} ${toText(toPlain(order.customer).lastName)}`.trim(),
    daysSinceOrder: getDaysSince(order.orderDate),
    deliveryBy: toNumber(order.deliveryBy) || null,
    deliveryPriority: priority,
    deliveryPriorityLabel: getDeliveryPriorityLabel(priority),
    deliveryStatus: resolveDeliveryStatus(order.deliveryStatus, order.expectedDeliveryDate),
    priority,
    priorityLabel: getDeliveryPriorityLabel(priority),
    expectedDeliveryDate: toIsoString(order.expectedDeliveryDate),
    fine: toNumber(order.fine),
    id: toNumber(order.id),
    manufactureStatus: toNumber(order.manufactureStatus) || null,
    manufactureStatusLabel: getManufactureLabel(order.manufactureStatus),
    operationNumber: toText(order.code),
    orderSource: toNumber(order.orderSource) || null,
    orderSourceLabel: ORDER_SOURCE_LABELS[toNumber(order.orderSource)] ?? "",
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

  public async findOrderEntities(orderIds: number[]): Promise<unknown[]> {
    if (orderIds.length === 0) {
      return [];
    }

    return orderModel.findAll({
      where: {
        id: {
          [Op.in]: orderIds,
        },
      },
    });
  }

  public async listOrders(filters: OrderListQuery, vendorId?: number | null): Promise<OrderListResponse> {
    const sortEntries = getOrderSortEntries(filters.sort);
    const requiresInMemoryProcessing = Boolean(filters.priority || filters.deliveryStatus || sortEntries.some(([field]) => field === "priority"));

    if (requiresInMemoryProcessing) {
      const rows = await orderModel.findAll({
        include: [...buildIncludes(), { as: "user", attributes: ["firstName", "lastName"], model: userModel, required: false }],
        order: buildOrderSort(sortEntries),
        subQuery: false,
        where: buildFilters(filters, vendorId),
      });

      const items = rows
        .map((row: unknown): { item: OrderListItem; row: Record<string, unknown> } => ({ item: mapOrderSummary(row), row: toPlain(row) }))
        .filter(({ item, row }: { item: OrderListItem; row: Record<string, unknown> }) => {
          const matchesPriority = !filters.priority
            || filters.priority.split(",").map((value) => Number(value.trim())).includes(item.deliveryPriority ?? 0);
          const matchesDeliveryStatus = !filters.deliveryStatus
            || filters.deliveryStatus.split(",").map(Number).includes(item.deliveryStatus ?? 0);
          return matchesPriority && matchesDeliveryStatus;
        });

      if (sortEntries.length > 0) {
        items.sort(
          (
            left: { item: OrderListItem; row: Record<string, unknown> },
            right: { item: OrderListItem; row: Record<string, unknown> },
          ) => compareOrderEntries(left, right, sortEntries),
        );
      }

      const start = (filters.page - 1) * filters.size;
      const end = start + filters.size;

      return {
        items: items.slice(start, end).map(({ item }: { item: OrderListItem; row: Record<string, unknown> }) => item),
        page: filters.page,
        size: filters.size,
        totalCount: items.length,
      };
    }

    const result = await orderModel.findAndCountAll({
      distinct: true,
      include: [...buildIncludes(), { as: "user", attributes: ["firstName", "lastName"], model: userModel, required: false }],
      limit: filters.size,
      offset: (filters.page - 1) * filters.size,
      order: buildOrderSort(sortEntries),
      subQuery: false,
      where: buildFilters(filters, vendorId),
    });
    const items = result.rows
      .map((row: unknown): { item: OrderListItem; row: Record<string, unknown> } => ({ item: mapOrderSummary(row), row: toPlain(row) }))
      .filter(({ item, row }: { item: OrderListItem; row: Record<string, unknown> }) => {
        const matchesPriority = !filters.priority
          || filters.priority.split(",").map((value) => Number(value.trim())).includes(item.deliveryPriority ?? 0);
        const matchesDeliveryStatus = !filters.deliveryStatus
          || filters.deliveryStatus.split(",").map(Number).includes(item.deliveryStatus ?? 0);
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
    const usersResult = await userModel.findAll({ attributes: ["firstName", "id", "lastName"], where: { id: { [Op.in]: logs.map((log: unknown) => toNumber(toPlain(log).userId)).filter(Boolean) } } });
    const users = Array.isArray(usersResult) ? usersResult : [];
    const userNames = new Map(users.map((user: unknown) => { const plainUser = toPlain(user); return [toNumber(plainUser.id), `${toText(plainUser.firstName)} ${toText(plainUser.lastName)}`.trim()]; }));
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
    const userNamesById = Object.fromEntries(Array.from(userNames.entries()).map(([id, name]) => [String(id), name]));
    const expectedManufacturingDays = orderLines
      .map((line) => {
        const product = toPlain(toPlain(line).product);
        const vendor = toPlain(product.vendor);
        return toNumber(vendor.daysToDeliver);
      })
      .find((value) => value > 0) ?? 0;
    const timeline: OrderTimelineItem[] = logs
      .map((log: unknown): Record<string, unknown> => toPlain(log))
      .filter((log: Record<string, unknown>) => {
        const action = toText(log.action);
        const field = toText(log.field);
        return field === "status"
          || (action === "create" && field === "order_received")
          || (action === "notify" && field === "order_received_notification")
          || action === "delete";
      })
      .map((log: Record<string, unknown>) => {
        const action = toText(log.action);
        const field = toText(log.field);
        const toStatus = toNumber(log.to) || null;
        const userName = toText(userNames.get(toNumber(log.userId)) ?? "");
        const isManufacturingStarted = field === "status" && toStatus === ORDER_STATUS.IN_PROGRESS;

        let eventType = "status_updated";
        if (action === "create" && field === "order_received") {
          eventType = "order_received";
        } else if (action === "notify" && field === "order_received_notification") {
          eventType = "notification_sent";
        } else if (action === "delete") {
          eventType = "order_deleted";
        } else if (isManufacturingStarted) {
          eventType = "manufacturing_started";
        }

        return {
          changedAt: toIsoString(log.createdAt) ?? "",
          description: isManufacturingStarted && expectedManufacturingDays > 0
            ? `المدة المتوقعة ${expectedManufacturingDays} يوم عمل`
            : getHistoryActorLabel(userName),
          eventType,
          fromStatus: toNumber(log.from) || null,
          fromStatusLabel: getStatusLabel(log.from),
          id: toNumber(log.id),
          message: buildLogMessage(log, { userNamesById, vendorNamesById }),
          toStatus,
          toStatusLabel: getStatusLabel(log.to),
          userName,
        };
      });
    const statusLogsAscending = logs
      .map((log: unknown): Record<string, unknown> => toPlain(log))
      .filter((log: Record<string, unknown>) => toText(log.field) === "status")
      .sort((left: Record<string, unknown>, right: Record<string, unknown>) => {
        const leftTime = new Date(toIsoString(left.createdAt) ?? 0).getTime();
        const rightTime = new Date(toIsoString(right.createdAt) ?? 0).getTime();
        return leftTime - rightTime;
      });
    const activeStatusHistory: OrderStatusHistoryItem[] = [];
    const seenStatuses = new Set<number>();
    const currentStatus = toNumber(plainOrder.status) || null;
    const pushStatusHistoryItem = (status: number | null, changedAt: string, id: number, userName: string): void => {
      if (!status || seenStatuses.has(status)) return;
      if (currentStatus && status > currentStatus) return;
      seenStatuses.add(status);
      activeStatusHistory.push({
        changedAt,
        id,
        isActive: true,
        status,
        statusLabel: getStatusLabel(status),
        userName,
      });
    };
    if (statusLogsAscending.length > 0) {
      const firstStatusLog = statusLogsAscending[0];
      pushStatusHistoryItem(
        toNumber(firstStatusLog.from) || null,
        toIsoString(plainOrder.orderDate) ?? toIsoString(firstStatusLog.createdAt) ?? "",
        toNumber(firstStatusLog.id),
        toText(userNames.get(toNumber(firstStatusLog.userId)) ?? ""),
      );
    }
    statusLogsAscending.forEach((log: Record<string, unknown>) => {
      pushStatusHistoryItem(
        toNumber(log.to) || null,
        toIsoString(log.createdAt) ?? "",
        toNumber(log.id),
        toText(userNames.get(toNumber(log.userId)) ?? ""),
      );
    });
    pushStatusHistoryItem(
      currentStatus,
      toIsoString(plainOrder.updatedAt) ?? toIsoString(plainOrder.orderDate) ?? "",
      toNumber(plainOrder.id),
      "",
    );
    if (activeStatusHistory.length === 0) {
      pushStatusHistoryItem(
        currentStatus,
        toIsoString(plainOrder.orderDate) ?? "",
        toNumber(plainOrder.id),
        "",
      );
    }
    const activeStatusByCode = new Map(
      activeStatusHistory.map((item) => [item.status, item]),
    );
    const statusHistory: OrderStatusHistoryItem[] = Object.keys(ORDER_STATUS_LABELS)
      .map(Number)
      .sort((left, right) => left - right)
      .map((status) => {
        const activeItem = activeStatusByCode.get(status);
        return {
          changedAt: activeItem?.changedAt ?? "",
          id: activeItem?.id ?? status,
          isActive: Boolean(activeItem),
          status,
          statusLabel: ORDER_STATUS_LABELS[status] ?? "",
          userName: activeItem?.userName ?? "",
        };
      });

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
        deliveryStatus: summary.deliveryStatus,
        deliveryDate: toIsoString(plainOrder.deliveryDate),
        itemsCount: orderLines.length,
        notes: toText(plainOrder.notes),
        shippedFromInventory: Boolean(plainOrder.shippedFromInventory),
        shipmentType: toText(plainOrder.shipmentType),
      },
      items: orderLines.map((line) => {
        const plainLine = toPlain(line);
        const product = toPlain(plainLine.product);
        const vendor = toPlain(product.vendor);
        const type = toPlain(product.type);
        const variant = getOrderLineVariant(plainLine);

        return {
          color: toText(plainLine.color),
          id: toNumber(plainLine.id),
          image: toText(product.image),
          itemType: toText(type.name),
          material: toText(plainLine.material),
          productId: toNumber(product.id) || null,
          productName: toText(product.title, toText(plainLine.title)),
          quantity: toNumber(plainLine.quantity),
          size: toText(plainLine.size),
          sku: toText(plainLine.sku),
          typeName: toText(type.name),
          unitCost: toNumber(plainLine.unitCost),
          variant: {
            color: toText(variant.option1, toText(plainLine.color)),
            id: toText(variant.shopifyId, toText(variant.id, toText(plainLine.variant_id))),
            inventoryQuantity: toNumber(variant.inventory_quantity) || null,
            material: toText(variant.option3, toText(plainLine.material)),
            price: toNumber(variant.price),
            size: toText(variant.option2, toText(plainLine.size)),
            sku: toText(variant.sku, toText(plainLine.sku)),
            title: toText(variant.title),
          },
          vendorId: toNumber(vendor.id) || null,
          vendorName: toText(vendor.name),
        };
      }),
      timeline,
      statusHistory,
    };

    return view;
  }

  public async getSummary(filters: OrderListQuery, vendorId?: number | null): Promise<OrderSummaryResponse> {
    const counts = canUseAggregateSummary(filters, vendorId)
      ? await this.getSummaryCountsFromAggregate(filters, vendorId)
      : await this.getSummaryCountsFromOrders(filters, vendorId);

    return { cards: [
      { key: "urgentOrders", label: "مستعجل جدا", value: counts.urgentOrders },
      { key: "canceledOrRefundedOrders", label: "ملغي / مرتجع", value: counts.canceledOrRefundedOrders },
      { key: "deliveredOrders", label: "تم التسليم", value: counts.deliveredOrders },
      { key: "inProgressOrders", label: "قيد التصنيع", value: counts.inProgressOrders },
      { key: "pendingOrders", label: "معلق", value: counts.pendingOrders },
      { key: "totalOrders", label: "إجمالي الطلبات", value: counts.totalOrders },
    ] };
  }

  private async getSummaryCountsFromAggregate(
    filters: OrderListQuery,
    vendorId?: number | null,
  ): Promise<{ canceledOrRefundedOrders: number; deliveredOrders: number; inProgressOrders: number; pendingOrders: number; totalOrders: number; urgentOrders: number }> {
    const scope = resolveAggregateScope(filters, vendorId);
    if (!scope || !filters.startDate || !filters.endDate) {
      return this.getSummaryCountsFromOrders(filters, vendorId);
    }

    const rows = await dashboardDailyMetricModel.findAll({
      where: {
        metricDate: {
          [Op.between]: [filters.startDate.slice(0, 10), filters.endDate.slice(0, 10)],
        },
        role: scope.role,
        scopeId: scope.scopeId,
      },
    });

    const rowByDate = new Map<string, Record<string, unknown>>(
      rows.map((row: { toJSON?: () => Record<string, unknown> }) => {
        const plainRow = toPlain(row);
        return [toText(plainRow.metricDate), plainRow];
      }),
    );

    if (rowByDate.size === 0) {
      return this.getSummaryCountsFromOrders(filters, vendorId);
    }

    const aggregateRows = [...rowByDate.values()];
    const stableCounts = aggregateRows.reduce<{
      canceledOrRefundedOrders: number;
      deliveredOrders: number;
      inProgressOrders: number;
      pendingOrders: number;
      totalOrders: number;
    }>(
      (summary, row) => ({
        canceledOrRefundedOrders: summary.canceledOrRefundedOrders + toNumber(row.canceledOrRefundedOrders),
        deliveredOrders: summary.deliveredOrders + toNumber(row.deliveredOrders),
        inProgressOrders: summary.inProgressOrders + toNumber(row.inProgressOrders),
        pendingOrders: summary.pendingOrders + toNumber(row.pendingOrders),
        totalOrders: summary.totalOrders + toNumber(row.totalOrders),
      }),
      {
        canceledOrRefundedOrders: 0,
        deliveredOrders: 0,
        inProgressOrders: 0,
        pendingOrders: 0,
        totalOrders: 0,
      },
    );

    return {
      ...stableCounts,
      urgentOrders: await this.getUrgentOrdersCount(filters, vendorId),
    };
  }

  private async getSummaryCountsFromOrders(
    filters: OrderListQuery,
    vendorId?: number | null,
  ): Promise<{ canceledOrRefundedOrders: number; deliveredOrders: number; inProgressOrders: number; pendingOrders: number; totalOrders: number; urgentOrders: number }> {
    const orders = await orderModel.findAll({
      attributes: ["expectedDeliveryDate", "status"],
      include: buildIncludes(),
      subQuery: false,
      where: buildFilters(filters, vendorId),
    });
    const counts = {
      canceledOrRefundedOrders: 0,
      deliveredOrders: 0,
      inProgressOrders: 0,
      pendingOrders: 0,
      totalOrders: orders.length,
      urgentOrders: 0,
    };

    for (const order of orders) {
      const plainOrder = toPlain(order);
      const status = toNumber(plainOrder.status);
      if (ORDER_SUMMARY_STATUS_GROUPS.pending.includes(status)) counts.pendingOrders += 1;
      if (ORDER_SUMMARY_STATUS_GROUPS.inProgress.includes(status)) counts.inProgressOrders += 1;
      if (ORDER_SUMMARY_STATUS_GROUPS.delivered.includes(status)) counts.deliveredOrders += 1;
      if (ORDER_SUMMARY_STATUS_GROUPS.canceledOrRefunded.includes(status)) counts.canceledOrRefundedOrders += 1;
      if (resolveOrderPriority(plainOrder.priority, plainOrder.deliveryStatus, plainOrder.expectedDeliveryDate) === 3 && !FINAL_ORDER_STATUSES.includes(status)) counts.urgentOrders += 1;
    }

    return counts;
  }

  private async getUrgentOrdersCount(filters: OrderListQuery, vendorId?: number | null): Promise<number> {
    const baseWhere = buildFilters(filters, vendorId) as Record<PropertyKey, unknown>;
    const andConditions = Array.isArray(baseWhere[Op.and]) ? [...baseWhere[Op.and] as unknown[]] : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    andConditions.push(sequelize.where(sequelize.col("Order.expectedDeliveryDate"), { [Op.lt]: today }));
    andConditions.push(sequelize.where(sequelize.col("Order.status"), { [Op.notIn]: FINAL_ORDER_STATUSES }));

    return orderModel.count({
      col: "id",
      distinct: true,
      include: buildIncludes(),
      subQuery: false,
      where: {
        [Op.and]: andConditions,
      },
    });
  }

  public async getMeta(): Promise<OrderMetaResponse> {
    const [vendors, assignees] = await Promise.all([
      vendorModel.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] }),
      userModel.findAll({ attributes: ["firstName", "id", "lastName"], order: [["firstName", "ASC"]] }),
    ]);
    return {
      assignees: assignees.map((user: unknown) => ({ id: toNumber(toPlain(user).id), label: `${toText(toPlain(user).firstName)} ${toText(toPlain(user).lastName)}`.trim() })),
      deliveryByOptions: Object.entries(DELIVERY_BY).map(([, id]) => ({ id: Number(id), label: DELIVERY_BY_ARABIC[id as keyof typeof DELIVERY_BY_ARABIC] ?? String(id) })),
      manufactureStatuses: Object.entries(MANUFACTURE_STATUS_ARABIC).map(([id, label]) => ({ id: Number(id), label: String(label) })),
      orderSources: Object.entries(ORDER_SOURCE).map(([, id]) => ({ id: Number(id), label: ORDER_SOURCE_LABELS[Number(id)] ?? String(id) })),
      paymentStatuses: Object.entries(PAYMENT_STATUS_ARABIC).map(([id, label]) => ({ id: Number(id), label: String(label) })),
      priorities: [{ id: 1, label: "بالمدة" }, { id: 2, label: "مستعجل" }, { id: 3, label: "مستعجل جدا" }],
      statuses: Object.entries(ORDER_STATUS_Arabic).map(([id, label]) => ({ id: Number(id), label: String(label) })),
      vendors: vendors.map((vendor: unknown) => ({ id: toNumber(toPlain(vendor).id), label: toText(toPlain(vendor).name) })),
    };
  }

  public async getFinancialReport(query: OrderFinancialReportQuery, scopedVendorId?: number | null): Promise<OrderFinancialReportResponse> {
    const hasCustomRange = isValidDate(query.startDate) && isValidDate(query.endDate);
    const cycleRange = hasCustomRange
      ? {
        billingDay: 28 as const,
        end: moment.tz(query.endDate, "Africa/Cairo").endOf("day"),
        reference: isValidDate(query.referenceDate) ? moment.tz(query.referenceDate, "Africa/Cairo") : moment().tz("Africa/Cairo"),
        start: moment.tz(query.startDate, "Africa/Cairo").startOf("day"),
      }
      : resolveFinancialCycleRange(
        query.billingDay === 13 || query.billingDay === 28 ? query.billingDay : undefined,
        query.referenceDate,
      );

    const effectiveVendorId = scopedVendorId ?? (query.vendorId && String(query.vendorId) !== "0" ? Number(query.vendorId) : null);
    const whereConditions: unknown[] = [
      sequelize.where(sequelize.col("Order.deliveryDate"), { [Op.gte]: cycleRange.start.utc().toDate() }),
      sequelize.where(sequelize.col("Order.deliveryDate"), { [Op.lte]: cycleRange.end.utc().toDate() }),
      sequelize.where(sequelize.col("Order.status"), { [Op.eq]: ORDER_STATUS.DELIVERED }),
    ];

    if (effectiveVendorId) {
      whereConditions.push(
        sequelize.where(sequelize.col("orderLines.product.vendor.id"), {
          [Op.eq]: effectiveVendorId,
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
      order: [["deliveryDate", "ASC"], ["id", "ASC"]],
      where: { [Op.and]: whereConditions },
    });

    const fullInvoiceSummary = createFinancialSummary();
    const vendorDeliveriesSummary = createFinancialSummary();
    const warehouseDeliveriesSummary = createFinancialSummary();

    const fullInvoiceRows = new Map<string, OrderFinancialReportVendorRow>();
    const vendorDeliveryRows = new Map<string, OrderFinancialReportVendorRow>();
    const warehouseDeliveryRows = new Map<string, OrderFinancialReportVendorRow>();

    for (const order of orders) {
      const plainOrder = toPlain(order);
      const orderLines = Array.isArray(plainOrder.orderLines) ? plainOrder.orderLines : [];
      const firstLine = orderLines.length > 0 ? toPlain(orderLines[0]) : {};
      const vendor = toPlain(toPlain(firstLine.product).vendor);
      const vendorId = toNumber(vendor.id) || null;
      const vendorName = toText(vendor.name, "غير محدد");
      const vendorKey = vendorId ? String(vendorId) : `unknown:${vendorName}`;
      const collectionTotal = toNumber(plainOrder.totalPrice);
      const fines = toNumber(plainOrder.fine);
      const companyCommission = toNumber(plainOrder.commission);
      const vendorDue = Math.max(
        toNumber(plainOrder.totalVendorDue) || (collectionTotal - companyCommission - fines),
        0,
      );
      const companyDue = Math.max(
        toNumber(plainOrder.totalCompanyDue) || companyCommission,
        0,
      );
      const warehouseCost = vendorDue + fines;
      const isWarehouseDelivery =
        Boolean(plainOrder.shippedFromInventory)
        && toNumber(plainOrder.shipmentStatus) === SHIPMENTS_STATUS.DELIVERED;
      const isVendorDelivery = !Boolean(plainOrder.shippedFromInventory);

      const fullRow = fullInvoiceRows.get(vendorKey) ?? createFinancialRow(vendorId, vendorName);
      fullInvoiceRows.set(vendorKey, fullRow);
      appendFinancialRow(fullInvoiceSummary, fullRow, {
        collectionTotal,
        companyDue,
        fines,
        ordersCount: 1,
        vendorDue,
        warehouseCost,
      });

      if (isVendorDelivery) {
        const vendorRow = vendorDeliveryRows.get(vendorKey) ?? createFinancialRow(vendorId, vendorName);
        vendorDeliveryRows.set(vendorKey, vendorRow);
        appendFinancialRow(vendorDeliveriesSummary, vendorRow, {
          collectionTotal,
          companyDue,
          fines,
          ordersCount: 1,
          vendorDue,
          warehouseCost,
        });
      }

      if (isWarehouseDelivery) {
        const warehouseRow = warehouseDeliveryRows.get(vendorKey) ?? createFinancialRow(vendorId, vendorName);
        warehouseDeliveryRows.set(vendorKey, warehouseRow);
        appendFinancialRow(warehouseDeliveriesSummary, warehouseRow, {
          collectionTotal,
          companyDue,
          fines,
          ordersCount: 1,
          vendorDue,
          warehouseCost,
        });
      }
    }

    const fullInvoice: OrderFinancialReportSection = {
      items: sortFinancialItems([...fullInvoiceRows.values()]),
      summary: fullInvoiceSummary,
    };
    const vendorDeliveries: OrderFinancialReportSection = {
      items: sortFinancialItems([...vendorDeliveryRows.values()]),
      summary: vendorDeliveriesSummary,
    };
    const warehouseDeliveries: OrderFinancialReportSection = {
      items: sortFinancialItems([...warehouseDeliveryRows.values()]),
      summary: warehouseDeliveriesSummary,
    };

    return {
      cycle: {
        billingDay: hasCustomRange
          ? (query.billingDay === 13 || query.billingDay === 28 ? query.billingDay : cycleRange.billingDay)
          : cycleRange.billingDay,
        endDate: cycleRange.end.toISOString(),
        mode: hasCustomRange ? "customRange" : "billingCycle",
        referenceDate: cycleRange.reference.toISOString(),
        startDate: cycleRange.start.toISOString(),
      },
      fullInvoice,
      summary: {
        companyDue: fullInvoice.summary.companyDue,
        fines: fullInvoice.summary.fines,
        totalSales: fullInvoice.summary.collectionTotal,
        vendorDue: fullInvoice.summary.vendorDue,
        vendorsCount: fullInvoice.items.length,
      },
      vendorDeliveries,
      warehouseDeliveries,
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
