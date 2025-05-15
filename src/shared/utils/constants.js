import { deliveryStatusValues } from "layouts/Orders/utils/constants";

export const USER_TYPES = {
  ADMIN: "1",
  VENDOR: "2",
  OPERATION: "3",
  LOGISTIC: "4",
};

export const getUserType = (type) => {
  switch (type) {
    case USER_TYPES.ADMIN:
      return "مدير";
    case USER_TYPES.VENDOR:
      return "مورد";
    case USER_TYPES.OPERATION:
      return "عمليات";
    case USER_TYPES.LOGISTIC:
      return "لوجستي";
    default:
      return "";
  }
};
export const USER_TYPES_VALUES = [
  { value: USER_TYPES.ADMIN, label: "مدير" },
  { value: USER_TYPES.VENDOR, label: "مورد" },
  { value: USER_TYPES.OPERATION, label: "عمليات" },
  { value: USER_TYPES.LOGISTIC, label: "لوجستي" },
];

export const SHIPMENTS_STATUS = {
  PENDING: 1,
  IN_WAREHOUSE: 2,
  READY_FOR_DELIVERY: 3,
  DELIVERED: 4,
};
export const SHIPMENT_TYPE = {
  COLLECTED_SHIPMENT: 1,
  GOVERNORATES_SHIPMENT: 2,
};

export const SHIPMENT_STATUS_VALUES = [
  { value: SHIPMENTS_STATUS.PENDING, label: "معلقة" },
  { value: SHIPMENTS_STATUS.IN_WAREHOUSE, label: "في المخزن" },
  { value: SHIPMENTS_STATUS.READY_FOR_DELIVERY, label: "جاهز للشحن" },
  { value: SHIPMENTS_STATUS.DELIVERED, label: "تم التسليم" },
];

export const SHIPMENT_TYPE_VALUES = [
  { value: SHIPMENT_TYPE.COLLECTED_SHIPMENT, label: "شحنة مجمعة" },
  { value: SHIPMENT_TYPE.GOVERNORATES_SHIPMENT, label: "شحنة محافظات" },
];

export const GOVERNORATES = {
  1: "القاهرة",
  2: "الجيزة",
  3: "الإسكندرية",
  4: "الشرقية",
  5: "الدقهلية",
  6: "البحيرة",
  7: "الغربية",
  8: "المنيا",
  9: "المنوفية",
  10: "الفيوم",
  11: "القليوبية",
  12: "بني سويف",
  13: "أسيوط",
  14: "سوهاج",
  15: "قنا",
  16: "أسوان",
  17: "الوادي الجديد",
  18: "الإسماعيلية",
  19: "بورسعيد",
  20: "السويس",
  21: "شمال سيناء",
  22: "جنوب سيناء",
  23: "مطروح",
  24: "البحر الأحمر",
  25: "الأقصر",
  26: "البحيرة",
  27: "دمياط",
};

export const GOVERNORATES_VALUES = [
  { value: 1, label: "القاهرة" },
  { value: 2, label: "الجيزة" },
  { value: 3, label: "الإسكندرية" },
  { value: 4, label: "الشرقية" },
  { value: 5, label: "الدقهلية" },
  { value: 6, label: "البحيرة" },
  { value: 7, label: "الغربية" },
  { value: 8, label: "المنيا" },
  { value: 9, label: "المنوفية" },
  { value: 10, label: "الفيوم" },
  { value: 11, label: "القليوبية" },
  { value: 12, label: "بني سويف" },
  { value: 13, label: "أسيوط" },
  { value: 14, label: "سوهاج" },
  { value: 15, label: "قنا" },
  { value: 16, label: "أسوان" },
  { value: 17, label: "الوادي الجديد" },
  { value: 18, label: "الإسماعيلية" },
  { value: 19, label: "بورسعيد" },
  { value: 20, label: "السويس" },
  { value: 21, label: "شمال سيناء" },
  { value: 22, label: "جنوب سيناء" },
  { value: 23, label: "مطروح" },
  { value: 24, label: "البحر الأحمر" },
  { value: 25, label: "الأقصر" },
  { value: 26, label: "كفر الشيخ" },
  { value: 27, label: "دمياط" },
];

export const getGovernorateLabel = (value) => {
  const governorate = GOVERNORATES_VALUES.find((g) => g.value === value);
  return governorate ? governorate.label : "";
};

export const getShipmentTypeLabel = (value) => {
  const shipmentType = SHIPMENT_TYPE_VALUES.find((g) => g.value === value);
  return shipmentType ? shipmentType.label : "";
};
export const getShipmentStatusLabel = (value) => {
  const shipmentStatus = SHIPMENT_STATUS_VALUES.find((g) => g.value === value);
  return shipmentStatus ? shipmentStatus.label : "";
};

const statusValues = {
  1: "معلق",
  3: "مؤكد",
  4: "ملغي",
  2: "قيد التصنيع ",
  5: "تم التسليم",
  6: "مسترجع ",
  7: "مستبدل ",
};

export const getStatusValue = (status) => {
  const resultValue = statusValues[status];
  return resultValue;
};

export const getDeliveryStatusValue = (status) => {
  const resultValue = deliveryStatusValues[status];
  return resultValue;
};

export const manufactureStatusOptions = [
  { label: "مقبول", value: 1 },
  { label: "قيد التصنيع", value: 2 },
  { label: "جاهز للشحن", value: 3 },
  { label: "تم التوصيل", value: 4 },
  { label: "فشل في التوصيل", value: 5 },
];
