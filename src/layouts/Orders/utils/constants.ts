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

export const orderStatusValues = {
  1: "معلق",
  2: "مؤكد",
  3: "ملغي",
  4: "قيد التصنيع ",
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
