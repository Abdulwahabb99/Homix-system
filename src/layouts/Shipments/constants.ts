/** خيارات ترتيب قائمة الشحنات — نفس خيارات الطلبات، وتُرسَل للـ API كـ sort[field]=dir (-1 تنازلي، 1 تصاعدي) */
export const SHIPMENTS_SORT_OPTIONS = [
  { key: "newest",       label: "الأحدث أولاً",   field: "orderDate",  dir: -1 },
  { key: "oldest",       label: "الأقدم أولاً",   field: "orderDate",  dir: 1 },
  { key: "priceDesc",    label: "الأعلى سعراً",   field: "totalPrice", dir: -1 },
  { key: "priorityDesc", label: "الأكثر إلحاحاً", field: "priority",   dir: -1 },
] as const;

export type ShipmentsSortKey = (typeof SHIPMENTS_SORT_OPTIONS)[number]["key"];

export const DEFAULT_SHIPMENTS_SORT_KEY: ShipmentsSortKey = "newest";
