import { mapListItemRow } from "./ordersList";

describe("orders list row mapping", () => {
  it("feeds «حالة التأخير» from deliveryStatus, never from manufactureStatus", () => {
    const row = mapListItemRow({ id: 1, deliveryStatus: 3, manufactureStatus: 5 });
    expect(row.deliveryStatus).toBe(3);
    expect(row.manufactureStatus).toBe(5);
  });

  it("leaves the delay status undefined when the API sends none (manufacture status must not leak in)", () => {
    const row = mapListItemRow({ id: 1, deliveryStatus: null, manufactureStatus: 2 });
    expect(row.deliveryStatus).toBeUndefined();
    expect(row.manufactureStatus).toBe(2);
  });
});
