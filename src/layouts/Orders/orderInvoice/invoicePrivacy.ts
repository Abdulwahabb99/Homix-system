const VENDOR_USER_TYPE = "2";

/**
 * The API uses `1` for Homix delivery. Shipment details may return the Arabic
 * label instead, so invoices accept both representations.
 */
export function isHomixDelivery(deliveryBy: unknown): boolean {
  const normalized = String(deliveryBy ?? "").trim().toLowerCase();
  return normalized === "1" || normalized === "homix" || normalized === "هوميكس";
}

/** Vendor invoices must not expose customer contact data for Homix delivery. */
export function shouldHideInvoiceCustomerContact(userType: unknown, deliveryBy: unknown): boolean {
  return String(userType ?? "") === VENDOR_USER_TYPE && isHomixDelivery(deliveryBy);
}
