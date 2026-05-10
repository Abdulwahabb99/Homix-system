/**
 * تنسيق المبالغ للعرض: أقرب عدد صحيح بدون كسور عشوائية من الـ API.
 */

/** مبلغ (ج.م) كرقم صحيح مع فواصل محلية */
export function formatMoneyEgpInteger(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("ar-EG-u-nu-latn");
}

/**
 * أرقام كبيرة بصيغة مختصرة (K / M) بأعداد صحيحة — للبطاقات والرسوم البيانية.
 */
export function formatMoneyCompact(value: unknown): string {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) {
    return `${Math.round(n / 1_000_000)}M`;
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)}K`;
  }
  return String(n);
}
