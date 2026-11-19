import { getDerivedStatusChanges } from "./derivedStatusChanges";

describe("getDerivedStatusChanges", () => {
  it("reports the fields the server changed besides the one the user edited", () => {
    const changes = getDerivedStatusChanges(
      { status: 2, shipmentStatus: 3, confirmationStatus: 1 },
      { status: 9, shipmentStatus: 13, confirmationStatus: 7 },
      ["confirmationStatus"]
    );
    expect(changes.map((c) => [c.field, c.to])).toEqual([
      ["status", 9],
      ["shipmentStatus", 13],
    ]);
    expect(changes[0].message).toContain("حالة الطلب");
    expect(changes[1].message).toContain("حالة الشحنة");
  });

  it("reports a derived confirmation status when the order status was edited", () => {
    const changes = getDerivedStatusChanges(
      { status: 2, shipmentStatus: 3, confirmationStatus: 1 },
      { status: 11, shipmentStatus: 15, confirmationStatus: 7 },
      ["status"]
    );
    expect(changes.map((c) => c.field)).toEqual(["shipmentStatus", "confirmationStatus"]);
  });

  it("reports the reopened order and shipment when confirmation goes back to confirmed", () => {
    const changes = getDerivedStatusChanges(
      { status: 10, shipmentStatus: 14, confirmationStatus: 9 },
      { status: 3, shipmentStatus: 1, confirmationStatus: 2 },
      ["confirmationStatus"]
    );
    expect(changes.map((c) => [c.field, c.to])).toEqual([
      ["status", 3],
      ["shipmentStatus", 1],
    ]);
    expect(changes[0].message).toContain("مؤكد");
    expect(changes[1].message).toContain("معلقة");
  });

  it("reports order 'معلق' and shipment 'معلقة' when confirmation goes back to 'لا رد' on a cancelled order", () => {
    const changes = getDerivedStatusChanges(
      { status: 10, shipmentStatus: 14, confirmationStatus: 7 },
      { status: 1, shipmentStatus: 1, confirmationStatus: 3 },
      ["confirmationStatus"]
    );
    expect(changes.map((c) => [c.field, c.to])).toEqual([
      ["status", 1],
      ["shipmentStatus", 1],
    ]);
    expect(changes[0].message).toContain("معلق");
    expect(changes[1].message).toContain("معلقة");
  });

  it("reports order 'معلق' when confirmation goes back to 'معلق' on a confirmed order", () => {
    const changes = getDerivedStatusChanges(
      { status: 3, shipmentStatus: 1, confirmationStatus: 2 },
      { status: 1, shipmentStatus: 1, confirmationStatus: 1 },
      ["confirmationStatus"]
    );
    expect(changes.map((c) => [c.field, c.to])).toEqual([["status", 1]]);
    expect(changes[0].message).toContain("معلق");
  });

  it("returns nothing when nothing besides the edit changed or data is missing", () => {
    expect(
      getDerivedStatusChanges({ status: 1, confirmationStatus: 1 }, { status: 1, confirmationStatus: 6 }, ["confirmationStatus"])
    ).toEqual([]);
    expect(getDerivedStatusChanges(null, { status: 1 })).toEqual([]);
    expect(getDerivedStatusChanges({ status: 1 }, undefined)).toEqual([]);
  });
});
