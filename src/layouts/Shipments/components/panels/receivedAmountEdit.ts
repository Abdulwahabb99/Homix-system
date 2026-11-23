/**
 * تعديل «المبلغ المستلم» داخل جدول الحسابات: تحويل نص الحقل إلى رقم صالح،
 * وتحديد هل يستحق الحفظ أم لا (لا طلب عند عدم تغيّر القيمة).
 */
export type ReceivedAmountError = "empty" | "invalid" | "negative";
/* بنية مسطّحة (لا union) لأن المشروع بلا strictNullChecks فلا يضيّق TS الـ union. */
export interface ReceivedAmountParse {
  ok: boolean;
  value: number;
  reason?: ReceivedAmountError;
}

/** نص حقل الإدخال → رقم غير سالب؛ الصفر قيمة صريحة مقبولة. */
export function parseReceivedAmount(raw: string): ReceivedAmountParse {
  const text = raw.trim();
  if (text === "") return { ok: false, value: 0, reason: "empty" };
  const value = Number(text);
  if (!Number.isFinite(value)) return { ok: false, value: 0, reason: "invalid" };
  if (value < 0) return { ok: false, value: 0, reason: "negative" };
  // دقة قرشين كما يقبلها حقل step=0.01 — يمنع تراكم كسور عائمة.
  return { ok: true, value: Math.round(value * 100) / 100 };
}

/** هل يُرسَل طلب حفظ؟ فقط للقيمة الصالحة المختلفة عن المخزَّنة. */
export function shouldCommitReceivedAmount(raw: string, current: number | null | undefined): boolean {
  const parsed = parseReceivedAmount(raw);
  return parsed.ok && parsed.value !== Number(current ?? 0);
}

export const RECEIVED_AMOUNT_ERRORS: Record<ReceivedAmountError, string> = {
  empty: "أدخل المبلغ المستلم",
  invalid: "أدخل مبلغاً صحيحاً",
  negative: "المبلغ المستلم لا يمكن أن يكون سالباً",
};
