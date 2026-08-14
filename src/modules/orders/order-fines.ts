import moment, { type MomentInput } from "moment-timezone";

export const FINE_TIMEZONE = "Africa/Cairo";
export const ORDER_FINE_RATE_PER_DAY = 0.01;

const normalizeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toBusinessMoment = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = value instanceof Date
    ? moment(value).tz(FINE_TIMEZONE)
    : moment.parseZone(String(value) as MomentInput).tz(FINE_TIMEZONE);
  return parsed.isValid() ? parsed : null;
};

export const resolveExpectedDeliveryDate = ({
  daysToDeliver,
  expectedDeliveryDate,
  orderDate,
}: {
  daysToDeliver?: unknown;
  expectedDeliveryDate?: unknown;
  orderDate?: unknown;
}): Date | null => {
  const explicitDate = toBusinessMoment(expectedDeliveryDate);
  if (explicitDate) return explicitDate.toDate();

  const startDate = toBusinessMoment(orderDate);
  const deliveryWindow = Math.trunc(normalizeNumber(daysToDeliver));
  if (!startDate || deliveryWindow <= 0) return null;
  return startDate.add(deliveryWindow, "days").toDate();
};

export const calculateExceededDays = ({
  daysToDeliver,
  endDate = new Date(),
  expectedDeliveryDate,
  orderDate,
}: {
  daysToDeliver?: unknown;
  endDate?: unknown;
  expectedDeliveryDate?: unknown;
  orderDate?: unknown;
}): number => {
  const end = toBusinessMoment(endDate);
  const dueDate = toBusinessMoment(resolveExpectedDeliveryDate({
    daysToDeliver,
    expectedDeliveryDate,
    orderDate,
  }));
  if (!end || !dueDate) return 0;
  return Math.max(0, end.startOf("day").diff(dueDate.startOf("day"), "days"));
};

export const calculateOrderFine = ({
  baseAmount,
  daysToDeliver,
  endDate = new Date(),
  expectedDeliveryDate,
  orderDate,
}: {
  baseAmount?: unknown;
  daysToDeliver?: unknown;
  endDate?: unknown;
  expectedDeliveryDate?: unknown;
  orderDate?: unknown;
}): number => {
  const exceededDays = calculateExceededDays({ daysToDeliver, endDate, expectedDeliveryDate, orderDate });
  const amount = Math.max(0, normalizeNumber(baseAmount));
  if (exceededDays < 1 || amount === 0) return 0;
  return Math.round(amount * ORDER_FINE_RATE_PER_DAY * exceededDays * 100) / 100;
};

export const calculateOrderFineForRecord = (orderLike: Record<string, any>, endDate: unknown = new Date()): number => {
  const firstOrderLine = Array.isArray(orderLike.orderLines) ? orderLike.orderLines[0] : null;
  return calculateOrderFine({
    baseAmount: orderLike.subTotalPrice,
    daysToDeliver: firstOrderLine?.product?.vendor?.daysToDeliver,
    endDate,
    expectedDeliveryDate: orderLike.expectedDeliveryDate,
    orderDate: orderLike.orderDate,
  });
};
