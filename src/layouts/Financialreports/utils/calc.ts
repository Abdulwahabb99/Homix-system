/**
 * دوال حسابية نقية لصفحة التقارير المالية — لا حالة ولا تأثيرات جانبية.
 * تُستخدم من الـ hook والمكوّنات على السواء.
 */
import { formatMoneyEgpInteger } from "shared/formatMoney";
import { CURRENCY } from "./constants";
import { SellerTotals, SettlementSeller } from "./types";

/** مبلغ منسّق بأرقام لاتينية + لاحقة العملة — «12,999 ج.م» */
export function money(value: unknown): string {
  return `${formatMoneyEgpInteger(value)} ${CURRENCY}`;
}

/** نسبة مئوية بخانة عشرية واحدة (part من whole) */
export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

/**
 * إجماليات صانع واحد — تُشتق مباشرةً من مجاميع المورّد القادمة من الـ BE
 * (لا جمع لطلبات فردية؛ الـ endpoint يُرجع المجاميع جاهزة).
 */
export function sellerTotals(seller: SettlementSeller): SellerTotals {
  const r = seller.row;
  const cost = Number(r.warehouseCost) || 0;
  const collect = Number(r.collectionTotal) || 0;
  const fine = Number(r.fines) || 0;
  const dueSeller = Number(r.vendorDue) || 0;
  const dueComp = Number(r.companyDue) || 0;
  const vendorShippingCost = r.orders.reduce(
    (total, order) => total + (Number(order.vendorShippingCost) || 0),
    0
  );
  return {
    orders: Number(r.ordersCount) || 0,
    cost,
    collect,
    fine,
    dueSeller,
    dueComp,
    vendorShippingCost,
    netRequired: cost - fine,
    totalCombined: dueSeller + dueComp,
  };
}
