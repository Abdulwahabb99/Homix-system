import { isHomixDelivery, shouldHideInvoiceCustomerContact } from "./invoicePrivacy";

describe("invoice customer privacy", () => {
  it.each([1, "1", "Homix", "هوميكس"])("recognizes %p as Homix delivery", (deliveryBy) => {
    expect(isHomixDelivery(deliveryBy)).toBe(true);
  });

  it("hides contact data for vendor users when Homix handles delivery", () => {
    expect(shouldHideInvoiceCustomerContact("2", 1)).toBe(true);
  });

  it("keeps contact data for non-vendors", () => {
    expect(shouldHideInvoiceCustomerContact("1", 1)).toBe(false);
    expect(shouldHideInvoiceCustomerContact("3", 1)).toBe(false);
  });

  it("keeps contact data for vendor delivery", () => {
    expect(shouldHideInvoiceCustomerContact("2", 2)).toBe(false);
  });
});
