import moment from "moment-timezone";
import { cairoDay, manufactureToReceiptDays, receiptDateBounds, shortDateLabel } from "./receiptDates";

test("Cairo midnight stored as the previous UTC evening maps to the Cairo day", () => {
  expect(cairoDay("2026-09-24T21:00:00.000Z")).toBe("2026-09-25");
  expect(shortDateLabel("2026-09-24T21:00:00.000Z")).toBe("25/09/26");
  expect(cairoDay(null)).toBe("");
  expect(shortDateLabel(null)).toBe("—");
});

test("receipt date bounds: min is the manufacture day, max is today in Cairo", () => {
  const now = moment.tz("2026-10-01T22:30:00Z", "UTC"); // already 2 Oct in Cairo
  expect(receiptDateBounds("2026-09-20T21:00:00.000Z", now)).toEqual({ min: "2026-09-21", max: "2026-10-02" });
  expect(receiptDateBounds(null, now).min).toBeUndefined();
});

test("duration is computed in Cairo days and can be negative", () => {
  expect(manufactureToReceiptDays("2026-09-20T21:00:00.000Z", "2026-09-29T21:00:00.000Z")).toBe(9);
  expect(manufactureToReceiptDays("2026-09-30T21:00:00.000Z", "2026-09-24T21:00:00.000Z")).toBe(-6);
  expect(manufactureToReceiptDays(null, "2026-09-24T21:00:00.000Z")).toBeNull();
});
