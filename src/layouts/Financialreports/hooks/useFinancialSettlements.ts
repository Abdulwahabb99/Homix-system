/**
 * مصدر بيانات تسويات الصناع للتقارير المالية.
 *
 * يستهلك `useFinancialReport(billingDay)` (query/financialReport) ويحوّل أقسام
 * الاستجابة الثلاثة إلى قوائم عرض (SettlementSeller) لكل تبويب، مع اشتقاق
 * مؤشرات الأعلى (KPIs) من الملخّص العام. هوية العرض (اللون/الحرف) تُشتق محلياً
 * لأن الـ BE لا يوفّرها.
 */
import { useMemo } from "react";
import {
  useFinancialReport,
  FinancialSection,
  FinancialVendorItem,
  FinancialCycle,
} from "query/financialReport";
import { pct } from "../utils/calc";
import { BillingDay, FinancialKpis, SettlementSeller, SettlementTabKey } from "../utils/types";

/** تدرّجات لونية لصور الأحرف (avatars) — تُوزّع بالترتيب على الموردين */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#8c7355,#5a4530)",
  "linear-gradient(135deg,#4a7855,#2d5038)",
  "linear-gradient(135deg,#a07840,#6b5030)",
  "linear-gradient(135deg,#5a4070,#3a2850)",
  "linear-gradient(135deg,#3a5a80,#24354d)",
  "linear-gradient(135deg,#804040,#4d2828)",
];

function initialsOf(name: string): string {
  const s = (name || "").trim();
  if (!s) return "؟";
  return s.split(/\s+/)[0]?.[0] ?? "؟";
}

function toSeller(item: FinancialVendorItem, index: number): SettlementSeller {
  return {
    id: String(item.vendorId),
    name: item.vendorName,
    cat: "",
    color: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
    initials: initialsOf(item.vendorName),
    row: {
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      ordersCount: item.ordersCount,
      warehouseCost: item.warehouseCost,
      collectionTotal: item.collectionTotal,
      fines: item.fines,
      vendorDue: item.vendorDue,
      companyDue: item.companyDue,
      orders: item.orders,
    },
  };
}

const toSellers = (section: FinancialSection): SettlementSeller[] => section.items.map(toSeller);

const EMPTY_SECTIONS: Record<SettlementTabKey, SettlementSeller[]> = {
  warehouse: [],
  seller: [],
  comprehensive: [],
};

const EMPTY_KPIS: FinancialKpis = {
  sellersCount: 0,
  totalSales: 0,
  totalDueSeller: 0,
  totalDueComp: 0,
  totalFine: 0,
  ordersCount: 0,
  lateSellersCount: 0,
  dueSellerPct: 0,
  dueCompPct: 0,
};

export interface UseFinancialSettlementsResult {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  kpis: FinancialKpis;
  cycle: FinancialCycle | null;
  /** قوائم الموردين لكل تبويب (تسويات المخزن / البائع / الفاتورة الشاملة) */
  sections: Record<SettlementTabKey, SettlementSeller[]>;
}

export function useFinancialSettlements(billingDay: BillingDay): UseFinancialSettlementsResult {
  const { data, isLoading, isError, isFetching } = useFinancialReport(billingDay);

  return useMemo(() => {
    if (!data) {
      return { isLoading, isError, isFetching, kpis: EMPTY_KPIS, cycle: null, sections: EMPTY_SECTIONS };
    }

    const { summary, fullInvoice, vendorDeliveries, warehouseDeliveries, cycle } = data;

    const kpis: FinancialKpis = {
      sellersCount: summary.vendorsCount,
      totalSales: summary.totalSales,
      totalDueSeller: summary.vendorDue,
      totalDueComp: summary.companyDue,
      totalFine: summary.fines,
      ordersCount: fullInvoice.summary.ordersCount,
      lateSellersCount: fullInvoice.items.filter((i) => i.fines > 0).length,
      dueSellerPct: pct(summary.vendorDue, summary.totalSales),
      dueCompPct: pct(summary.companyDue, summary.totalSales),
    };

    const sections: Record<SettlementTabKey, SettlementSeller[]> = {
      warehouse: toSellers(warehouseDeliveries),
      seller: toSellers(vendorDeliveries),
      comprehensive: toSellers(fullInvoice),
    };

    return { isLoading, isError, isFetching, kpis, cycle, sections };
  }, [data, isLoading, isError, isFetching]);
}
