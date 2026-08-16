import type { NewOrderPayload } from "query/orderCreateForm.api";
import type { OrderCreateFormState, OrderLineItem } from "./types";

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** yyyy-mm-dd (date input) → ISO string, or undefined when empty/invalid. */
export function dateInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Preserve the selected day but attach the actual submission time. */
export function orderDateInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return undefined;
  const [year, month, day] = parts;
  const timestamp = new Date();
  timestamp.setFullYear(year, month - 1, day);
  return Number.isNaN(timestamp.getTime()) ? undefined : timestamp.toISOString();
}

export function toNumber(value: string | number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(n: number): string {
  return Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function isImageUrl(value: string | null | undefined): boolean {
  return !!value && /^(https?:)?\/\//.test(value);
}

export function itemsTotal(lineItems: OrderLineItem[]): number {
  return lineItems.reduce((sum, li) => sum + toNumber(li.price) * toNumber(li.quantity), 0);
}

/** Suggested amount to collect = items + shipping − discount − down payment (never below zero). */
export function suggestedToBeCollected(
  lineItems: OrderLineItem[],
  shippingFees: string | number,
  downPayment: string | number,
  totalDiscounts: string | number = 0
): number {
  const total =
    itemsTotal(lineItems) +
    toNumber(shippingFees) -
    toNumber(totalDiscounts) -
    toNumber(downPayment);
  return Math.max(total, 0);
}

export function buildOrderPayload(form: OrderCreateFormState): NewOrderPayload {
  return {
    customer: {
      first_name: form.customer.firstName.trim(),
      last_name: form.customer.lastName.trim(),
      phone: form.customer.phone.trim(),
      email: form.customer.email.trim(),
      address1: form.customer.address1.trim(),
      address2: form.customer.address2.trim(),
      city: form.customer.city.trim(),
      province: form.customer.province.trim(),
      country: form.customer.country.trim(),
    },
    line_items: form.lineItems.map((li) => ({
      title: li.title,
      price: toNumber(li.price),
      quantity: toNumber(li.quantity) || 1,
      product_id: li.productId,
      variant_id: li.variantId,
      sku: li.sku ?? li.productCode ?? "",
    })),
    orderDate: orderDateInputToIso(form.orderDate),
    paymentStatus: form.paymentStatus,
    deliveryBy: form.deliveryBy,
    expectedDeliveryDate: dateInputToIso(form.expectedDeliveryDate),
    downPayment: toNumber(form.downPayment),
    shippingFees: toNumber(form.shippingFees),
    totalDiscounts: toNumber(form.totalDiscounts),
    toBeCollected: toNumber(form.toBeCollected),
  };
}
