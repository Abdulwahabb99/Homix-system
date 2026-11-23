/**
 * منطق نقي للفاتورة الشاملة (دمج فواتير مفتوحة لنفس الصانع) ورسائل دمج الإيصالات — بلا React.
 * الخادم هو الحَكَم؛ هنا معاينة الصافي المجمّع واتجاه التحويل وأهلية الاختيار فقط.
 */
import { MONTHS_AR } from "../utils/cycle";
import { netDirectionOf, netLabelOf, roundMoney, type NetDirection } from "../utils/netDirection";
import type { InvoiceSummary, MergedSource } from "query/financialInvoices";

/** الدور المسموح بدمجه: معلّقة أو تمت المراجعة، عادية، غير مدمجة، بلا إيصال/تحويل — كما يفرضها الخادم */
export function mergeBlockReason(invoice: Pick<InvoiceSummary, "status" | "kind" | "mergeable" | "hasReceipt" | "transferredAt" | "mergedIntoId">): string | null {
  if (invoice.kind === "consolidated") return "فاتورة شاملة بالفعل";
  if (invoice.status === "consolidated" || invoice.mergedIntoId) return "مدمجة بالفعل";
  if (invoice.status !== "draft" && invoice.status !== "reviewed") return "يُدمج فقط «معلّقة» أو «تمت المراجعة»";
  if (invoice.hasReceipt) return "عليها إيصال تحويل";
  if (invoice.transferredAt) return "عليها بيانات تحويل";
  if (invoice.mergeable === false) return "غير قابلة للدمج";
  return null;
}

export interface MergePreview {
  count: number;
  /** الصافي الموقّع المجمّع (مجموع صافي كل فاتورة، التعديلات داخلها) */
  net: number;
  direction: NetDirection;
  label: string;
  /** اتجاه التحويل البنكي: vendor = تحويل لحساب الصانع، homix = حساب هوميكس، none = بلا */
  bank: "vendor" | "homix" | "none";
  /** آخر دورة ضمن المختار (تُصبح دورة الفاتورة الشاملة) */
  latestPeriodEnd: string | null;
}

/** معاينة الدمج: الصافي المجمّع = مجموع صوافي الفواتير (نفس المعادلة الموقّعة لأن البنود والتعديلات تنتقل كما هي) */
export function previewMerge(invoices: Array<Pick<InvoiceSummary, "netAmount" | "periodEnd">>): MergePreview {
  const net = roundMoney(invoices.reduce((total, invoice) => total + (Number(invoice.netAmount) || 0), 0));
  const direction = netDirectionOf(net);
  const latest = invoices.map((invoice) => invoice.periodEnd).filter((value): value is string => Boolean(value)).sort().pop() ?? null;
  return { count: invoices.length, net, direction, label: netLabelOf(net), bank: direction === "settled" ? "none" : direction, latestPeriodEnd: latest };
}

/** «INV-2026-0005 — دورة 13 — أكتوبر 2026» لفاتورة مجمّعة؛ `fallback` عندما لا يُعرف المصدر (بنود أُضيفت على الشاملة نفسها) */
export function sourceLabelOf(source: Pick<MergedSource, "code" | "billingDay" | "month"> | undefined, fallback = "—"): string {
  if (!source) return fallback;
  const [year, month] = source.month.split("-").map(Number);
  const monthLabel = year && month ? `${MONTHS_AR[month - 1]} ${year}` : source.month;
  return [source.code, `دورة ${source.billingDay}`, monthLabel].filter(Boolean).join(" — ");
}

/** رسالة دمج الإيصالات: أي إيصالات تعذّر دمجها (والباقي أُلحق)؛ فارغة عند النجاح الكامل */
export function mergeFailureMessage(failedNames: string[], appendedCount: number): string {
  if (failedNames.length === 0) return "";
  const names = failedNames.join("، ");
  if (appendedCount === 0) return `تعذّر دمج الإيصالات (${names}) — نزّلنا الفاتورة وحدها`;
  return `تعذّر دمج ${failedNames.length === 1 ? "الإيصال" : "الإيصالات"}: ${names} — تم دمج الباقي`;
}
