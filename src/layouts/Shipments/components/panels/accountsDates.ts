import moment from "moment-timezone";

/**
 * تواريخ تبويب الحسابات. الباك إند يفسّر فلاتر settledDateFrom/To وdeliveryDateFrom/To
 * كأيام بتوقيت القاهرة (YYYY-MM-DD شاملة الطرفين)، ويعيد تواريخ العرض كلحظات ISO (UTC)،
 * لذلك العرض والتحويل هنا بتوقيت القاهرة دائماً وليس بتوقيت متصفح المستخدم.
 */
export const CAIRO_TZ = "Africa/Cairo";

/** المنتقي المشترك يتعامل بصيغة DD-MM-YYYY؛ الحالة والطلبات تبقى YYYY-MM-DD خام. */
export const toPickerDate = (iso: string): string => {
  if (!iso) return "";
  const m = moment(iso, "YYYY-MM-DD", true);
  return m.isValid() ? m.format("DD-MM-YYYY") : "";
};

export const fromPickerDate = (v: unknown): string => {
  if (!v) return "";
  const m = moment.isMoment(v) ? v : moment(String(v), "DD-MM-YYYY", true);
  return m.isValid() ? m.clone().locale("en").format("YYYY-MM-DD") : "";
};

/** لحظة ISO → "DD/MM/YY" باليوم المصري (بدون إزاحة يوم عند اختلاف منطقة المتصفح). */
export function fmtCairoDate(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).tz(CAIRO_TZ);
  return m.isValid() ? m.locale("en").format("DD/MM/YY") : "—";
}

/** لحظة ISO → "YYYY-MM-DD" باليوم المصري (لقيمة input type=date). */
export function toCairoYmd(d: string | null | undefined): string {
  if (!d) return "";
  const m = moment(d).tz(CAIRO_TZ);
  return m.isValid() ? m.locale("en").format("YYYY-MM-DD") : "";
}
