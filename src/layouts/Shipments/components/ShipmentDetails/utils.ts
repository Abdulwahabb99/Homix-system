import moment from "moment";
import "shared/functions/momentLocale";

/** Localized integer formatting (no decimals), English digits. */
export function fmtNum(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** "12 مايو 2026" — falls back to an em dash for empty/invalid dates. */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).locale("ar");
  return m.isValid() ? m.format("D MMMM YYYY") : "—";
}

/** "12 مايو 2026، 9:05 ص" — falls back to an em dash for empty/invalid dates. */
export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).locale("ar");
  return m.isValid() ? m.format("D MMMM YYYY، h:mm A") : "—";
}

/** Whether a value looks like an http(s)/protocol-relative image URL. */
export function isImageUrl(value: string | null | undefined): boolean {
  return !!value && /^(https?:)?\/\//.test(value);
}

/** First character of a name for avatar initials, with a safe fallback. */
export function getInitial(name: string | null | undefined): string {
  return (name || "؟").charAt(0);
}
