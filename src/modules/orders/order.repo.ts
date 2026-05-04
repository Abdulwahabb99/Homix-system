import { Op } from "sequelize";

import { DELIVERY_STATUS, MANUFACTURE_STATUS, ORDER_STATUS, PAYMENT_STATUS } from "../../../config/constants";
import { ACTIVE_VENDOR_ORDER_STATUSES, FINAL_ORDER_STATUSES, ORDER_SUMMARY_STATUS_GROUPS } from "./order.constants";
import {
  buildLogMessage,
  getDaysSince,
  getDeliveryPriorityLabel,
  getOrderPriority,
  getStatusLabel,
  getManufactureLabel,
  getPaymentLabel,
  sortEventsDescending,
  toIsoString,
  toNumber,
  toPlain,
  toText,
} from "./order.helpers";
import type { OrderDetailsResponse, OrderDetailsView, OrderListItem, OrderListQuery, OrderListResponse, OrderMetaResponse, OrderSummaryResponse } from "./order.types";

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
      include: [{ as: "product", include: [{ as: "vendor" }, { as: "type", model: productTypeModel }], model: productModel }],
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
  const priority = getOrderPriority(order.expectedDeliveryDate);

  return {
    code: toText(order.code),
    customerName: `${toText(toPlain(order.customer).firstName)} ${toText(toPlain(order.customer).lastName)}`.trim(),
    daysSinceOrder: getDaysSince(order.orderDate),
    deliveryPriority: priority,
    deliveryPriorityLabel: getDeliveryPriorityLabel(priority),
    expectedDeliveryDate: toIsoString(order.expectedDeliveryDate),
    id: toNumber(order.id),
    manufactureStatus: toNumber(order.manufactureStatus) || null,
    manufactureStatusLabel: getManufactureLabel(order.manufactureStatus),
    operationNumber: `OP-${toText(order.code)}`,
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
    const items = result.rows.map((row: unknown) => mapOrderSummary(row)).filter((item: OrderListItem) => {
      const matchesPriority = !filters.priority || item.deliveryPriority === filters.priority;
      const matchesDeliveryStatus = !filters.deliveryStatus || filters.deliveryStatus.split(",").map(Number).includes(getOrderPriority(item.expectedDeliveryDate) === "urgent" ? DELIVERY_STATUS.LATE : getOrderPriority(item.expectedDeliveryDate) === "almostDue" ? DELIVERY_STATUS.ALMOST_LAST : DELIVERY_STATUS.ON_SCHEDULE);
      return matchesPriority && matchesDeliveryStatus;
    });

    return {
      items,
      orders: result.rows,
      page: filters.page,
      size: filters.size,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / filters.size),
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
    const orderLine = Array.isArray(plainOrder.orderLines) ? toPlain(plainOrder.orderLines[0]) : {};
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
      customer: { address: toText(customer.address), email: toText(customer.email), name: `${toText(customer.firstName)} ${toText(customer.lastName)}`.trim(), phoneNumber: toText(customer.phoneNumber) },
      financial: { amountToCollect: toNumber(plainOrder.toBeCollected), commission: toNumber(plainOrder.commission), discount: toNumber(plainOrder.totalDiscounts), downPayment: toNumber(plainOrder.downPayment), shippingFees: toNumber(plainOrder.shippingFees), totalCost: toNumber(plainOrder.totalCost), totalPrice: toNumber(plainOrder.totalPrice) },
      notes,
      order: { ...summary, customerId: toNumber(plainOrder.customerId) || null, deliveryDate: toIsoString(plainOrder.deliveryDate), notes: toText(plainOrder.notes), shipmentType: toText(plainOrder.shipmentType) },
      orderLine: { color: toText(orderLine.color), material: toText(orderLine.material), quantity: toNumber(orderLine.quantity), size: toText(orderLine.size), sku: toText(orderLine.sku), typeName: toText(toPlain(toPlain(orderLine.product).type).name), unitCost: toNumber(orderLine.unitCost) },
      timeline,
    };

    return {
      ...plainOrder,
      view,
    };
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
      if (getOrderPriority(plainOrder.expectedDeliveryDate) === "urgent" && !FINAL_ORDER_STATUSES.includes(status)) counts.urgentOrders += 1;
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
      manufactureStatuses: Object.entries(MANUFACTURE_STATUS).map(([label, id]) => ({ id, label })),
      paymentStatuses: Object.entries(PAYMENT_STATUS).map(([label, id]) => ({ id, label })),
      priorities: [{ id: "onSchedule", label: "بالمدة" }, { id: "almostDue", label: "مستعجل" }, { id: "urgent", label: "مستعجل جدا" }],
      statuses: Object.entries(ORDER_STATUS).map(([label, id]) => ({ id, label })),
      vendors: vendors.map((vendor: unknown) => ({ id: toNumber(toPlain(vendor).id), label: toText(toPlain(vendor).name) })),
    };
  }
}
