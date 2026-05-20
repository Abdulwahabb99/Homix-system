import { DELIVERY_BY_ARABIC, PAYMENT_STATUS_ARABIC } from "../../../config/constants";

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

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
};

export const SHIPMENT_TYPE_LABELS: Record<string, string> = {
  collected: "شحن مجمع",
  grouped: "شحن مجمع",
  separate: "شحن منفصل",
  single: "شحن منفصل",
  warehouse: "شحن مجمع",
};

export const RETURN_TO_VENDOR_STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  vendorNotified: "تم إبلاغ المورد",
  deliveredToVendor: "تم التسليم للمورد",
  forfeit: "فورفيت",
};

export const CUSTOMER_RETURN_STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  pickedUp: "تم السحب",
  inWarehouse: "في المخزن",
  canceled: "ملغي",
  redelivered: "تم التوصيل للعميل",
  forfeit: "فورفيت",
};

export const EXPENSE_STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  settled: "تم التصفية",
};

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  settled: "تم التصفية",
};

export const INVENTORY_STATUS_LABELS: Record<string, string> = {
  inStock: "متوفر بالمخزون",
  outOfStock: "نفذ بالمخزون",
};

export const PAYMENT_STATUS_LABELS = PAYMENT_STATUS_ARABIC as Record<number, string>;
export const DELIVERY_BY_LABELS = DELIVERY_BY_ARABIC as Record<number, string>;

export const SHIPMENT_FINAL_STATUSES = [
  SHIPMENT_STATUS.DELIVERED,
  SHIPMENT_STATUS.CANCELED,
  SHIPMENT_STATUS.REJECTED,
  SHIPMENT_STATUS.RETURNED_TO_VENDOR,
];

export const PERFORMANCE_PERIODS = ["daily", "weekly", "monthly", "custom"] as const;
