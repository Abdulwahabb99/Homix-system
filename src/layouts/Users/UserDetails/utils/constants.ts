/**
 * ثوابت صفحة تفاصيل المستخدم — مطابقة لتصميم homix_user_detail.html.
 * الأقسام الثابتة (الصلاحيات / سجل النشاط / بيانات التحويل / الإحصائيات) مُجمّعة هنا،
 * وسيتم استبدالها ببيانات حقيقية عند توفّر تكامل الـ BE لاحقاً.
 */
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  ActivityEntry,
  BankTransfer,
  PermissionSection,
  PermTone,
  ProfileStat,
} from "./types";

/** زوايا الحواف (--r في التصميم) */
export const R = "13px";

/** بديل العرض للحقول غير المتوفرة من الـ API */
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

/* ───────────────────────── إحصائيات الملف الشخصي (static) ───────────────────────── */
export const PROFILE_STATS: ProfileStat[] = [
  { value: "247", label: "طلب عالجها" },
  { value: "18", label: "تذكرة أغلقها" },
  { value: "19", label: "صلاحية نشطة" },
  { value: "98%", label: "معدل النشاط", color: HX.green },
];

/* ───────────────────────── مصفوفة الصلاحيات (static) ───────────────────────── */
export const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    key: "orders",
    name: "الطلبات",
    tone: "accent",
    items: [
      { label: "عرض الطلبات", action: "view", enabled: true },
      { label: "تعديل الطلبات", action: "edit", enabled: true },
      { label: "إنشاء طلب", action: "create", enabled: true },
      { label: "حذف الطلبات", action: "delete", enabled: true },
    ],
  },
  {
    key: "factories",
    name: "الصناع",
    tone: "amber",
    items: [
      { label: "عرض الصناع", action: "view", enabled: true },
      { label: "تعديل بيانات المصنع", action: "edit", enabled: true },
      { label: "حذف مصنع", action: "delete", enabled: true },
    ],
  },
  {
    key: "shipping",
    name: "الشحن والتوصيل",
    tone: "blue",
    items: [
      { label: "عرض الشحنات", action: "view", enabled: true },
      { label: "تعديل الشحنات", action: "edit", enabled: true },
    ],
  },
  {
    key: "finance",
    name: "المالية",
    tone: "green",
    items: [
      { label: "عرض التقارير", action: "view", enabled: true },
      { label: "تصدير التقارير", action: "export", enabled: true },
      { label: "تسوية مالية", action: "check", enabled: true },
    ],
  },
  {
    key: "tickets",
    name: "التذاكر",
    tone: "teal",
    items: [
      { label: "عرض التذاكر", action: "view", enabled: true },
      { label: "الرد على التذاكر", action: "reply", enabled: true },
      { label: "إغلاق التذاكر", action: "check", enabled: true },
    ],
  },
  {
    key: "users",
    name: "المستخدمون والإعدادات",
    tone: "purple",
    items: [
      { label: "عرض المستخدمين", action: "view", enabled: true },
      { label: "إدارة الصلاحيات", action: "shield", enabled: true },
      { label: "عرض الإعدادات", action: "settings", enabled: true },
      { label: "تعديل الإعدادات", action: "edit", enabled: true },
    ],
  },
];

/** إجمالي الصلاحيات المفعّلة (يُحتسب من المصفوفة الثابتة) */
export const ACTIVE_PERMISSIONS_COUNT = PERMISSION_SECTIONS.reduce(
  (sum, s) => sum + s.items.filter((i) => i.enabled).length,
  0
);

/* ───────────────────────── سجل النشاط (static) ───────────────────────── */
export const ACTIVITY_LOG: ActivityEntry[] = [
  {
    id: "a1",
    action: "تعديل حالة طلب #31668",
    detail: 'من "معلق" إلى "قيد التصنيع"',
    time: "منذ ٥ دقائق",
    tone: "green",
    icon: "check",
  },
  {
    id: "a2",
    action: "إضافة صانع جديد",
    detail: "New Factory — upholstery",
    time: "منذ ٢ ساعة",
    tone: "accent",
    icon: "factory",
  },
  {
    id: "a3",
    action: "إغلاق تذكرة #TKT-204",
    detail: "مشكلة شحن — تم الحل",
    time: "منذ ٤ ساعات",
    tone: "teal",
    icon: "ticket",
  },
  {
    id: "a4",
    action: "تسوية مالية — ركة للأثاث",
    detail: "12,400 ج.م تم التحويل",
    time: "أمس 2:30 م",
    tone: "green",
    icon: "money",
  },
];

/* ───────────────────────── بيانات التحويل (static) ───────────────────────── */
export const BANK_TRANSFER: BankTransfer = {
  bankName: "بنك مصر",
  accountType: "حساب جاري",
  accountName: "محمود كمال عبدالله",
  accountNumber: "1234 5678 9012 3456",
  accountNumberRaw: "1234567890123456",
  wallet: "01032288941",
  instaPay: "01032288941",
};

/* ───────────────────────── بيانات وظيفية ومالية (static) ───────────────────────── */
export const JOB_INFO = {
  position: "مدير عمليات أول",
  salary: "12,500 ج.م / شهرياً",
};

/* ───────────────────────── حقول ثابتة في بطاقة الحساب ───────────────────────── */
export const ACCOUNT_STATIC = {
  statusLabel: "متصل الآن",
  lastPasswordChange: "منذ 23 يوم",
  /** تاريخ افتراضي عند غياب createdAt من الـ API */
  joinedFallback: "15 يناير 2024",
};
