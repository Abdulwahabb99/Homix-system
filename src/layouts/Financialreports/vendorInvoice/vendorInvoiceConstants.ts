/**
 * ثوابت فاتورة تسوية المورّد (كشف التسوية). عدّل بيانات هوميكس/النصوص من هنا فقط.
 */

/** بيانات هوميكس البنكية — تظهر مرة واحدة في بطاقة «بيانات التحويل البنكي» أسفل الكشف */
export const HOMIX_BANK_DETAILS = {
  bank: "ALEXBANK",
  accountNumber: "115075655001",
  accountName: "Homix",
  instapay: "01027073080",
} as const;

export const HOMIX_WEBSITE = "homix-eg.com";
export const HOMIX_ISSUER_NAME = "هوميكس";
export const HOMIX_MARKETPLACE_LABEL = "هوميكس ماركت بليس";

export const VENDOR_INVOICE_FREEZE_HOURS = 48;

export const VENDOR_INVOICE_FOOTER_BRAND = "هوميكس · شركاء موثوقين";
/** شعار الكشف الجديد في التذييل (بعد اسم «هوميكس» بخط عريض) */
export const HOMIX_TAGLINE = "شركاء موثوقين";
export const VENDOR_INVOICE_FOOTER_NOTE = "وثيقة صادرة إلكترونيًا";
