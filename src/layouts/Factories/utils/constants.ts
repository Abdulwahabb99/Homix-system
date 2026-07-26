/**
 * ثوابت صفحة الصنّاع — مطابقة لـ homix_factories_v3.html.
 * الألوان المشتركة تأتي من رموز التصميم HX؛ ما يخصّ التخصصات فقط يُعرَّف هنا.
 */
import {
  FactoriesView,
  FactoryFilters,
  FactoryFormValues,
  FactorySpec,
  FactoryStatus,
} from "./types";

/** عملة العرض */
export const CURRENCY = "ج.م";

/** زوايا الحواف (--r في التصميم) */
export const R = "13px";
export const R_SM = "9px";

/** الشريط العلوي */
export const PAGE_TITLE = "الصنّاع";
export const PAGE_SUBTITLE = "إدارة مصانع ومورّدي HOMIX Marketplace";

/** عدد الصفوف في صفحة الجدول */
export const FACTORIES_PAGE_SIZE = 10;

/** التخصصات المتاحة — ترتيب القائمة كما في التصميم */
export const SPEC_OPTIONS: FactorySpec[] = [
  "Furniture",
  "MDF",
  "steel",
  "upholstery",
  "mirrors",
  "wood",
  "lighting",
];

/** تدرّج لوني لصورة الحرف (avatar) لكل تخصّص */
export const SPEC_GRADIENTS: Record<FactorySpec, string> = {
  Furniture: "linear-gradient(135deg,#8c7355,#5a4530)",
  MDF: "linear-gradient(135deg,#4a7855,#2d5038)",
  steel: "linear-gradient(135deg,#3b6896,#1e3a5f)",
  upholstery: "linear-gradient(135deg,#a07840,#6b5030)",
  mirrors: "linear-gradient(135deg,#5a4070,#3a2850)",
  wood: "linear-gradient(135deg,#7a5c38,#4a3520)",
  lighting: "linear-gradient(135deg,#c9a96e,#a07840)",
};

/** خلفية شارة التخصّص */
export const SPEC_BG: Record<FactorySpec, string> = {
  Furniture: "rgba(140,115,85,.1)",
  MDF: "rgba(74,120,85,.1)",
  steel: "rgba(59,104,150,.1)",
  upholstery: "rgba(160,120,64,.1)",
  mirrors: "rgba(90,64,112,.1)",
  wood: "rgba(122,92,56,.1)",
  lighting: "rgba(201,169,110,.1)",
};

/** لون نص شارة التخصّص */
export const SPEC_TEXT: Record<FactorySpec, string> = {
  Furniture: "#5a4530",
  MDF: "#2d5038",
  steel: "#1e3a5f",
  upholstery: "#6b5030",
  mirrors: "#3a2850",
  wood: "#4a3520",
  lighting: "#a07840",
};

/** تدرّج بديل لتخصّص غير معروف */
export const SPEC_FALLBACK_GRADIENT = "linear-gradient(135deg,#6366f1,#8b5cf6)";

/** تسميات الحالة — نفس ترميز الـ API (1 / 2) */
export const STATUS_LABELS: Record<FactoryStatus, string> = {
  1: "أونلاين",
  2: "أوفلاين",
};

export interface StatusOption {
  value: FactoryStatus;
  label: string;
}
export const STATUS_OPTIONS: StatusOption[] = [
  { value: 1, label: STATUS_LABELS[1] },
  { value: 2, label: STATUS_LABELS[2] },
];

/** أعمدة الجدول — `sortKey` يعني أنّ العمود قابل للترتيب */
export interface FactoryColumn {
  key: string;
  label: string;
  center?: boolean;
  sortKey?: "name" | "spec";
}
export const FACTORY_COLUMNS: FactoryColumn[] = [
  { key: "name", label: "اسم المصنع", sortKey: "name" },
  { key: "addr", label: "العنوان" },
  { key: "spec", label: "التخصص", sortKey: "spec" },
  { key: "resp", label: "اسم المسؤول" },
  { key: "phone", label: "رقم المسؤول" },
  { key: "shipCairo", label: "شحن القاهرة والجيزة", center: true },
  { key: "shipOther", label: "شحن باقي المحافظات", center: true },
  { key: "status", label: "الحالة" },
  { key: "website", label: "الويب سايت" },
  { key: "orders", label: "الطلبات" },
  { key: "sales", label: "المبيعات" },
  { key: "actions", label: "" },
];

/** الحد الأدنى لعرض الجدول قبل ظهور التمرير الأفقي */
export const TABLE_MIN_WIDTH = 1200;

/** طريقة العرض الافتراضية */
export const DEFAULT_VIEW: FactoriesView = "table";

/** فلاتر فارغة */
export const EMPTY_FILTERS: FactoryFilters = { search: "", spec: "", status: "" };

/** قيم نموذج فارغة (وضع الإضافة) */
export const EMPTY_FORM: FactoryFormValues = {
  name: "",
  addr: "",
  spec: "",
  status: 1,
  website: "",
  resp: "",
  phone: "",
  shipCairo: "",
  shipOther: "",
  bankName: "",
  bankHolder: "",
  bankAccount: "",
  bankWallet: "",
  bankInstapay: "",
};

/** أنواع الملفات المقبولة في الأوراق الرسمية */
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png";

/** حالة المرفق قبل الإرسال */
export const ATTACHMENT_PENDING_LABEL = "قيد المراجعة";
