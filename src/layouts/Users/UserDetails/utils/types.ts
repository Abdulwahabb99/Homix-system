/**
 * أنواع صفحة تفاصيل المستخدم — مطابقة لاستجابة `GET /users/:id` بعد إضافة المفاتيح الجديدة
 * (permissionsSummary / activity / بيانات البنك والوظيفة). كل الأقسام أصبحت مدفوعة ببيانات حقيقية.
 */
import { AppUser } from "../../utils/types";

export type { AppUser };

/** نوع إجراء الصلاحية — يُشتق من لاحقة مفتاح الصلاحية (orders_view → view) */
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

/** عنصر صلاحية واحد كما يعيده الـ API */
export interface PermissionItem {
  key: string;
  label: string;
  enabled: boolean;
}

/** مجموعة صلاحيات (permissionsSummary.groups[]) */
export interface PermissionGroup {
  key: string;
  label: string;
  activeCount: number;
  totalCount: number;
  items: PermissionItem[];
}

/** ملخّص الصلاحيات المجمّع */
export interface PermissionsSummary {
  activeCount: number;
  totalCount: number;
  groups: PermissionGroup[];
}

/** نبرة عنصر سجل النشاط (تحدّد لون النقطة) */
export type ActivityTone = "green" | "accent" | "teal" | "amber" | "blue";

/** عنصر نشاط كما يعيده الـ API */
export interface ActivityApiEntry {
  id: number | string;
  action: string;
  actorName?: string;
  createdAt: string;
  field?: string;
  message: string;
}

/** عنصر نشاط جاهز للعرض بعد التحويل (نص + وقت نسبي + نبرة) */
export interface ActivityView {
  id: number | string;
  action: string;
  message: string;
  detail: string;
  time: string;
  tone: ActivityTone;
}

/** بيانات التحويل البنكي (مُشكّلة من حقول المستخدم) */
export interface BankInfo {
  bankName: string;
  accountType: string;
  accountName: string;
  accountNumber: string;
  wallet: string;
  instaPay: string;
}

/** بيانات وظيفية ومالية */
export interface JobInfo {
  jobTitle: string;
  salary: string;
}

/** صف معلومات عام (أيقونة + عنوان + قيمة) */
export interface InfoRow {
  label: string;
  value: React.ReactNode;
  tone: PermTone;
  icon: "email" | "shield" | "clock" | "calendar" | "lock" | "briefcase" | "money" | "phone";
}

/** استجابة تفاصيل المستخدم الكاملة */
export interface UserDetail extends AppUser {
  fullName?: string;
  roleName?: string;
  accountStatus?: string;
  accountStatusLabel?: string;
  status?: string;
  statusLabel?: string;
  isActive?: boolean;
  createdAt?: string;
  lastPasswordChangeAt?: string | null;
  lastSeenAt?: string | null;
  activePermissionsCount?: number;
  permissions?: Record<string, boolean>;
  permissionsSummary?: PermissionsSummary;
  activity?: ActivityApiEntry[];
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  bankName?: string;
  jobTitle?: string;
  phoneNumber?: string;
  salary?: number | string | null;
  walletNumber?: string;
  instaPayNumber?: string;
}
