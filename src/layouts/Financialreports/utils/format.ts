/**
 * تنسيق الأرقام لصفحة التقارير المالية — أرقام عربية-هندية كما في النموذج (toLocaleString('ar-EG')).
 * مصدر واحد للصفحة فقط؛ بقية الصفحات تحتفظ بتنسيقها. قيم حقول الإدخال الرقمية تبقى آلية (لاتينية).
 */
export function arNum(value: unknown): string {
  const parsed = Number(value);
  return Math.round(Number.isFinite(parsed) ? parsed : 0).toLocaleString("ar-EG");
}

/** تاريخ بأرقام عربية بتوقيت القاهرة */
export const arDate = (iso: string | null | undefined, withTime = false): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Cairo",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
};

/** يحوّل أرقام 0-9 داخل نص إلى الأرقام العربية-الهندية (للتواريخ المنسّقة يدوياً بلا فواصل آلاف) */
export const arDigits = (text: string): string => text.replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
