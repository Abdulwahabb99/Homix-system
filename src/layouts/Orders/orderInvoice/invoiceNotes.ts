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

export type CombinedInvoiceNote = { ref: string; text: string };

/**
 * ملاحظات الفاتورة المجمّعة: ملاحظة كل طلب (لو غير فارغة) مع رقم الطلب.
 * لو كل الطلبات المحددة لها نفس النص تُطبع مرة واحدة بلا رقم طلب.
 */
export function getCombinedInvoiceNotes(
  orders: Array<{ invoiceNotes?: unknown } | null | undefined>,
  refOf: (order: any) => string
): CombinedInvoiceNote[] {
  // نفس الطلب قد يتكرر (عدة أصناف من نفس رقم الطلب): نحتفظ بأول ظهور فقط
  const byRef = new Map<string, string>();
  orders.forEach((order) => {
    const ref = refOf(order);
    if (!byRef.has(ref)) byRef.set(ref, getInvoiceNotes(order));
  });
  const notes = [...byRef.entries()]
    .filter(([, text]) => text)
    .map(([ref, text]) => ({ ref, text }));
  const everyOrderHasSameNote =
    notes.length > 1 && notes.length === byRef.size && new Set(notes.map((n) => n.text)).size === 1;
  return everyOrderHasSameNote ? [{ ref: "", text: notes[0].text }] : notes;
}
