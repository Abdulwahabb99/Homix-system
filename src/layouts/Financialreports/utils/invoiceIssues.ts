/**
 * منطق صافٍ لتبويب «أخطاء وتصحيحات»: عدّاد الشارة، وما يُعرض كإجراء تصحيح لكل ظهور للمشكلة.
 */
import type { InvoiceIssue, InvoiceIssuesResult, IssueOccurrence, IssueSeverity } from "query/financialInvoiceIssues";

export const ISSUES_TAB_LABEL = "أخطاء وتصحيحات";
export const ISSUES_EMPTY_TEXT = "مفيش أخطاء";
export const LOCKED_FIX_TEXT = "رجوع لمعلّقة أولًا";

export const SEVERITY_LABEL: Record<IssueSeverity, string> = { error: "خطأ", warning: "تحذير" };

/** رقم الشارة: عدد الأخطاء والتحذيرات معًا؛ null أثناء التحميل/عدم التوفر فلا تظهر الشارة */
export const issuesBadgeCount = (data: Pick<InvoiceIssuesResult, "counts"> | undefined | null): number | null => {
  const total = data?.counts?.total;
  return typeof total === "number" && Number.isFinite(total) ? total : null;
};

export type IssueFix =
  | { kind: "open"; label: string }
  | { kind: "remove"; label: string }
  | { kind: "refresh"; label: string }
  | { kind: "locked"; label: string };

/**
 * أزرار تصحيح ظهور واحد: الفتح دائمًا؛ التعديل (شيل البند/تحديث المسودة) للمسودة فقط،
 * وأي حالة أخرى تعرض «رجوع لمعلّقة أولًا» بدل الزر.
 */
export const fixesFor = (issue: Pick<InvoiceIssue, "type">, occurrence: Pick<IssueOccurrence, "invoiceStatus" | "lineId">): IssueFix[] => {
  const fixes: IssueFix[] = [{ kind: "open", label: "فتح الفاتورة" }];
  const mutating: IssueFix[] = [];
  if (occurrence.lineId !== null) mutating.push({ kind: "remove", label: "شيل البند" });
  if (issue.type === "order_changed" || issue.type === "net_drift" || issue.type === "both_dues") {
    mutating.push({ kind: "refresh", label: "تحديث المسودة" });
  }
  if (mutating.length === 0) return fixes;
  if (occurrence.invoiceStatus !== "draft") return [...fixes, { kind: "locked", label: LOCKED_FIX_TEXT }];
  return [...fixes, ...mutating];
};
