/**
 * أنواع صفحة الصنّاع. أشكال البيانات نفسها تعيش في طبقة الاستعلام
 * (`query/factoriesList` و `query/factoryDetail`) وتُعاد تصديرها هنا حتى تستورد
 * المكوّنات من مكان واحد.
 */
export type { FactoryListItem, FactoriesSummary } from "query/factoriesList";
export type { FactoryDetail, FactoryDocument } from "query/factoryDetail";
export type { FactoryUploadFile } from "query/factoryMutations";

/** طريقة العرض */
export type FactoriesView = "table" | "cards";

/** فلاتر القائمة (تُترجم إلى معاملات الاستعلام) */
export interface FactoryFilters {
  search: string;
  /** 1 أونلاين / 2 أوفلاين — "" = الكل */
  status: number | "";
  /** التخصّص كنص كما يستقبله `factoryCategory` */
  factoryCategory: string;
}

/**
 * قيم نموذج الإضافة/التعديل — كلها نصوص لأنها مربوطة بحقول إدخال،
 * والأسماء تطابق حقول جسم POST/PUT لتقليل الترجمة.
 */
export interface FactoryFormValues {
  name: string;
  description: string;
  factoryCategory: string;
  status: number;
  joinDate: string;
  website: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;

  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleRole: string;

  contactPersonName: string;
  contactPersonPhoneNumber: string;
  contactPersonEmail: string;
  contactPersonRole: string;

  cairoGizaShipping: string;
  otherCitiesShipping: string;

  bankName: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankAccountType: string;
  walletNumber: string;
  walletProvider: string;
  instapayNumber: string;
}

/** ملف في انتظار الرفع (قبل إرساله لـ `/factories/{id}/upload`) */
export interface PendingDocument {
  /** مفتاح محلّي للعرض والحذف قبل الرفع */
  key: string;
  file: File;
  /** أحد معرّفات documentTypes من الـ meta */
  attachmentType: number;
  description: string;
}

/** أعمدة الترتيب المتاحة في الجدول (مما يدعمه الـ API) */
export type FactorySortKey = "name" | "status" | "joinDate";
