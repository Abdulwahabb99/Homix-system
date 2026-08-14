import type { NewOrderPayload } from "query/orderCreateForm.api";
import type { OrderCreateFormState, OrderLineItem } from "./types";

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** yyyy-mm-dd (date input) → ISO string, or undefined when empty/invalid. */
export function dateInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
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

/** Suggested amount to collect = items + shipping − down payment (never below zero). */
export function suggestedToBeCollected(
  lineItems: OrderLineItem[],
  shippingFees: string | number,
  downPayment: string | number
): number {
  const total = itemsTotal(lineItems) + toNumber(shippingFees) - toNumber(downPayment);
  return Math.max(total, 0);
}

export function buildOrderPayload(form: OrderCreateFormState): NewOrderPayload {
  return {
    customer: {
      first_name: form.customer.firstName.trim(),
      last_name: form.customer.lastName.trim(),
      phone: form.customer.phone.trim(),
    },
    line_items: form.lineItems.map((li) => ({
      title: li.title,
      price: toNumber(li.price),
      quantity: toNumber(li.quantity) || 1,
      product_id: li.productId,
      variant_id: li.variantId,
    })),
    orderDate: dateInputToIso(form.orderDate),
    paymentStatus: form.paymentStatus,
    deliveryBy: form.deliveryBy,
    expectedDeliveryDate: dateInputToIso(form.expectedDeliveryDate),
    downPayment: toNumber(form.downPayment),
    shippingFees: toNumber(form.shippingFees),
    toBeCollected: toNumber(form.toBeCollected),
  };
}
