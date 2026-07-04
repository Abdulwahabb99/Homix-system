import { DELIVERY_BY_ARABIC, GOVERNORATES, PAYMENT_STATUS_ARABIC } from "../../../config/constants";

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const SHIPMENT_PRIORITY = {
  ON_SCHEDULE: 1,
  ALMOST_DUE: 2,
  URGENT: 3,
} as const;

export const SHIPMENT_PRIORITY_KEYS = [
  SHIPMENT_PRIORITY.ON_SCHEDULE,
  SHIPMENT_PRIORITY.ALMOST_DUE,
  SHIPMENT_PRIORITY.URGENT,
] as const;

export const SHIPMENT_PRIORITY_LABELS: Record<number, string> = {
  [SHIPMENT_PRIORITY.ON_SCHEDULE]: "بالمدة",
  [SHIPMENT_PRIORITY.ALMOST_DUE]: "مستعجل",
  [SHIPMENT_PRIORITY.URGENT]: "مستعجل جدا",
};

export const SHIPMENT_STATUS = {
  PENDING: 1,
  IN_WAREHOUSE: 2,
  READY_FOR_SHIPPING: 3,
  DELIVERED: 4,
  CANCELED: 5,
  REJECTED: 6,
  RETURNED_FROM_CUSTOMER: 7,
  RETURNED_TO_VENDOR: 8,
  REPLACED: 9,
  FAILED_DELIVERY: 10,
  SCHEDULED: 11,
  OUT_FOR_DELIVERY: 12,
} as const;

export const SHIPMENT_STATUS_LABELS: Record<number, string> = {
  [SHIPMENT_STATUS.PENDING]: "معلقة",
  [SHIPMENT_STATUS.IN_WAREHOUSE]: "في المخزن",
  [SHIPMENT_STATUS.READY_FOR_SHIPPING]: "جاهزة للشحن",
  [SHIPMENT_STATUS.DELIVERED]: "تم التسليم",
  [SHIPMENT_STATUS.CANCELED]: "ملغية",
  [SHIPMENT_STATUS.REJECTED]: "مرفوضة",
  [SHIPMENT_STATUS.RETURNED_FROM_CUSTOMER]: "مسترجع من العميل",
  [SHIPMENT_STATUS.RETURNED_TO_VENDOR]: "مرتجع للمورد",
  [SHIPMENT_STATUS.REPLACED]: "مستبدل",
  [SHIPMENT_STATUS.FAILED_DELIVERY]: "فشل في التوصيل",
  [SHIPMENT_STATUS.SCHEDULED]: "شحنة مجدولة",
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: "خرجت للتوصيل",
};

export const SHIPMENT_TYPE_LABELS: Record<string, string> = {
  collected: "شحن مجمع",
  grouped: "شحن مجمع",
  separate: "شحن منفصل",
  single: "شحن منفصل",
  warehouse: "شحن مجمع",
};

export const SHIPMENT_RETURN_TYPE = {
  TO_VENDOR: 1,
  FROM_CUSTOMER: 2,
} as const;

export const SHIPMENT_RETURN_TYPE_LABELS: Record<number, string> = {
  [SHIPMENT_RETURN_TYPE.TO_VENDOR]: "مرتجعات إلى المورد",
  [SHIPMENT_RETURN_TYPE.FROM_CUSTOMER]: "مسحوبات من العميل",
};

export const RETURN_TO_VENDOR_STATUS = {
  PENDING: 1,
  VENDOR_NOTIFIED: 2,
  DELIVERED_TO_VENDOR: 3,
  FORFEIT: 4,
} as const;

export const RETURN_TO_VENDOR_STATUS_LABELS: Record<number, string> = {
  [RETURN_TO_VENDOR_STATUS.PENDING]: "معلق",
  [RETURN_TO_VENDOR_STATUS.VENDOR_NOTIFIED]: "تم إبلاغ المورد",
  [RETURN_TO_VENDOR_STATUS.DELIVERED_TO_VENDOR]: "تم التسليم للمورد",
  [RETURN_TO_VENDOR_STATUS.FORFEIT]: "فورفيت",
};

