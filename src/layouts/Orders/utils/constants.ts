export const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "مؤكد", value: 3 },
  { label: "ملغي", value: 4 },
  { label: "قيد التصنيع ", value: 2 },
  { label: "تم التسليم", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "مستبدل ", value: 7 },
  { label: "في المخزن ", value: 8 },
];
export const PAYMENT_STATUS = [
  { label: "مدفوع", value: 2 },
  { label: "دفع عند الاستلام", value: 1 },
];
export const DELIVERY_STATUS = [
  { label: "في مده التصنيع", value: 1 },
  { label: "أوشك علي التأخير", value: 2 },
  { label: "متأخر", value: 3 },
];

/** يجب أن يطابق ORDER_PRIORITY في src/modules/orders/order.constants.ts بالباك إند */
export const PRIORITY_VALUES = [
  { label: "بالمدة", value: 1 },
  { label: "مستعجل", value: 2 },
  { label: "مستعجل جدا", value: 3 },
];

export const priorityValues: Record<number, string> = {
  1: "بالمدة",
  2: "مستعجل",
  3: "مستعجل جدا",
};

/** خيارات ترتيب قائمة الطلبات — تُرسَل للـ API كـ sort[field]=dir (-1 تنازلي، 1 تصاعدي) */
export const ORDERS_SORT_OPTIONS = [
  { key: "newest",       label: "الأحدث أولاً",   field: "orderDate",  dir: -1 },
  { key: "oldest",       label: "الأقدم أولاً",   field: "orderDate",  dir: 1 },
  { key: "priceDesc",    label: "الأعلى سعراً",   field: "totalPrice", dir: -1 },
  { key: "priorityDesc", label: "الأكثر إلحاحاً", field: "priority",   dir: -1 },
] as const;

export type OrdersSortKey = (typeof ORDERS_SORT_OPTIONS)[number]["key"];

export const customerInitialState = {
  firstName: "",
  lastName: "",
  country: "",
  province: "",
  city: "",
  phone: "",
  address: "",
  email: "",
};

/** يجب أن يطابق `statusoptions` (قيم الـ API) */
export const orderStatusValues: Record<number, string> = {
  1: "معلق",
  2: "قيد التصنيع ",
  3: "مؤكد",
  4: "ملغي",
  5: "تم التسليم",
  6: "مسترجع ",
  7: "مستبدل ",
  8: "في المخزن ",
};
export const deliveryStatusValues = {
  1: "في مده التصنيع",
  2: "أوشك علي التأخير",
  3: "متأخر ",
};

export const paymentStatusValues = {
  2: "مدفوع",
  1: "دفع عند الاستلام",
};

/** يطابق PriorityBadge: 1 بالمدة، 2 مستعجل، 3 مستعجل جداً — مع دعم القيم النصية القديمة */
export type OrderDeliveryPriorityBadgeLevel = "very-urgent" | "urgent" | "normal";

export function mapDeliveryPriorityToBadgeLevel(
  dp: string | number | null | undefined
): OrderDeliveryPriorityBadgeLevel | null {
  if (dp === null || dp === undefined || dp === "") return null;
  const n = Number(dp);
  if (n === 3) return "very-urgent";
  if (n === 2) return "urgent";
  if (n === 1) return "normal";
  const s = String(dp).toLowerCase();
  if (s === "3") return "very-urgent";
  if (s === "2" || s === "almostdue") return "urgent";
  if (s === "1" || s === "onschedule") return "normal";
  if (s.includes("very") || s.includes("مستعجل جدا")) return "very-urgent";
  if (s.includes("urgent") || s.includes("مستعجل")) return "urgent";
  return "normal";
}
