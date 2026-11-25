/**
 * حالة فلاتر الأرشيف ↔ رابط الصفحة ↔ باراميترات الـ API (دوال نقية بلا React ليسهل اختبارها).
 * كل الفلاتر تُرسل للسيرفر؛ الرابط هو مصدر الحالة الوحيد فيبقى الفلتر بعد التحديث.
 */
import type { InvoiceKind, InvoiceListParams, InvoiceStatus } from "query/financialInvoices";

/** الأرشيف لا يعرض المسودات — تظهر في «الفواتير الجارية» فقط */
export const ARCHIVE_STATUSES: InvoiceStatus[] = ["reviewed", "frozen", "transferred"];
/** «مفتوحة» = لم تُسدَّد بعد (تمت المراجعة أو مجمدة) */
export const OPEN_STATUSES: InvoiceStatus[] = ["reviewed", "frozen"];
export const PAID_STATUSES: InvoiceStatus[] = ["transferred"];
/** عرض «الفواتير الشاملة» يشمل المعلّقة منها لأنها لا تظهر في الأرشيف قبل المراجعة */
export const CONSOLIDATED_STATUSES: InvoiceStatus[] = ["draft", "reviewed", "frozen", "transferred"];

export type StatusChip = "all" | "open" | "paid" | "consolidated";
export type DueDirection = "both" | "homix" | "vendor";
export type Cycle = "" | "13" | "28";

export interface ArchiveFilters {
  month: string;
  cycle: Cycle;
  direction: DueDirection;
  search: string;
  chip: StatusChip;
  vendorId: string;
  receipt: "" | "uploaded" | "missing";
  invoiceFrom: string;
  invoiceTo: string;
  transferredFrom: string;
  transferredTo: string;
  overdue: boolean;
  page: number;
}

export const DEFAULT_FILTERS: ArchiveFilters = {
  month: "", cycle: "", direction: "both", search: "", chip: "all", vendorId: "", receipt: "",
  invoiceFrom: "", invoiceTo: "", transferredFrom: "", transferredTo: "", overdue: false, page: 1,
};

/** مفتاح الرابط لكل فلتر (أسماء قصيرة ثابتة؛ `view` يخص الصفحة الأم) */
const KEYS: Record<keyof ArchiveFilters, string> = {
  month: "month", cycle: "cycle", direction: "dir", search: "q", chip: "chip", vendorId: "vendor", receipt: "receipt",
  invoiceFrom: "from", invoiceTo: "to", transferredFrom: "tfrom", transferredTo: "tto", overdue: "overdue", page: "page",
};

const oneOf = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);
const isDay = (value: string | null): value is string => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export function parseArchiveFilters(params: URLSearchParams, isVendor = false): ArchiveFilters {
  const month = params.get(KEYS.month);
  const vendor = params.get(KEYS.vendorId);
  const page = Number(params.get(KEYS.page));
  const day = (key: keyof ArchiveFilters) => { const value = params.get(KEYS[key]); return isDay(value) ? value : ""; };
  return {
    month: month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : "",
    cycle: oneOf(params.get(KEYS.cycle), ["", "13", "28"] as const, ""),
    direction: oneOf(params.get(KEYS.direction), ["both", "homix", "vendor"] as const, "both"),
    search: (params.get(KEYS.search) ?? "").slice(0, 100),
    chip: oneOf(params.get(KEYS.chip), ["all", "open", "paid", "consolidated"] as const, "all"),
    vendorId: !isVendor && vendor && /^\d+$/.test(vendor) ? vendor : "",
    receipt: oneOf(params.get(KEYS.receipt), ["", "uploaded", "missing"] as const, ""),
    invoiceFrom: day("invoiceFrom"),
    invoiceTo: day("invoiceTo"),
    transferredFrom: day("transferredFrom"),
    transferredTo: day("transferredTo"),
    overdue: !isVendor && params.get(KEYS.overdue) === "1",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** يكتب الفلاتر غير الافتراضية فقط في نسخة من الباراميترات الحالية (يحتفظ بباقي مفاتيح الرابط مثل `view`) */
export function writeArchiveFilters(base: URLSearchParams, filters: ArchiveFilters): URLSearchParams {
  const next = new URLSearchParams(base);
  (Object.keys(KEYS) as Array<keyof ArchiveFilters>).forEach((key) => {
    const value = filters[key];
    const isDefault = value === DEFAULT_FILTERS[key];
    if (isDefault) next.delete(KEYS[key]);
    else next.set(KEYS[key], typeof value === "boolean" ? "1" : String(value));
  });
  return next;
}

export const statusesForChip = (chip: StatusChip): InvoiceStatus[] => {
  if (chip === "open") return OPEN_STATUSES;
  if (chip === "paid") return PAID_STATUSES;
  if (chip === "consolidated") return CONSOLIDATED_STATUSES;
  return ARCHIVE_STATUSES;
};

export function toListParams(filters: ArchiveFilters, opts: { isVendor: boolean; pageSize: number }): InvoiceListParams {
  const kind: InvoiceKind | undefined = filters.chip === "consolidated" ? "consolidated" : undefined;
  return {
    status: statusesForChip(filters.chip),
    kind,
    month: filters.month || undefined,
    billingDay: filters.cycle ? Number(filters.cycle) : undefined,
    dueParty: filters.direction === "both" ? undefined : filters.direction,
    search: filters.search.trim() || undefined,
    vendorId: !opts.isVendor && filters.vendorId ? Number(filters.vendorId) : undefined,
    receipt: filters.receipt || undefined,
    invoiceFrom: filters.invoiceFrom || undefined,
    invoiceTo: filters.invoiceTo || undefined,
    transferredFrom: filters.transferredFrom || undefined,
    transferredTo: filters.transferredTo || undefined,
    overdue: filters.overdue || undefined,
    page: filters.page,
    size: opts.pageSize,
  };
}

/** عدد كل شريحة من الأعداد المفلترة (الشاملة لا عدّاد لها لأنها تتجاوز حالات الأرشيف) */
export function chipCounts(counts: Partial<Record<InvoiceStatus, number>> | undefined) {
  const get = (statuses: InvoiceStatus[]) => statuses.reduce((total, status) => total + (counts?.[status] ?? 0), 0);
  return { all: get(ARCHIVE_STATUSES), open: get(OPEN_STATUSES), paid: get(PAID_STATUSES) };
}

export const isFiltered = (filters: ArchiveFilters): boolean =>
  (Object.keys(DEFAULT_FILTERS) as Array<keyof ArchiveFilters>).some((key) => key !== "page" && filters[key] !== DEFAULT_FILTERS[key]);

const MONTH_NAMES = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
/** "2026-10" → "أكتوبر ٢٠٢٦" */
export function monthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const name = MONTH_NAMES[Number(match[2]) - 1];
  return name ? `${name} ${match[1].replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])}` : month;
}

/** باراميترات الصفحة الأم: عرض الأرشيف يُحفظ في الرابط أيضاً */
export const VIEW_PARAM = "view";
