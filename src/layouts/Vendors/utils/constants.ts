/**
 * ثوابت صفحة الموردين — مطابقة لتصميم homix_vendors.html مع بيانات الـ API الحقيقية.
 */
import { VendorStatusFilter } from "./types";

export const R = "13px";
export const PAGE_SIZE = 10;

export const PAGE_TITLE = "الموردون";
export const PAGE_SUBTITLE = "إدارة موردي ومنصات HOMIX Marketplace";

/** بديل العرض للحقول غير المتوفرة من الـ API (الأونيت مانجر) */
export const PLACEHOLDER = "—";

/** خيارات فلتر الحالة */
export const STATUS_FILTERS: { value: VendorStatusFilter; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "غير نشط" },
];

/** عتبات تصنيف مدة الشحن (بالأيام) */
export const SHIP_FAST_MAX = 2;
export const SHIP_MID_MAX = 5;

/** تدرّجات لونية لصورة الحرف — تُختار بثبات حسب اسم المورد */
export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#14b8a6,#0f766e)",
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
  "linear-gradient(135deg,#3b82f6,#1d4ed8)",
  "linear-gradient(135deg,#f43f5e,#e11d48)",
];

export function avatarGradient(name: string): string {
  const n = name || "?";
  let h = 0;
  for (let i = 0; i < n.length; i += 1) h = (h * 31 + n.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[h];
}

export function initials(name: string): string {
  return (name || "؟")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ?? "").toUpperCase())
    .join("") || "؟";
}
