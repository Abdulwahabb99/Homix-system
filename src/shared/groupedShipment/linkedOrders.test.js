import { getLinkedOrderIds, linkedOrdersToastMessage } from "./linkedOrders";

describe("getLinkedOrderIds", () => {
  it("reads the ids from data (single edit, shipments bulk) and from the root (orders bulk)", () => {
    expect(getLinkedOrderIds({ data: { id: 1, linkedOrderIds: [2, 3] }, status: true })).toEqual([2, 3]);
    expect(getLinkedOrderIds({ message: "ok", linkedOrderIds: [4], status: true })).toEqual([4]);
  });
  it("returns an empty list when nothing cascaded or the body is unexpected", () => {
    expect(getLinkedOrderIds({ data: { id: 1 } })).toEqual([]);
    expect(getLinkedOrderIds(undefined)).toEqual([]);
    expect(getLinkedOrderIds({ data: { linkedOrderIds: "x" } })).toEqual([]);
  });
  it("drops invalid ids", () => {
    expect(getLinkedOrderIds({ data: { linkedOrderIds: [2, "abc", 0, "5"] } })).toEqual([2, 5]);
  });
});

describe("linkedOrdersToastMessage", () => {
  it("builds the Arabic toast only when orders were updated", () => {
    expect(linkedOrdersToastMessage(3)).toBe("تم تحديث 3 طلب مرتبط");
    expect(linkedOrdersToastMessage(0)).toBeNull();
  });
});
