import {
  calculateExceededDays,
  calculateOrderFine,
  calculateOrderFineForRecord,
  resolveExpectedDeliveryDate,
} from "./order-fines";

describe("order fine calculations", () => {
  it("derives the delivery deadline from the actual order date and vendor SLA", () => {
    expect(resolveExpectedDeliveryDate({
      daysToDeliver: 5,
      orderDate: "2026-08-01T12:00:00+03:00",
    })?.toISOString()).toBe("2026-08-06T09:00:00.000Z");
  });

  it("charges one percent of subtotal for every full overdue calendar day", () => {
    expect(calculateOrderFine({
      baseAmount: 10_000,
      daysToDeliver: 5,
      endDate: "2026-08-08T12:00:00+03:00",
      orderDate: "2026-08-01T12:00:00+03:00",
    })).toBe(200);
  });

  it("does not charge on the due date", () => {
    expect(calculateOrderFine({
      baseAmount: 10_000,
      daysToDeliver: 5,
      endDate: "2026-08-06T23:59:00+03:00",
      orderDate: "2026-08-01T08:00:00+03:00",
    })).toBe(0);
  });

  it("uses the stored promised date so later vendor SLA changes are not retroactive", () => {
    expect(calculateExceededDays({
      daysToDeliver: 2,
      endDate: "2026-08-12T10:00:00+03:00",
      expectedDeliveryDate: "2026-08-11T10:00:00+03:00",
      orderDate: "2026-08-01T10:00:00+03:00",
    })).toBe(1);
  });

  it("uses Cairo calendar days around UTC midnight", () => {
    expect(calculateExceededDays({
      endDate: "2026-08-11T22:30:00.000Z",
      expectedDeliveryDate: "2026-08-10T21:30:00.000Z",
    })).toBe(1);
  });

  it("falls back safely when neither an explicit deadline nor a positive SLA exists", () => {
    expect(calculateOrderFine({
      baseAmount: 10_000,
      daysToDeliver: 0,
      endDate: "2026-08-12T10:00:00+03:00",
      orderDate: "2026-08-01T10:00:00+03:00",
    })).toBe(0);
  });

  it("reads vendor SLA from an order record when no promised date is stored", () => {
    expect(calculateOrderFineForRecord({
      orderDate: "2026-08-01T10:00:00+03:00",
      orderLines: [{ product: { vendor: { daysToDeliver: 5 } } }],
      subTotalPrice: 5_000,
    }, "2026-08-08T10:00:00+03:00")).toBe(100);
  });
});
