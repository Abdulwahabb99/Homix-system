/**
 * ثوابت صفحة المستخدمين — مطابقة لتصميم homix_users.html مع بيانات الأدوار الحقيقية.
 */
import { HX } from "layouts/Orders/ordersHomixTheme";
import { USER_TYPES_VALUES } from "shared/utils/constants";

/** زوايا الحواف (--r في التصميم) */
export const R = "13px";

/** حجم الصفحة (ترقيم من جانب العميل) */
export const PAGE_SIZE = 10;

/** عنوان الصفحة ووصفها */
export const PAGE_TITLE = "المستخدمون";
export const PAGE_SUBTITLE = "إدارة الفرق والصلاحيات";

/** بديل العرض للحقول غير المتوفرة من الـ API (الحالة / آخر دخول) */
export const PLACEHOLDER = "—";

/** بيانات عرض كل دور: شارة اللون + تدرّج صورة الحرف */
export interface RoleMeta {
  label: string;
  bg: string;
  color: string;
  gradient: string;
}
export const ROLE_META: Record<string, RoleMeta> = {
  "1": { label: "مدير",   bg: HX.accentLight, color: "#3730a3", gradient: "linear-gradient(135deg,#8b5cf6,#6366f1)" },
  "2": { label: "مورد",   bg: HX.blueLight,   color: "#1e40af", gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)" },
  "3": { label: "عمليات", bg: HX.tealLight,   color: "#0f766e", gradient: "linear-gradient(135deg,#14b8a6,#0f766e)" },
  "4": { label: "لوجستي", bg: HX.amberLight,  color: "#92400e", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
};
export const ROLE_FALLBACK: RoleMeta = {
  label: "—", bg: HX.surface3, color: HX.tx2, gradient: "linear-gradient(135deg,#9ca3af,#6b7280)",
};

export function roleMeta(userType: string | number | undefined): RoleMeta {
  return ROLE_META[String(userType)] ?? ROLE_FALLBACK;
}

/** تبويبات فلترة الدور: «الكل» + الأدوار الحقيقية */
export const ALL_ROLES = "all";
export const ROLE_TABS: { value: string; label: string }[] = [
  { value: ALL_ROLES, label: "الكل" },
  ...USER_TYPES_VALUES.map((r) => ({ value: String(r.value), label: r.label })),
];
