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

  it("returns nothing when nothing besides the edit changed or data is missing", () => {
    expect(
      getDerivedStatusChanges({ status: 1, confirmationStatus: 1 }, { status: 1, confirmationStatus: 6 }, ["confirmationStatus"])
    ).toEqual([]);
    expect(getDerivedStatusChanges(null, { status: 1 })).toEqual([]);
    expect(getDerivedStatusChanges({ status: 1 }, undefined)).toEqual([]);
  });
});
