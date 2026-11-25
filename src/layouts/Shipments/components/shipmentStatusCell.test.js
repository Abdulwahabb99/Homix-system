import { canEditShipmentStatusInline, normalizeShipmentStatusId } from "./shipmentStatusCell";

describe("normalizeShipmentStatusId", () => {
  it.each([null, undefined, 0, -1, "", "abc", NaN, 1.5])("maps %p to 1", (v) => {
    expect(normalizeShipmentStatusId(v)).toBe(1);
  });
  it("keeps real ids", () => {
    expect(normalizeShipmentStatusId(4)).toBe(4);
    expect(normalizeShipmentStatusId("12")).toBe(12);
  });
  it("maps ids missing from the known list to 1", () => {
    expect(normalizeShipmentStatusId(99, [1, 2, 4])).toBe(1);
    expect(normalizeShipmentStatusId(4, [1, 2, 4])).toBe(4);
  });
});

describe("canEditShipmentStatusInline", () => {
  it("shows the dropdown to staff and a read-only badge to vendors", () => {
    expect(canEditShipmentStatusInline(false)).toBe(true);
    expect(canEditShipmentStatusInline(true)).toBe(false);
  });
});
