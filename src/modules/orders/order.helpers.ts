import { DELIVERY_STATUS } from "../../../config/constants";
import {
  DELIVERY_STATUS_PRIORITY_MAP,
  MANUFACTURE_STATUS_LABELS,
  ORDER_DELIVERY_PRIORITY,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./order.constants";
import type { OrderEvent, OrderPriorityKey } from "./order.types";

type PlainRecord = Record<string, unknown>;
type Plainable = PlainRecord | { toJSON: () => PlainRecord };

export const toPlain = (value: unknown): PlainRecord => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const plainableValue = value as Plainable;
  if ("toJSON" in plainableValue && typeof plainableValue.toJSON === "function") {
    return plainableValue.toJSON();
  }

  return value as PlainRecord;
};

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
};

export const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = toNumber(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const toText = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

export const toIsoString = (value: unknown): string | null => {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const getDeliveryStatusValue = (expectedDeliveryDate: unknown): number | null => {
  const isoString = toIsoString(expectedDeliveryDate);
  if (!isoString) {
    return null;
  }

  const dueDate = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const almostDueDate = new Date(today);
  almostDueDate.setDate(almostDueDate.getDate() + 2);

  if (dueDate < today) {
    return DELIVERY_STATUS.LATE;
  }

  if (dueDate < almostDueDate) {
    return DELIVERY_STATUS.ALMOST_LAST;
  }

  return DELIVERY_STATUS.ON_SCHEDULE;
};

export const getOrderPriority = (expectedDeliveryDate: unknown): OrderPriorityKey | null => {
  const deliveryStatus = getDeliveryStatusValue(expectedDeliveryDate);
  return deliveryStatus ? DELIVERY_STATUS_PRIORITY_MAP[deliveryStatus] ?? null : null;
};

export const getOrderPriorityFromDeliveryStatus = (
  deliveryStatus: unknown,
  expectedDeliveryDate?: unknown,
): OrderPriorityKey | null => {
  const parsedDeliveryStatus = toNumber(deliveryStatus);
  if (parsedDeliveryStatus) {
    return DELIVERY_STATUS_PRIORITY_MAP[parsedDeliveryStatus as keyof typeof DELIVERY_STATUS_PRIORITY_MAP] ?? null;
  }

  return getOrderPriority(expectedDeliveryDate);
};

export const getDeliveryPriorityLabel = (priority: OrderPriorityKey | null): string => {
  if (priority === ORDER_DELIVERY_PRIORITY.URGENT) {
    return "مستعجل جدا";
  }

  if (priority === ORDER_DELIVERY_PRIORITY.ALMOST_DUE) {
    return "مستعجل";
  }

  if (priority === ORDER_DELIVERY_PRIORITY.ON_SCHEDULE) {
    return "بالمدة";
  }

  return "";
};

export const getDaysSince = (value: unknown): number | null => {
  const isoString = toIsoString(value);
  if (!isoString) {
    return null;
  }

  const date = new Date(isoString);
  const difference = Date.now() - date.getTime();
  return difference < 0 ? 0 : Math.floor(difference / (24 * 60 * 60 * 1000));
};

export const getStatusLabel = (value: unknown): string => {
  return ORDER_STATUS_LABELS[toNumber(value)] ?? "";
};

export const getPaymentLabel = (value: unknown): string => {
  return PAYMENT_STATUS_LABELS[toNumber(value)] ?? "";
};

export const getManufactureLabel = (value: unknown): string => {
  return MANUFACTURE_STATUS_LABELS[toNumber(value)] ?? "";
};

export const buildLogMessage = (log: PlainRecord): string => {
  const action = toText(log.action);
  if (action === "delete") {
    return "تم حذف الطلب";
  }

  const field = toText(log.field);
  const nextValue = toText(log.to);
  if (!field) {
    return "تم تحديث الطلب";
  }

  return nextValue ? `تم تحديث ${field} إلى ${nextValue}` : `تم تحديث ${field}`;
};

export const sortEventsDescending = (items: OrderEvent[]): OrderEvent[] => {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
};
