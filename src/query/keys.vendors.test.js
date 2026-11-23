import { vendorKeys } from "./keys";

describe("vendorKeys", () => {
  it("keeps the vendors list cache separate from the {label,value} options cache", () => {
    // Orders stores filter options under `options`; the Vendors page stores full vendor objects under `list`.
    // Sharing one key made the Vendors page render blank rows after visiting Orders.
    expect(vendorKeys.options()).not.toEqual(vendorKeys.list());
    expect(vendorKeys.options().slice(0, 1)).toEqual(vendorKeys.all());
    expect(vendorKeys.list().slice(0, 1)).toEqual(vendorKeys.all());
  });
});
