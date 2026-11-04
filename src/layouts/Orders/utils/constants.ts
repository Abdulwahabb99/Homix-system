export const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "مؤكد", value: 3 },
  { label: "ملغي", value: 4 },
  { label: "قيد التصنيع ", value: 2 },
  { label: "تم التسليم", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "مستبدل ", value: 7 },
  { label: "في المخزن ", value: 8 },
  // ids 9+ are append-only (mirror of backend ORDER_STATUS_Arabic) — cancel/reject variants, all closed.
  { label: "ملغي قبل التأكيد للتصنيع", value: 9 },
  { label: "ملغي بعد التأكيد للتصنيع (خلال أول 72 ساعة)", value: 10 },
  { label: "ملغي بعد التصنيع (لا يوجد رد من العميل)", value: 11 },
  { label: "ملغي بعد التصنيع (تغيير رأي)", value: 12 },
  { label: "ملغي بعد التصنيع (ظروف خاصة)", value: 13 },
  { label: "ملغي بعد التصنيع (بسبب التأخير)", value: 14 },
  { label: "ملغي بعد التصنيع (طلب وهمي)", value: 15 },
  { label: "مرفوض بعد التصنيع (المنتج غير مطابق)", value: 16 },
  { label: "مرفوض بعد التصنيع (غير مناسب للعميل)", value: 17 },
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
  9: "ملغي قبل التأكيد للتصنيع",
  10: "ملغي بعد التأكيد للتصنيع (خلال أول 72 ساعة)",
  11: "ملغي بعد التصنيع (لا يوجد رد من العميل)",
  12: "ملغي بعد التصنيع (تغيير رأي)",
  13: "ملغي بعد التصنيع (ظروف خاصة)",
  14: "ملغي بعد التصنيع (بسبب التأخير)",
  15: "ملغي بعد التصنيع (طلب وهمي)",
  16: "مرفوض بعد التصنيع (المنتج غير مطابق)",
  17: "مرفوض بعد التصنيع (غير مناسب للعميل)",
};

/** حالات الطلب «الملغية/المرفوضة» الجديدة — تُعامل كحالة نهائية مثل «ملغي» (4). */
export const CLOSED_ORDER_STATUS_IDS: number[] = [9, 10, 11, 12, 13, 14, 15, 16, 17];
/** المرفوض بعد التصنيع (16، 17) — لون أحمر بدل الرمادي. */
export const REJECTED_ORDER_STATUS_IDS: number[] = [16, 17];
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
