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

/**
 * مبيعات مضغوطة K / M برقم عشري واحد (مثال: 1_600_000 → 1,6M في ar-EG).
 */
export function formatMoneyCompactOneDecimal(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  const opts = { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v.toLocaleString("ar-EG-u-nu-latn", opts)}M`;
  }
  if (abs >= 1_000) {
    const v = n / 1_000;
    return `${v.toLocaleString("ar-EG-u-nu-latn", opts)}K`;
  }
  return Math.round(n).toLocaleString("ar-EG-u-nu-latn");
}
