export const FONT = "'Cairo', sans-serif";

export interface SelectOption {
  value: number;
  label: string;
}

/** طريقة الدفع — تطابق قيم الـ API (1 = عند الاستلام، 2 = مدفوع) */
export const PAYMENT_OPTIONS: SelectOption[] = [
  { value: 1, label: "دفع عند الاستلام" },
  { value: 2, label: "مدفوع" },
];

/** التوصيل بواسطة — تطابق قيم الـ API */
export const DELIVERY_BY_OPTIONS: SelectOption[] = [
  { value: 1, label: "هوميكس" },
  { value: 2, label: "بائع" },
];

export const DEFAULT_PAYMENT_STATUS = 1;
export const DEFAULT_DELIVERY_BY = 1;
