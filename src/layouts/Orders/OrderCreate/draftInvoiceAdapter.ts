/**
 * يبني نموذج فاتورة من الطلب قيد الإنشاء (قبل الحفظ) بنفس الشكل الذي يقرأه
 * `OrderInvoiceDocument`، مع إمكانية قصر الفاتورة على أصناف مختارة فقط.
 *
 * الطلب لم يُحفظ بعد فلا يوجد رقم طلب أو كود عملية — نتركهما فارغين بدل اختلاق قيمة.
 */
import type { OrderCreateFormState, OrderLineItem } from "./types";
import { toNumber } from "./utils";

export interface DraftInvoiceModel {
  code: string;
  createdAt: string | null;
  customer: { address: string; name: string; phoneNumber: string };
  downPayment: number;
  name: string;
  orderLines: {
    id: string;
    price: number;
    product: { image: string | null };
    quantity: number;
    sku: string;
    title: string;
  }[];
  orderNumber: string;
  paymentStatus: number;
  shippingFees: number;
  subTotalPrice: number;
  toBeCollected: number;
  totalDiscounts: number;
  totalPrice: number;
}

export function buildDraftInvoiceModel(
  form: OrderCreateFormState,
  selectedKeys: string[]
): DraftInvoiceModel {
  const selected = new Set(selectedKeys);
  const items: OrderLineItem[] = form.lineItems.filter((item) => selected.has(item.key));

  const orderLines = items.map((item) => ({
    id: item.key,
    price: toNumber(item.price),
    product: { image: item.image ?? null },
    quantity: toNumber(item.quantity) || 1,
    sku: item.sku ?? item.productCode ?? "",
    title: item.title,
  }));

  const subTotalPrice = orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  /* الشحن وجدية الشراء يخصّان الطلب ككل. عند إصدار فاتورة لجزء من الأصناف نوزّعهما
     بنسبة قيمة الأصناف المختارة، وإلا ظهرت الفاتورة الجزئية بشحن الطلب كاملاً. */
  const fullTotal = form.lineItems.reduce(
    (sum, item) => sum + toNumber(item.price) * (toNumber(item.quantity) || 1),
    0
  );
  const share = fullTotal > 0 ? subTotalPrice / fullTotal : 1;
  const round2 = (value: number) => Math.round(value * 100) / 100;

  const shippingFees = round2(toNumber(form.shippingFees) * share);
  const downPayment = round2(toNumber(form.downPayment) * share);
  const customerAddress = [
    form.customer.address1,
    form.customer.address2,
    form.customer.city,
    form.customer.province,
    form.customer.country,
  ].map((part) => part.trim()).filter(Boolean).join("، ");

  return {
    code: "",
    createdAt: form.orderDate || null,
    customer: {
      address: customerAddress,
      name: `${form.customer.firstName} ${form.customer.lastName}`.trim(),
      phoneNumber: form.customer.phone,
    },
    downPayment,
    name: "",
    orderLines,
    orderNumber: "",
    paymentStatus: form.paymentStatus,
    shippingFees,
    subTotalPrice,
    toBeCollected: Math.max(0, subTotalPrice + shippingFees - downPayment),
    totalDiscounts: 0,
    totalPrice: subTotalPrice,
  };
}
