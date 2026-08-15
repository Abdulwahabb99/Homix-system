import { calculateVendorDeliverySettlement } from "./order-financial-settlement";

describe("calculateVendorDeliverySettlement", () => {
  it("makes a positive balance due to Homix", () => {
    expect(calculateVendorDeliverySettlement({
      collectionTotal: 1000,
      productCost: 500,
      vendorShippingCost: 200,
    })).toEqual({ balance: 300, companyDue: 300, vendorDue: 0 });
  });

  it("makes the absolute value of a negative balance due to the vendor", () => {
    expect(calculateVendorDeliverySettlement({
      collectionTotal: 1000,
      productCost: 900,
      vendorShippingCost: 200,
    })).toEqual({ balance: -100, companyDue: 0, vendorDue: 100 });
  });

  it("deducts fines from the vendor due without making it negative", () => {
    expect(calculateVendorDeliverySettlement({
      collectionTotal: 1000,
      fines: 30,
      productCost: 900,
      vendorShippingCost: 200,
    })).toEqual({ balance: -100, companyDue: 0, vendorDue: 70 });

    expect(calculateVendorDeliverySettlement({
      collectionTotal: 1000,
      fines: 150,
      productCost: 900,
      vendorShippingCost: 200,
    }).vendorDue).toBe(0);
  });

  it("does not use any order shipping value", () => {
    expect(calculateVendorDeliverySettlement({
      collectionTotal: "1000.00",
      productCost: "500.00",
      vendorShippingCost: "0",
    })).toEqual({ balance: 500, companyDue: 500, vendorDue: 0 });
  });
});