export const RETURN_TO_VENDOR_FINAL_STATUSES = [
  RETURN_TO_VENDOR_STATUS.DELIVERED_TO_VENDOR,
  RETURN_TO_VENDOR_STATUS.FORFEIT,
];

export const CUSTOMER_RETURN_STATUS = {
  PENDING: 1,
  PICKED_UP: 2,
  IN_WAREHOUSE: 3,
  CANCELED: 4,
  REDELIVERED: 5,
  FORFEIT: 6,
} as const;

export const CUSTOMER_RETURN_STATUS_LABELS: Record<number, string> = {
  [CUSTOMER_RETURN_STATUS.PENDING]: "معلق",
  [CUSTOMER_RETURN_STATUS.PICKED_UP]: "تم السحب",
  [CUSTOMER_RETURN_STATUS.IN_WAREHOUSE]: "في المخزن",
  [CUSTOMER_RETURN_STATUS.CANCELED]: "ملغي",
  [CUSTOMER_RETURN_STATUS.REDELIVERED]: "تم التوصيل للعميل",
  [CUSTOMER_RETURN_STATUS.FORFEIT]: "فورفيت",
};

export const CUSTOMER_RETURN_FINAL_STATUSES = [
  CUSTOMER_RETURN_STATUS.CANCELED,
  CUSTOMER_RETURN_STATUS.REDELIVERED,
  CUSTOMER_RETURN_STATUS.FORFEIT,
];

export const ACCOUNTING_STATUS = {
  PENDING: 1,
  SETTLED: 2,
} as const;

export const EXPENSE_STATUS_LABELS: Record<number, string> = {
  [ACCOUNTING_STATUS.PENDING]: "معلق",
  [ACCOUNTING_STATUS.SETTLED]: "تم التصفية",
};

export const ACCOUNT_STATUS_LABELS: Record<number, string> = {
  [ACCOUNTING_STATUS.PENDING]: "معلق",
  [ACCOUNTING_STATUS.SETTLED]: "تم التصفية",
};

export const INVENTORY_STATUS = {
  IN_STOCK: 1,
  OUT_OF_STOCK: 2,
} as const;

export const INVENTORY_STATUS_LABELS: Record<number, string> = {
  [INVENTORY_STATUS.IN_STOCK]: "متوفر بالمخزون",
  [INVENTORY_STATUS.OUT_OF_STOCK]: "نفذ بالمخزون",
};

export const EXPENSE_TYPE = {
  SHIPPING: 1,
  PACKAGING: 2,
  MAINTENANCE: 3,
  WAREHOUSE_RENT: 4,
  SALARIES: 5,
  OTHER: 6,
} as const;

export const EXPENSE_TYPE_LABELS: Record<number, string> = {
  [EXPENSE_TYPE.SHIPPING]: "شحن",
  [EXPENSE_TYPE.PACKAGING]: "تغليف",
  [EXPENSE_TYPE.MAINTENANCE]: "صيانة",
  [EXPENSE_TYPE.WAREHOUSE_RENT]: "إيجار مخزن",
  [EXPENSE_TYPE.SALARIES]: "رواتب",
  [EXPENSE_TYPE.OTHER]: "أخرى",
};

export const PAYMENT_STATUS_LABELS = PAYMENT_STATUS_ARABIC as Record<number, string>;
export const DELIVERY_BY_LABELS = DELIVERY_BY_ARABIC as Record<number, string>;
export const GOVERNORATE_LABELS = GOVERNORATES as Record<number, string>;

export const SHIPMENT_FINAL_STATUSES = [
  SHIPMENT_STATUS.DELIVERED,
  SHIPMENT_STATUS.CANCELED,
  SHIPMENT_STATUS.REJECTED,
  SHIPMENT_STATUS.RETURNED_TO_VENDOR,
];

export const PERFORMANCE_PERIODS = ["daily", "weekly", "monthly", "custom"] as const;
