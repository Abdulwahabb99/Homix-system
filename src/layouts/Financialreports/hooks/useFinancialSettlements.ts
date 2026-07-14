/**
 * مصدر بيانات تسويات الصناع للتقارير المالية.
 *
 * حالياً يُعيد بيانات ثابتة (mock) مطابقة لتصميم homix_financial_reports.html،
 * لكنه يُخفي ذلك خلف واجهة تشبه React Query ({ sellers, kpis, isLoading }).
 * عند ربط الـ BE لاحقاً: استبدل جسم الدالة باستعلام (useQuery) يُرجع نفس الشكل،
 * ومرّر `periodId` كمعامل للفلترة — دون تغيير أي مكوّن يستهلك هذا الـ hook.
 */
import { useMemo } from "react";
import { aggregateKpis } from "../utils/calc";
import { FinancialKpis, SettlementSeller } from "../utils/types";

/** بيانات ثابتة مؤقتة — تُستبدل باستجابة الـ BE لاحقاً */
const MOCK_SELLERS: SettlementSeller[] = [
  {
    id: "s1", name: "ركة للأثاث", cat: "غرف نوم • صالة",
    color: "linear-gradient(135deg,#8c7355,#5a4530)", initials: "ر",
    orders: [
      { op: "OP-2401", order: "31668", code: "RKA-001", cost: 9775, collect: 12999, pay: "cod", fine: 0, dueSeller: 9775, dueComp: 3224 },
      { op: "OP-2402", order: "31667", code: "RKA-002", cost: 12200, collect: 16999, pay: "cod", fine: 500, dueSeller: 11700, dueComp: 4799 },
      { op: "OP-2403", order: "31663", code: "RKA-003", cost: 12200, collect: 16999, pay: "online", fine: 0, dueSeller: 12200, dueComp: 4799 },
      { op: "OP-2404", order: "31662", code: "RKA-004", cost: 12200, collect: 16999, pay: "cod", fine: 0, dueSeller: 12200, dueComp: 4799 },
      { op: "OP-2405", order: "31658", code: "RKA-005", cost: 10000, collect: 15500, pay: "cod", fine: 1000, dueSeller: 9000, dueComp: 5500 },
    ],
  },
  {
    id: "s2", name: "دريسينج هاوس", cat: "دريسينج • غرف نوم",
    color: "linear-gradient(135deg,#4a7855,#2d5038)", initials: "د",
    orders: [
      { op: "OP-2410", order: "31666", code: "DRS-101", cost: 9775, collect: 12999, pay: "cod", fine: 0, dueSeller: 9775, dueComp: 3224 },
      { op: "OP-2411", order: "31665", code: "DRS-102", cost: 9775, collect: 12999, pay: "online", fine: 0, dueSeller: 9775, dueComp: 3224 },
      { op: "OP-2412", order: "31657", code: "DRS-103", cost: 6500, collect: 8900, pay: "online", fine: 500, dueSeller: 6000, dueComp: 2400 },
    ],
  },
  {
    id: "s3", name: "بين باج", cat: "سفرة • كراسي",
    color: "linear-gradient(135deg,#a07840,#6b5030)", initials: "ب",
    orders: [
      { op: "OP-2420", order: "31661", code: "BNG-201", cost: 1200, collect: 2299, pay: "cod", fine: 0, dueSeller: 1200, dueComp: 1099 },
      { op: "OP-2421", order: "31660", code: "BNG-202", cost: 1200, collect: 2299, pay: "cod", fine: 0, dueSeller: 1200, dueComp: 1099 },
      { op: "OP-2422", order: "31659", code: "BNG-203", cost: 1200, collect: 2299, pay: "cod", fine: 500, dueSeller: 700, dueComp: 1099 },
    ],
  },
  {
    id: "s4", name: "مصنع المودرن", cat: "صالة • مطبخ",
    color: "linear-gradient(135deg,#5a4070,#3a2850)", initials: "م",
    orders: [
      { op: "OP-2430", order: "31655", code: "MOD-301", cost: 8000, collect: 11500, pay: "online", fine: 0, dueSeller: 8000, dueComp: 3500 },
      { op: "OP-2431", order: "31654", code: "MOD-302", cost: 6200, collect: 9200, pay: "cod", fine: 1000, dueSeller: 5200, dueComp: 3000 },
    ],
  },
];

export interface UseFinancialSettlementsResult {
  sellers: SettlementSeller[];
  kpis: FinancialKpis;
  isLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useFinancialSettlements(periodId?: string): UseFinancialSettlementsResult {
  // TODO(BE): استبدل بـ useQuery({ queryKey: ["financial-settlements", periodId], queryFn })
  const sellers = MOCK_SELLERS;
  const kpis = useMemo(() => aggregateKpis(sellers), [sellers]);
  return { sellers, kpis, isLoading: false };
}
