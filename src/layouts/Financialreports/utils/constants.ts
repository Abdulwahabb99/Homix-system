/**
 * ثوابت صفحة التقارير المالية — مطابقة لتصميم homix_financial_reports.html.
 * لا JSX هنا (الأيقونات تُربط داخل المكوّنات).
 */
import { SettlementTabKey, PayMethod } from "./types";

/** عملة العرض */
export const CURRENCY = "ج.م";

/** زوايا الحواف كما في التصميم (--r / --r-sm) */
export const R = "14px";
export const R_SM = "10px";

/** عنوان الصفحة ووصفها (للشريط العلوي) */
export const PAGE_TITLE = "التقارير المالية";
export const PAGE_SUBTITLE = "الفواتير الدورية للصناع — يوم 13 ويوم 28 من كل شهر";

/** دورة الفوترة — أزرار الاختيار (pills) */
export interface PeriodOption {
  id: string;
  label: string;
}
export const PERIOD_OPTIONS: PeriodOption[] = [
  { id: "13", label: "يوم 13 أبريل" },
  { id: "28", label: "يوم 28 أبريل ✓" },
];
export const DEFAULT_PERIOD_ID = "28";

/** نص الفترة وحالتها (ثابت حالياً — سيأتي من الـ BE لاحقاً) */
export const PERIOD_RANGE_LABEL = "الفترة: 14 مارس — 28 أبريل 2025";
export const PERIOD_STATUS_LABEL = "قيد المعالجة";

/** شارة KPI المبيعات مقارنةً بالدورة السابقة — placeholder حتى توفّر الـ BE المقارنة */
export const SALES_TREND_BADGE = "↑ 12.4% من الدورة السابقة";

/** طرق الدفع */
export const PAY_LABELS: Record<PayMethod, string> = {
  cod: "عند الاستلام",
  online: "أونلاين",
};

/** تبويبات جدول التسويات */
export interface TabMeta {
  key: SettlementTabKey;
  label: string;
}
export const TABS: TabMeta[] = [
  { key: "warehouse", label: "تسويات المخزن" },
  { key: "seller", label: "تسويات البائع" },
  { key: "comprehensive", label: "الفاتورة الشاملة" },
];
export const DEFAULT_TAB: SettlementTabKey = "warehouse";

/** نص التنويه أسفل الفاتورة الشاملة */
export const COMPREHENSIVE_NOTE = "ⓘ الفاتورة الشاملة = تسويات المخزن + تسويات البائع";
