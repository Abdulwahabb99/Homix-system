/**
 * مراجعة الدورة من التقرير الحي (بدون خطوة «إصدار الفواتير» اليدوية):
 * نصوص/حالات الشارة + شروط ظهور زر «تمت المراجعة» (دوال نقية قابلة للاختبار).
 */
import type { InvoiceStatus } from "query/financialInvoices";
import { transferredLabelOf } from "./netDirection";

export const REVIEW_LABEL = "تمت المراجعة";
export const REVIEW_ALL_LABEL = "مراجعة الكل";
export const CYCLE_OPEN_TOOLTIP = "الدورة لسه جارية";
export const NOT_REVIEWED_LABEL = "لم تُراجع";
export const NOT_REVIEWED_TOOLTIP = "لم تتم مراجعة فاتورة هذا الصانع لهذه الدورة بعد";
export const DRAFT_TOOLTIP = "فاتورة معلّقة — لم تتم مراجعتها بعد";

export type LiveChipTone = "pending" | "reviewed" | "frozen" | "transferred" | "merged";

/** شارة صف الصانع الحي: «لم تُراجع» للبلا فاتورة/المسودة، وحالات المراجعة اللاحقة كما هي */
/** `net` (صافي الفاتورة الموقّع) يحدد اتجاه «تم التحويل»: للبائع / استلام من البائع */
export function liveInvoiceChipMeta(status: InvoiceStatus | null | undefined, net?: number): { label: string; tone: LiveChipTone; tooltip: string } {
  switch (status) {
    case "reviewed": return { label: "تمت المراجعة", tone: "reviewed", tooltip: "" };
    case "frozen": return { label: "مجمّدة", tone: "frozen", tooltip: "" };
    case "transferred": return { label: net === undefined ? "تم التحويل" : transferredLabelOf(net), tone: "transferred", tooltip: "" };
    case "consolidated": return { label: "مدمجة في فاتورة شاملة", tone: "merged", tooltip: "فواتير هذا الصانع لهذه الدورة مدمجة في فاتورة شاملة — افتحها من الأرشيف" };
    case "draft": return { label: NOT_REVIEWED_LABEL, tone: "pending", tooltip: DRAFT_TOOLTIP };
    default: return { label: NOT_REVIEWED_LABEL, tone: "pending", tooltip: NOT_REVIEWED_TOOLTIP };
  }
}

export const isReviewedOrLater = (status: InvoiceStatus | null | undefined): boolean =>
  status === "reviewed" || status === "frozen" || status === "transferred" || status === "consolidated";

export interface ReviewButtonInput {
  canSettle: boolean;
  isVendor: boolean;
  cycleState: "custom" | "billing" | string;
  invoicesState: string;
  invoiceStatus?: InvoiceStatus | null;
  cycleOpen: boolean;
}

/** visible: الزر موجود أصلاً؛ disabled: موجود لكن معطّل (الدورة جارية) مع tooltip */
export function reviewButtonState(input: ReviewButtonInput): { visible: boolean; disabled: boolean; tooltip: string } {
  const visible = input.canSettle && !input.isVendor && input.cycleState === "billing"
    && input.invoicesState === "ready" && !isReviewedOrLater(input.invoiceStatus);
  return { visible, disabled: visible && input.cycleOpen, tooltip: visible && input.cycleOpen ? CYCLE_OPEN_TOOLTIP : "" };
}

export interface ReviewAllResult { vendorId: number; ok: boolean; error?: string; alreadyReviewed?: boolean }

export function reviewAllToast(res: { succeeded: number; failed: number; results: ReviewAllResult[] }): { type: "success" | "error"; message: string } {
  if (res.results.length === 0) return { type: "success", message: "لا توجد فواتير بطلبات محسوبة لمراجعتها" };
  const done = res.results.filter((row) => row.ok && !row.alreadyReviewed).length;
  const already = res.succeeded - done;
  const parts = [`تمت مراجعة ${done} فاتورة`];
  if (already > 0) parts.push(`${already} كانت مُراجعة مسبقاً`);
  if (res.failed > 0) parts.push(`تعذّرت ${res.failed} (${res.results.filter((row) => !row.ok).map((row) => `صانع ${row.vendorId}: ${row.error ?? "خطأ"}`).join("، ")})`);
  return { type: res.failed > 0 ? "error" : "success", message: parts.join(" — ") };
}
