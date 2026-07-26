/**
 * أنواع صفحة الصنّاع (المصانع).
 * الأشكال هنا مُصمّمة لتطابق ما سيرجعه `GET /factories` مستقبلاً، فالانتقال من
 * البيانات الثابتة إلى الـ API يكون بتبديل مصدر `useFactoriesPage` فقط.
 */

/** تخصّص المصنع — نفس قيم الـ API الحالية (نص إنجليزي) */
export type FactorySpec =
  | "Furniture"
  | "MDF"
  | "steel"
  | "upholstery"
  | "mirrors"
  | "wood"
  | "lighting";

/** حالة المصنع — 1 أونلاين / 2 أوفلاين (نفس ترميز `GET /factories`) */
export type FactoryStatus = 1 | 2;

/** مصنع واحد كما يُعرض في الجدول والبطاقات */
export interface Factory {
  id: number;
  name: string;
  /** العنوان — قد يعود فارغاً من الـ API */
  addr: string;
  spec: FactorySpec;
  /** اسم المسؤول */
  resp: string;
  phone: string;
  /** مصاريف شحن القاهرة والجيزة (ج.م) */
  shipCairo: number;
  /** مصاريف شحن باقي المحافظات (ج.م) */
  shipOther: number;
  status: FactoryStatus;
  website: string;
  /* ── بيانات التحويل البنكي ── */
  bankName?: string;
  bankHolder?: string;
  bankAccount?: string;
  /** رقم المحفظة / فودافون كاش */
  bankWallet?: string;
  bankInstapay?: string;
  /**
   * الـ IBAN موجود في البيانات لكن لا يوجد له حقل في النموذج (مطابقةً للتصميم)،
   * فيُمرَّر كما هو عند الحفظ بدل أن يُفقد.
   */
  bankIban?: string;
  /* ── مؤشرات تُجمَّع من الطلبات (ستأتي من الـ BE) ── */
  orders: number;
  sales: number;
}

/** مؤشرات أعلى الصفحة */
export interface FactoryKpis {
  total: number;
  online: number;
  /** نسبة النشاط % */
  activePct: number;
  totalProducts: number;
  totalSales: number;
  needsReview: number;
}

/** قيم نموذج الإضافة/التعديل — كلها نصوص لأنها مرتبطة بحقول إدخال */
export interface FactoryFormValues {
  name: string;
  addr: string;
  spec: FactorySpec | "";
  status: FactoryStatus;
  website: string;
  resp: string;
  phone: string;
  shipCairo: string;
  shipOther: string;
  bankName: string;
  bankHolder: string;
  bankAccount: string;
  bankWallet: string;
  bankInstapay: string;
}

/** مرفق مرفوع محلياً (لم يُرسل للسيرفر بعد) */
export interface FactoryAttachment {
  id: string;
  name: string;
  /** الحجم بالبايت */
  size: number;
}

/** نوع المرفق — يحدّد القائمة التي يُضاف إليها الملف */
export type AttachmentKind = "commercial" | "tax";

/** طريقة العرض */
export type FactoriesView = "table" | "cards";

/** فلاتر القائمة */
export interface FactoryFilters {
  search: string;
  spec: FactorySpec | "";
  status: FactoryStatus | "";
}
