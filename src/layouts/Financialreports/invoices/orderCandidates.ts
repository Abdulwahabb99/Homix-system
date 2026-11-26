/** نصوص منتقي «إضافة طلب»: سبب عدم إتاحة الطلب بالعربي — الخادم هو الحَكَم، هنا العرض فقط. */
import { MONTHS_AR } from "../utils/cycle";
import type { OrderCandidate } from "query/financialInvoices";

export const NO_VENDOR_ORDER_MATCH = "مفيش طلب بالرقم ده لهذا الصانع";

const arDigits = (value: string): string => value.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** «دورة 13 نوفمبر» من نهاية الدورة (بتوقيت القاهرة)؛ فارغ لو التاريخ غير صالح */
export function cycleLabelOf(periodEnd: string | null | undefined): string {
  if (!periodEnd) return "";
  const date = new Date(periodEnd);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", day: "numeric", month: "numeric" }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = Number(parts.find((part) => part.type === "month")?.value);
  if (!day || !MONTHS_AR[month - 1]) return "";
  return `دورة ${arDigits(day)} ${MONTHS_AR[month - 1]}`;
}

/** سطر السبب للطلب غير المتاح؛ null للمتاح */
export function candidateReasonLabel(candidate: Pick<OrderCandidate, "available" | "reason" | "invoice">): string | null {
  if (candidate.available) return null;
  switch (candidate.reason) {
    case "already_invoiced": {
      const cycle = cycleLabelOf(candidate.invoice?.periodEnd);
      const code = candidate.invoice?.code || (candidate.invoice ? `#${candidate.invoice.id}` : "أخرى");
      return `موجود في الفاتورة ${code}${cycle ? ` (${cycle})` : ""} — افتحها لنقله`;
    }
    case "order_not_delivered": return "الطلب لسه ما اتسلّمش";
    case "shipment_not_delivered": return "شحنة الطلب مش متسلّمة (توصيل هوميكس)";
    default: return "غير متاح للإضافة";
  }
}

const STATUS_LABELS: Record<number, string> = {
  1: "قيد الانتظار", 2: "قيد التنفيذ", 3: "مؤكد", 4: "ملغي", 5: "مسلّم", 6: "مسترجع", 7: "مستبدل", 8: "في المخزن",
};
export const candidateStatusLabel = (status: number): string => STATUS_LABELS[status] ?? (status >= 9 ? "ملغي" : "—");
