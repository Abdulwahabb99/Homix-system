/**
 * «مسودة ملاحظات» الطلب: نص حر يكتبه الموظف في صفحة التفاصيل ويُطبع في الفاتورة.
 * الحد الأقصى يطابق الباك إند (INVOICE_NOTES_MAX_LENGTH) وبه تبقى الفاتورة في صفحة واحدة.
 */
export const INVOICE_NOTES_MAX_LENGTH = 1000;

/** النص المحفوظ على الطلب بعد التنظيف؛ "" عند غياب الملاحظة. */
export function getInvoiceNotes(orderDetails: { invoiceNotes?: unknown } | null | undefined): string {
  const raw = orderDetails?.invoiceNotes;
  return typeof raw === "string" ? raw.trim() : "";
}

/** المسودة كما ستُرسل: مقصوصة الفراغات وبحد أقصى الطول المسموح. */
export function normalizeInvoiceNotesDraft(draft: string): string {
  return draft.trim().slice(0, INVOICE_NOTES_MAX_LENGTH);
}

/** هل تغيّرت المسودة عن المحفوظ (يُتجاهل الفراغ الزائد)؟ */
export function isInvoiceNotesDirty(draft: string, saved: string): boolean {
  return normalizeInvoiceNotesDraft(draft) !== saved.trim();
}
