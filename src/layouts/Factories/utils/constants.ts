/**
 * ثوابت صفحة الصنّاع — مطابقة لـ homix_factories_v3.html.
 *
 * التخصصات والحالات لم تبقَ ثابتة: تأتي من `GET /factories/meta`. ما يبقى هنا هو
 * لوحة الألوان (يُختار منها لوناً ثابتاً لكل تخصّص عبر تجزئة اسمه) والأعمدة.
 */
import { FactoriesView, FactoryFilters, FactoryFormValues } from "./types";

/** عملة العرض */
export const CURRENCY = "ج.م";

/** زوايا الحواف (--r في التصميم) */
export const R = "13px";
export const R_SM = "9px";

/** الشريط العلوي */
export const PAGE_TITLE = "الصنّاع";
export const PAGE_SUBTITLE = "إدارة مصانع ومورّدي HOMIX Marketplace";

/**
 * لوحة ألوان التخصصات المأخوذة من التصميم. التخصصات صارت ديناميكية من الـ meta،
 * فيُشتق لون ثابت لكل اسم بالتجزئة بدل خريطة أسماء ثابتة.
 */
export interface SpecPalette {
  gradient: string;
  bg: string;
  text: string;
}

export const SPEC_PALETTE: SpecPalette[] = [
  { gradient: "linear-gradient(135deg,#8c7355,#5a4530)", bg: "rgba(140,115,85,.1)", text: "#5a4530" },
  { gradient: "linear-gradient(135deg,#4a7855,#2d5038)", bg: "rgba(74,120,85,.1)", text: "#2d5038" },
  { gradient: "linear-gradient(135deg,#3b6896,#1e3a5f)", bg: "rgba(59,104,150,.1)", text: "#1e3a5f" },
  { gradient: "linear-gradient(135deg,#a07840,#6b5030)", bg: "rgba(160,120,64,.1)", text: "#6b5030" },
  { gradient: "linear-gradient(135deg,#5a4070,#3a2850)", bg: "rgba(90,64,112,.1)", text: "#3a2850" },
  { gradient: "linear-gradient(135deg,#7a5c38,#4a3520)", bg: "rgba(122,92,56,.1)", text: "#4a3520" },
  { gradient: "linear-gradient(135deg,#c9a96e,#a07840)", bg: "rgba(201,169,110,.1)", text: "#a07840" },
];

/** حالة أونلاين — يُستخدم للتلوين فقط؛ النص يأتي من `statusLabel` */
export const STATUS_ONLINE = 1;

/** أعمدة الجدول — `sortKey` يعني أنّ الـ API يدعم الترتيب بهذا العمود */
export interface FactoryColumn {
  key: string;
  label: string;
  center?: boolean;
  sortKey?: "name" | "status" | "joinDate";
}

export const FACTORY_COLUMNS: FactoryColumn[] = [
  { key: "name", label: "اسم المصنع", sortKey: "name" },
  { key: "code", label: "الكود" },
  { key: "address", label: "العنوان" },
  { key: "specialty", label: "التخصص" },
  { key: "responsibleName", label: "اسم المسؤول" },
  { key: "responsiblePhone", label: "رقم المسؤول" },
  { key: "cairoGizaShipping", label: "شحن القاهرة والجيزة", center: true },
  { key: "otherCitiesShipping", label: "شحن باقي المحافظات", center: true },
  { key: "status", label: "الحالة", sortKey: "status" },
  { key: "website", label: "الويب سايت" },
  { key: "joinDate", label: "تاريخ الانضمام", sortKey: "joinDate" },
  { key: "documentsCount", label: "المستندات", center: true },
  { key: "actions", label: "" },
];

/** الحد الأدنى لعرض الجدول قبل ظهور التمرير الأفقي */
export const TABLE_MIN_WIDTH = 1420;

/** طريقة العرض الافتراضية */
export const DEFAULT_VIEW: FactoriesView = "table";

/** فلاتر فارغة — القيمة الفارغة تعني «الكل» ولا تُرسل للخادم */
export const EMPTY_FILTERS: FactoryFilters = { search: "", status: "", factoryCategory: "" };

/** التسميات الافتراضية لقوائم الفلاتر (تظهر عند عدم التحديد) */
export const ALL_SPECIALTIES_LABEL = "كل التخصصات";
export const ALL_STATUSES_LABEL = "كل الحالات";

/** مهلة تهدئة الكتابة قبل إرسال البحث للخادم */
export const SEARCH_DEBOUNCE_MS = 500;

/** قيم نموذج فارغة (وضع الإضافة) */
export const EMPTY_FORM: FactoryFormValues = {
  name: "",
  description: "",
  factoryCategory: "",
  status: STATUS_ONLINE,
  joinDate: "",
  website: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  country: "Egypt",

  responsibleName: "",
  responsiblePhone: "",
  responsibleEmail: "",
  responsibleRole: "",

  contactPersonName: "",
  contactPersonPhoneNumber: "",
  contactPersonEmail: "",
  contactPersonRole: "",

  cairoGizaShipping: "",
  otherCitiesShipping: "",

  bankName: "",
  bankAccountHolderName: "",
  bankAccountNumber: "",
  bankAccountType: "",
  walletNumber: "",
  walletProvider: "",
  instapayNumber: "",
};

/** أنواع الملفات المقبولة في الأوراق الرسمية */
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png";

/** حالة المرفق المحلّي قبل الرفع */
export const ATTACHMENT_PENDING_LABEL = "في انتظار الرفع";
