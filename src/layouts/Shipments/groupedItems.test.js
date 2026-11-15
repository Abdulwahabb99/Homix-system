import { splitGroupedItems } from "./groupedItems";

const item = (id, inWarehouse, excluded = false) => ({
  id, operationNumber: String(id), orderNumber: "1", productName: "", productSku: "", sellerName: "",
  shipmentStatusLabel: "", inWarehouse, excluded, current: false,
});

describe("splitGroupedItems", () => {
  it("is complete when all counted items arrived", () => {
    expect(splitGroupedItems([item(1, true), item(2, true)])).toMatchObject({ complete: true, arrived: 2 });
  });

  it("is incomplete when one is missing", () => {
    expect(splitGroupedItems([item(1, true), item(2, false)])).toMatchObject({ complete: false, arrived: 1 });
  });

  it("ignores excluded items for completeness and lists them separately", () => {
    const r = splitGroupedItems([item(1, true), item(2, true), item(3, false, true)]);
    expect(r.complete).toBe(true);
    expect(r.counted).toHaveLength(2);
    expect(r.excluded.map((i) => i.id)).toEqual([3]);
  });

  it("is not complete when everything is excluded", () => {
    expect(splitGroupedItems([item(1, false, true)])).toMatchObject({ complete: false, counted: [] });
  });
});
