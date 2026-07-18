/**
 * ثوابت صفحة تفاصيل المستخدم. البيانات كلها تأتي الآن من الـ API؛ هذا الملف يحوي فقط
 * خرائط العرض (ألوان الأقسام/النشاط) وقيم الثوابت العامة.
 */
import { HX } from "layouts/Orders/ordersHomixTheme";
import { ActivityTone, PermActionKind, PermTone } from "./types";

/** زوايا الحواف (--r في التصميم) */
export const R = "13px";

/** بديل العرض للحقول الفارغة/غير المتوفرة */
export const PLACEHOLDER = "—";

/** عنوان الصفحة الأب في مسار التنقل */
export const PARENT_LABEL = "المستخدمون";

/** خريطة ألوان الأقسام على رموز HX (خلفية + لون) */
export const TONE_MAP: Record<PermTone, { bg: string; color: string }> = {
  accent: { bg: HX.accentLight, color: HX.accent },
  amber: { bg: HX.amberLight, color: HX.amber },
  blue: { bg: HX.blueLight, color: HX.blue },
  green: { bg: HX.greenLight, color: HX.green },
  teal: { bg: HX.tealLight, color: HX.teal },
  purple: { bg: HX.purpleLight, color: HX.purple },
};

/** لون كل مجموعة صلاحيات حسب مفتاحها (permissionsSummary.groups[].key) */
export const GROUP_TONE: Record<string, PermTone> = {
  dashboard: "accent",
  orders: "accent",
  factory: "amber",
  products: "blue",
  vendors: "purple",
  employees: "teal",
  customers: "green",
  ship: "blue",
  finance: "green",
  tickets: "teal",
  notifications: "amber",
  users: "purple",
};
export const GROUP_TONE_FALLBACK: PermTone = "accent";

/** اشتقاق نوع الإجراء من لاحقة مفتاح الصلاحية (orders_view → view) */
const ACTION_BY_SUFFIX: Record<string, PermActionKind> = {
  view: "view",
  edit: "edit",
  create: "create",
  delete: "delete",
  export: "export",
  import: "export",
  settle: "check",
  close: "check",
  reply: "reply",
  manage: "shield",
  settings: "settings",
};
export function permActionFromKey(key: string): PermActionKind {
  const suffix = String(key).split("_").pop() ?? "";
  return ACTION_BY_SUFFIX[suffix] ?? "view";
}

/** نبرة عنصر النشاط حسب نوع الحدث */
export const ACTIVITY_TONE: Record<string, ActivityTone> = {
  login: "blue",
  logout: "amber",
  create: "green",
  update: "accent",
  edit: "accent",
  delete: "amber",
  settle: "green",
  close: "teal",
  reply: "teal",
};
export const ACTIVITY_TONE_FALLBACK: ActivityTone = "accent";
