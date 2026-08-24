/**
 * ثوابت فاتورة تسوية المورّد (الفاتورة الشاملة). عدّل بيانات هوميكس/النصوص من هنا فقط.
 */

/** بيانات هوميكس البنكية — تظهر أعلى الفاتورة وفي بطاقة طرف «هوميكس» */
export const HOMIX_BANK_DETAILS = {
  bank: "ALEXBANK",
  accountNumber: "115075655001",
  accountName: "Homix",
  instapay: "01027073080",
} as const;

export const VENDOR_INVOICE_FREEZE_HOURS = 48;

export const VENDOR_INVOICE_FOOTER_BRAND = "هوميكس · شركاء موثوقين";
export const VENDOR_INVOICE_FOOTER_NOTE = "وثيقة صادرة إلكترونياً";
