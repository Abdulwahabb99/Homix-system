import { splitImportedOrderByUnit } from "./order-discounts";

const discounts = (orders: ReturnType<typeof splitImportedOrderByUnit>): number[] =>
  orders.map((order) => Number(order.line_items?.[0]?.discount ?? 0));

describe("splitImportedOrderByUnit", () => {
  it("keeps Shopify line allocations and divides a line discount over its units", () => {
    const result = splitImportedOrderByUnit({
      line_items: [
        { discount_allocations: [{ amount: "60.00" }], price: "100", quantity: 2 },
        { discount_allocations: [{ amount: "20.00" }], price: "200", quantity: 1 },
      ],
      total_discounts: "80.00",
    });

    expect(discounts(result)).toEqual([30, 30, 20]);
  });

  it("distributes an order-level discount proportionally when allocations are absent", () => {
    const result = splitImportedOrderByUnit({
      line_items: [
        { price: "300", quantity: 2 },
        { price: "400", quantity: 1 },
      ],
      total_discounts: "100.00",
    });

    expect(discounts(result)).toEqual([30, 30, 40]);
  });

  it("preserves every cent when a discount cannot divide evenly by quantity", () => {
    const result = splitImportedOrderByUnit({
      line_items: [{ discount_allocations: [{ amount: "10.00" }], price: "100", quantity: 3 }],
      total_discounts: "10.00",
    });

    expect(discounts(result)).toEqual([3.34, 3.33, 3.33]);
    expect(discounts(result).reduce((sum, discount) => sum + discount, 0)).toBeCloseTo(10, 2);
  });

  it("fills a missing allocation remainder without overwriting supplied allocations", () => {
    const result = splitImportedOrderByUnit({
      line_items: [
        { discount_allocations: [{ amount: "30.00" }], price: "100", quantity: 1 },
        { price: "100", quantity: 1 },
      ],
      total_discounts: "50.00",
    });

    expect(discounts(result)).toEqual([30, 20]);
    expect(discounts(result).reduce((sum, discount) => sum + discount, 0)).toBe(50);
  });

  it("never assigns a line more discount than its gross price", () => {
    const result = splitImportedOrderByUnit({
      line_items: [
        { discount_allocations: [{ amount: "90.00" }], price: "100", quantity: 1 },
        { price: "5", quantity: 1 },
      ],
      total_discounts: "100.00",
    });

    expect(discounts(result)).toEqual([95, 5]);
  });
});
