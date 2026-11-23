import { shipmentLineItem } from "./shipmentLineItem";

describe("shipmentLineItem", () => {
  it("sends the Shopify id as product_id so the order is attributed to the real product/vendor", () => {
    const item = shipmentLineItem({ id: 3, shopifyId: "900", title: "قميص", variants: [{ shopifyId: "111", price: 150 }] });
    expect(item).toEqual({ title: "قميص", price: "150", quantity: 1, variant_id: "111", product_id: "900" });
  });

  it("references system products by local:<id> with the local variant id", () => {
    const item = shipmentLineItem({ id: 12, shopifyId: null, title: "جديد", variants: [{ id: "local-ab12cd34", price: "99.5" }] });
    expect(item).toEqual({ title: "جديد", price: "99.5", quantity: 1, variant_id: "local-ab12cd34", product_id: "local:12" });
  });

  it("omits empty price/variant", () => {
    const item = shipmentLineItem({ id: 5, title: "x", variants: [{}] });
    expect(item.price).toBeUndefined();
    expect(item.variant_id).toBeUndefined();
  });
});
