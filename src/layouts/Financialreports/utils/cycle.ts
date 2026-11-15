/**
 * مساعدات دورة الفوترة على العميل — نفس حساب الـ BE (resolveFinancialCycleRange) عند تحديد يوم الفوترة:
 * يوم 13 = من 29 الشهر السابق إلى 13، ويوم 28 = من 14 إلى 28 من الشهر نفسه، بتوقيت القاهرة.
 * تُستخدم لتعبئة منتقي الشهر والفترة المخصصة افتراضياً بدورة الشهر الحالي.
 */
import { arDigits } from "./format";
import type { BillingDay } from "./types";

const pad = (value: number) => String(value).padStart(2, "0");
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** الشهر الحالي بتوقيت القاهرة بصيغة YYYY-MM */
export function currentMonthCairo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).slice(0, 7);
}

export interface CycleDates { startDate: string; endDate: string }

/** حدود دورة (YYYY-MM-DD) ليوم فوترة في شهر معيّن (YYYY-MM) — الشهر هو شهر يوم الفوترة نفسه */
export function cycleRange(billingDay: BillingDay, month: string): CycleDates {
  const [year, monthNumber] = month.split("-").map(Number);
  const end = `${year}-${pad(monthNumber)}-${pad(Math.min(billingDay, daysInMonth(year, monthNumber)))}`;
  if (billingDay === 28) return { endDate: end, startDate: `${year}-${pad(monthNumber)}-14` };
  const prevYear = monthNumber === 1 ? year - 1 : year;
  const prevMonth = monthNumber === 1 ? 12 : monthNumber - 1;
  return { endDate: end, startDate: `${prevYear}-${pad(prevMonth)}-${pad(Math.min(29, daysInMonth(prevYear, prevMonth)))}` };
}

export const getCycleLabel = (billingDay: BillingDay): string => (billingDay === 13 ? "دورة 13" : "دورة 28");

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** «14 نوفمبر — 28 نوفمبر 2026» */
export function formatCycleRange({ startDate, endDate }: CycleDates): string {
  const part = (day: string, withYear: boolean) => {
    const [year, month, date] = day.split("-").map(Number);
    return arDigits(`${date} ${MONTHS_AR[month - 1]}${withYear ? ` ${year}` : ""}`);
  };
  return `${part(startDate, false)} — ${part(endDate, true)}`;
}

/** المنتقي يعرض الشهر الحالي افتراضياً؛ `pastMonth` فارغ = الدورة الأحدث (وضع الدورة الحية) */
export const monthPickerValue = (pastMonth: string, now: Date = new Date()): string => pastMonth || currentMonthCairo(now);

/** اختيار الشهر الحالي يعني العودة للدورة الحية (لا مرجع)، وأي شهر آخر دورة سابقة */
export const pastMonthFromPicker = (picked: string, now: Date = new Date()): string => (picked === currentMonthCairo(now) ? "" : picked);
