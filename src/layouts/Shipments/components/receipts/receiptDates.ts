import moment from "moment-timezone";

const CAIRO = "Africa/Cairo";

/** YYYY-MM-DD (Cairo calendar day) of a stored timestamp; "" when empty. */
export const cairoDay = (value: string | null | undefined): string =>
  value ? moment(value).tz(CAIRO).format("YYYY-MM-DD") : "";

/** DD/MM/YY (Cairo) for display; "—" when empty. */
export const shortDateLabel = (value: string | null | undefined): string =>
  value ? moment(value).tz(CAIRO).format("DD/MM/YY") : "—";

/** Allowed range of the manual receipt date: not before the (automatic) manufacture day, not after today. */
export const receiptDateBounds = (manufactureDate: string | null | undefined, now: moment.Moment = moment()) => ({
  min: cairoDay(manufactureDate) || undefined,
  max: now.clone().tz(CAIRO).format("YYYY-MM-DD"),
});

/** Whole Cairo days from manufacture to receipt; null if either is missing. Negative = manufactured after receipt. */
export const manufactureToReceiptDays = (
  manufactureDate: string | null | undefined,
  receiptDate: string | null | undefined
): number | null => {
  const from = cairoDay(manufactureDate);
  const to = cairoDay(receiptDate);
  return from && to ? moment(to, "YYYY-MM-DD").diff(moment(from, "YYYY-MM-DD"), "days") : null;
};
