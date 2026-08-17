/**
 * ثوابت خاصة بصفحة تفاصيل الطلب. الثوابت المشتركة على مستوى الطلبات
 * (DELIVERY_STATUS / statusoptions …) تبقى في `layouts/Orders/utils/constants`.
 */

/** خيارا «التوصيل بواسطة» كقيم احتياطية عند تعذّر جلب الـ meta. */
export const DELIVERY_BY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "هوميكس" },
  { value: 2, label: "بائع" },
];

/** خيارا «نوع الشحنة» — تطابق قيم عمود shipmentType في الباك إند. */
export const SHIPMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "separate", label: "شحن منفصل" },
  { value: "grouped", label: "شحن مجمع" },
];

/** أنواع الصور المسموح بها في مرفقات الملاحظات */
export const COMMENT_IMAGE_ACCEPT = "image/png, image/jpeg, image/jpg";

/** تدرّجا لون أفاتار الملاحظات (يتناوبان حسب ترتيب التعليق) */
export const COMMENT_AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
] as const;

/** تدرّج لون أفاتار البائع في بطاقة المنتج */
export const VENDOR_AVATAR_GRADIENT = "linear-gradient(135deg,#8c7355,#5a4530)";

/** تدرّج لون أفاتار العميل في بطاقة بيانات العميل */
export const CUSTOMER_AVATAR_GRADIENT = "linear-gradient(135deg,#f59e0b,#d97706)";
