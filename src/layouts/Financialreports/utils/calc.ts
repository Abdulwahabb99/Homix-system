/**
 * دوال حسابية نقية لصفحة التقارير المالية — لا حالة ولا تأثيرات جانبية.
 * تُستخدم من الـ hook والمكوّنات على السواء.
 */
import { formatMoneyEgpInteger } from "shared/formatMoney";
import { CURRENCY } from "./constants";
import { FinancialKpis, SellerTotals, SettlementSeller } from "./types";

/** مبلغ منسّق بأرقام لاتينية + لاحقة العملة — «12,999 ج.م» */
export function money(value: unknown): string {
  return `${formatMoneyEgpInteger(value)} ${CURRENCY}`;
}

const sum = <T>(arr: T[], pick: (x: T) => number) =>
  arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);

/** إجماليات صانع واحد */
export function sellerTotals(seller: SettlementSeller): SellerTotals {
  const { orders } = seller;
  const cost = sum(orders, (o) => o.cost);
  const collect = sum(orders, (o) => o.collect);
  const fine = sum(orders, (o) => o.fine);
  const dueSeller = sum(orders, (o) => o.dueSeller);
  const dueComp = sum(orders, (o) => o.dueComp);
  return {
    orders: orders.length,
    cost,
    collect,
    fine,
    dueSeller,
    dueComp,
    netRequired: cost - fine,
    netAfterFine: dueSeller - fine,
    totalCombined: dueSeller + dueComp,
  };
}

/** مؤشرات أعلى الصفحة مُجمّعة من كل الصناع */
export function aggregateKpis(sellers: SettlementSeller[]): FinancialKpis {
  const totals = sellers.map(sellerTotals);
  const totalSales = sum(totals, (t) => t.collect);
  const totalDueSeller = sum(totals, (t) => t.dueSeller);
  const totalDueComp = sum(totals, (t) => t.dueComp);
  const totalFine = sum(totals, (t) => t.fine);
  const lateSellersCount = totals.filter((t) => t.fine > 0).length;
  const pct = (part: number) => (totalSales > 0 ? Math.round((part / totalSales) * 1000) / 10 : 0);
  return {
    sellersCount: sellers.length,
    totalSales,
    totalDueSeller,
    totalDueComp,
    totalFine,
    lateSellersCount,
    dueSellerPct: pct(totalDueSeller),
    dueCompPct: pct(totalDueComp),
  };
}
