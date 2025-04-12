export const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "مؤكد", value: 2 },
  { label: "ملغي", value: 3 },
  { label: "قيد التصنيع ", value: 4 },
  { label: "تم التسليم", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "مستبدل ", value: 7 },
];
export const PAYMENT_STATUS = [
  { label: "مدفوع", value: 1 },
  { label: "دفع عند الاستلام", value: 2 },
];
export const DELIVERY_STATUS = [
  { label: "في مده التصنيع", value: 1 },
  { label: "أوشك علي التأخير", value: 2 },
  { label: "تعدي المده", value: 3 },
  { label: "متأخر", value: 4 },
];

export const customerInitialState = {
  name: "",
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
};

export const paymentStatusValues = {
  1: "مدفوع",
  2: "دفع عند الاستلام",
};
