/**
 * أنواع صفحة تفاصيل المستخدم.
 * البيانات الحقيقية تأتي من `GET /users/:id` (AppUser)؛ الصلاحيات وسجل النشاط
 * وبيانات التحويل ثابتة (static) حالياً لحين ربطها بالـ BE مستقبلاً.
 */
import { AppUser } from "../../utils/types";

export type { AppUser };

/** نوع إجراء الصلاحية — يحدّد الأيقونة المعروضة بجوار العنصر */
export type PermActionKind =
  | "view"
  | "edit"
  | "create"
  | "delete"
  | "export"
  | "check"
  | "reply"
  | "shield"
  | "settings";

/** لون قسم الصلاحيات (مفتاح ثيم HX) */
export type PermTone = "accent" | "amber" | "blue" | "green" | "teal" | "purple";

/** عنصر صلاحية واحد داخل القسم */
export interface PermissionItem {
  label: string;
  action: PermActionKind;
  /** مفعّلة/معطّلة — ثابتة حالياً */
  enabled: boolean;
}

/** قسم صلاحيات (الطلبات، الصناع، ...) */
export interface PermissionSection {
  key: string;
  name: string;
  tone: PermTone;
  items: PermissionItem[];
}

/** نبرة عنصر سجل النشاط (تحدّد لون النقطة) */
export type ActivityTone = "green" | "accent" | "teal" | "amber" | "blue";

/** عنصر واحد في سجل النشاط — ثابت حالياً */
export interface ActivityEntry {
  id: string;
  action: string;
  detail: string;
  time: string;
  tone: ActivityTone;
  icon: "check" | "factory" | "ticket" | "money" | "edit";
}

/** بيانات التحويل البنكي — ثابتة حالياً */
export interface BankTransfer {
  bankName: string;
  accountType: string;
  accountName: string;
  accountNumber: string;
  /** الرقم بدون مسافات للنسخ */
  accountNumberRaw: string;
  wallet: string;
  instaPay: string;
}

/** صف معلومات عام (أيقونة + عنوان + قيمة) */
export interface InfoRow {
  label: string;
  value: React.ReactNode;
  tone: PermTone;
  icon: "email" | "shield" | "clock" | "calendar" | "lock" | "briefcase" | "money";
}
