/**
 * ثوابت صفحة التقارير المالية.
 * القيم الديناميكية (نطاق الفترة/حالتها/المجاميع) تأتي من الـ BE عبر
 * `query/financialReport`؛ هنا فقط الثوابت الثابتة للعرض.
 */
import { SettlementTabKey, PayMethod, BillingDay } from "./types";

/** عملة العرض */
export const CURRENCY = "ج.م";

/** زوايا الحواف كما في التصميم (--r / --r-sm) */
export const R = "14px";
export const R_SM = "10px";

/** عنوان الصفحة ووصفها (للشريط العلوي) */
export const PAGE_TITLE = "التقارير المالية";
export const PAGE_SUBTITLE = "الفواتير الدورية للصناع — يوم 13 ويوم 28 من كل شهر";

/** دورة الفوترة — أزرار الاختيار (pills) حسب يوم الفوترة المتاح */
export interface BillingDayOption {
  day: BillingDay;
  label: string;
}
export const BILLING_DAY_OPTIONS: BillingDayOption[] = [
  { day: 13, label: "يوم 13" },
  { day: 28, label: "يوم 28" },
];
export const DEFAULT_BILLING_DAY: BillingDay = 28;

/** نص بديل لنطاق الفترة قبل وصول بيانات الدورة */
export const PERIOD_RANGE_FALLBACK = "—";

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
