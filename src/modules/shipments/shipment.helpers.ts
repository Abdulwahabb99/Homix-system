import { SHIPMENT_FINAL_STATUSES, SHIPMENT_STATUS_LABELS, SHIPMENT_TYPE_LABELS } from "./shipment.constants";

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

export const isValidDateInput = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return false;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return !Number.isNaN(new Date(`${normalizedValue}T00:00:00.000Z`).getTime());
  }

  return !Number.isNaN(new Date(normalizedValue).getTime());
};

export const toDateRangeBoundary = (value: unknown, boundary: "start" | "end"): Date | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    const timeSuffix = boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z";
    const date = new Date(`${normalizedValue}${timeSuffix}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getShipmentStatusLabel = (value: unknown): string => {
  return SHIPMENT_STATUS_LABELS[toNumber(value)] ?? "";
};

export const getShipmentTypeLabel = (value: unknown): string => {
  const normalizedValue = toText(value).trim();
  if (!normalizedValue) {
    return "";
  }

  return SHIPMENT_TYPE_LABELS[normalizedValue] ?? normalizedValue;
};

export const getDaysBetween = (fromValue: unknown, toValue: unknown): number | null => {
  const fromIsoString = toIsoString(fromValue);
  if (!fromIsoString) {
    return null;
  }

  const fromDate = new Date(fromIsoString);
  const toDate = toValue ? new Date(String(toValue)) : new Date();
  if (Number.isNaN(toDate.getTime())) {
    return null;
  }

  const difference = toDate.getTime() - fromDate.getTime();
  return difference < 0 ? 0 : Math.floor(difference / (24 * 60 * 60 * 1000));
};

export const getShipmentAgingDays = (
  status: unknown,
  shippingReceiveDate: unknown,
  deliveryDate: unknown,
  updatedAt: unknown,
): number | null => {
  const numericStatus = toNumber(status);
  const endDate = SHIPMENT_FINAL_STATUSES.some((finalStatus) => finalStatus === numericStatus)
    ? (deliveryDate ?? updatedAt)
    : undefined;
  return getDaysBetween(shippingReceiveDate, endDate);
};

export const normalizeOperationCode = (value: unknown): string => {
  return toText(value).trim();
};

export const buildShipmentNumber = (orderId: unknown): string => {
  const numericId = toNumber(orderId);
  return numericId > 0 ? `SH-${numericId}` : "";
};

export const buildUserName = (value: unknown): string => {
  const plainUser = toPlain(value);
  return `${toText(plainUser.firstName)} ${toText(plainUser.lastName)}`.trim();
};

export const getVariantBySku = (variantsValue: unknown, sku: string): PlainRecord | null => {
  if (!Array.isArray(variantsValue)) {
    return null;
  }

  const normalizedSku = sku.trim().toLowerCase();
  for (const variant of variantsValue) {
    const plainVariant = toPlain(variant);
    if (toText(plainVariant.sku).trim().toLowerCase() === normalizedSku) {
      return plainVariant;
    }
  }

  return null;
};
