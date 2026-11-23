/**
 * دوال حسابية نقية لصفحة التقارير المالية — لا حالة ولا تأثيرات جانبية.
 * تُستخدم من الـ hook والمكوّنات على السواء.
 */
import { arNum } from "./format";
import { CURRENCY } from "./constants";
import { SellerTotals, SettlementOrder, SettlementSeller, VendorRow } from "./types";
import { countsTowardCompanyDue } from "./companyDue";

/** مبلغ منسّق بأرقام لاتينية + لاحقة العملة — «12,999 ج.م» */
export function money(value: unknown): string {
  return `${arNum(value)} ${CURRENCY}`;
}

/** نسبة مئوية بخانة عشرية واحدة (part من whole) */
export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

/** صافي صف مورّد الموقّع = مستحق البائع (إجمالي) − مستحق هوميكس − الغرامات */
export function rowNet(row: Pick<VendorRow, "vendorDue" | "companyDue" | "fines">): number {
  return Math.round(((Number(row.vendorDue) || 0) - (Number(row.companyDue) || 0) - (Number(row.fines) || 0)) * 100) / 100;
}

/** صافي بند واحد الموقّع = مستحق البائع − مستحق هوميكس (تسليمات البائع فقط) − الغرامات */
export function orderNet(order: Pick<SettlementOrder, "vendorDue" | "companyDue" | "fines" | "companyDueKind" | "shipmentId">): number {
  const company = countsTowardCompanyDue(order) ? Number(order.companyDue) || 0 : 0;
  return Math.round(((Number(order.vendorDue) || 0) - company - (Number(order.fines) || 0)) * 100) / 100;
}

/** مبلغ موقّع للعرض: «−400 ج.م» للسالب */
export function signedMoney(value: number): string {
  return value < 0 ? `−${money(Math.abs(value))}` : money(value);
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
  const net = rowNet(r);
  return {
    orders: Number(r.ordersCount) || 0,
    cost,
    collect,
    fine,
    dueSeller,
    dueComp,
    homixMargin: Number(r.homixMargin) || 0,
    vendorOwes: Number(r.vendorOwes) || 0,
    vendorShippingCost,
    net,
    netRequired: net,
  };
}
