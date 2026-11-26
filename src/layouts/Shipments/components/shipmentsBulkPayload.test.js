import { buildShipmentsBulkPayload, BULK_CLEAR } from "./shipmentsBulkPayload";

const empty = { sched: "", date: "", deliveryDate: "", carrier: "", status: "" };

describe("buildShipmentsBulkPayload", () => {
  it("returns an empty payload when nothing is chosen", () => {
    expect(buildShipmentsBulkPayload(empty)).toEqual({});
  });

  it("sends the delivery date as the start of the Cairo day", () => {
    expect(buildShipmentsBulkPayload({ ...empty, deliveryDate: "2026-11-10" })).toEqual({ deliveryDate: "2026-11-09T22:00:00.000Z" });
  });

  it("uses the summer offset for a Cairo summer day", () => {
    expect(buildShipmentsBulkPayload({ ...empty, deliveryDate: "2026-07-10" })).toEqual({ deliveryDate: "2026-07-09T21:00:00.000Z" });
  });

  it("drops an invalid delivery date instead of sending an empty string", () => {
    expect(buildShipmentsBulkPayload({ ...empty, deliveryDate: "garbage" })).toEqual({});
  });

  it("keeps the delivery date independent from the scheduled date", () => {
    const data = buildShipmentsBulkPayload({ ...empty, date: "2026-11-12", deliveryDate: "2026-11-10" });
    expect(data.scheduledDeliveryDate).toBe("2026-11-11T22:00:00.000Z");
    expect(data.deliveryDate).toBe("2026-11-09T22:00:00.000Z");
  });

  it("maps the clear sentinel to null and ids to numbers", () => {
    expect(buildShipmentsBulkPayload({ ...empty, sched: BULK_CLEAR, carrier: BULK_CLEAR, status: "4" }))
      .toEqual({ scheduleStatus: null, shippingCompany: null, shipmentStatus: 4 });
    expect(buildShipmentsBulkPayload({ ...empty, sched: "3", carrier: "7" })).toEqual({ scheduleStatus: 3, shippingCompany: 7 });
  });
});
