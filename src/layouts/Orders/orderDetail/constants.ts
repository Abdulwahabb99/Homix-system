/**
 * ثوابت خاصة بصفحة تفاصيل الطلب. الثوابت المشتركة على مستوى الطلبات
 * (DELIVERY_STATUS / statusoptions …) تبقى في `layouts/Orders/utils/constants`.
 */

/** خيارا «مكان التسليم» — يُحدّثان الحقل shippedFromInventory */
export const DELIVERY_LOCATION_OPTIONS: { value: string; label: string }[] = [
  { value: "inventory", label: "مخازن هومكس" },
  { value: "customer", label: "عنوان العميل" },
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
