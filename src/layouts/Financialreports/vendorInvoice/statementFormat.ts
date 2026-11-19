/**
 * منطق نقي لكشف تسوية المورّد: تنسيق بأرقام لاتينية، اشتقاق الرقم/الدورة/الشهر/التاريخ،
 * وتحويل بيانات الفاتورة الحية والمحفوظة إلى شكل واحد (`StatementData`) يرسمه
 * `SettlementStatement`. بلا React ولا DOM فيُختبر مباشرة.
 */
import type { FinancialCycle } from "query/financialReport";
import type { InvoiceDetail, InvoiceStatus } from "query/financialInvoices";
import { MONTHS_AR } from "../utils/cycle";
import { sumCompanyDue } from "../utils/companyDue";
import type { SellerTotals, SettlementSeller } from "../utils/types";

export type StatementStatus = "open" | InvoiceStatus;

export interface StatementLine {
  key: string | number;
  operationNumber: string;
  orderNumber: string;
  productCode: string;
  /** true = توصيل هوميكس (تسليم مخزن)، false = توصيل البائع */
  homixDelivery: boolean;
  companyDue: number;
  vendorDue: number;
  fines: number;
}

export interface StatementData {
  /** مع «#» في البداية — نفس النص في الترويسة والتذييل */
  number: string;
  cycleLabel: string;
  monthLabel: string;
  issueDateLabel: string;
  status: StatementStatus;
  statusLabel: string;
  overdue: boolean;
  vendorName: string;
  ordersCount: number;
  operationsCount: number;
  lines: StatementLine[];
  vendorDueTotal: number;
  companyDueTotal: number;
  finesTotal: number;
  /** صافي التعديلات اليدوية للفواتير المحفوظة فقط؛ null = لا صف */
  adjustmentsTotal: number | null;
  /** القيمة المطلقة للصافي المستحق */
  net: number;
  /** الصافي مستحق لهوميكس (فواتير محفوظة فقط) */
  netOwedToHomix: boolean;
  /** تاريخ الختم YYYY-MM-DD، أو null = بلا ختم */
  stampDate: string | null;
}

/** الحالات التي تحمل ختم «معتمد» — مفتاح واحد للتبديل (مثلاً الكل لمطابقة النموذج). */
export const STAMPED_STATUSES: ReadonlySet<StatementStatus> = new Set<StatementStatus>(["reviewed", "frozen", "transferred"]);

export const STATEMENT_STATUS_LABEL: Record<StatementStatus, string> = {
  open: "مفتوحة",
  draft: "معلّقة",
  reviewed: "تمت المراجعة",
  frozen: "مجمدة",
  transferred: "تم التحويل",
};

/** ألوان شارة الحالة على الترويسة الكحلية (الخلفية / النص) */
export const STATEMENT_STATUS_COLORS: Record<StatementStatus | "overdue", { bg: string; fg: string }> = {
  open: { bg: "#304643", fg: "#E5E1C9" },
  draft: { bg: "#304643", fg: "#E5E1C9" },
  reviewed: { bg: "#1F4A63", fg: "#CFE3F1" },
  frozen: { bg: "#2B4F66", fg: "#B9D6E8" },
  transferred: { bg: "#1F4D3A", fg: "#BFE8CF" },
  overdue: { bg: "#5A2A24", fg: "#F3C1B8" },
};

export const STATEMENT_DELIVERY_LABEL = { homix: "هوميكس", vendor: "البائع" } as const;

/** أرقام لاتينية بفاصل آلاف وبلا كسور (نفس تقريب `arNum`). */
export function fmtLatin(value: unknown): string {
  const parsed = Number(value);
  return Math.round(Number.isFinite(parsed) ? parsed : 0).toLocaleString("en-US");
}

const CAIRO_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" });

/** YYYY-MM-DD بتوقيت القاهرة من تاريخ ISO أو يوم جاهز؛ null إن لم يصلح. */
export function cairoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : CAIRO_DAY.format(date);
}

/** «15 نوفمبر 2026» بأرقام لاتينية */
export function formatIssueDate(day: string | null): string {
  if (!day) return "—";
  const [year, month, date] = day.split("-").map(Number);
  return `${date} ${MONTHS_AR[month - 1]} ${year}`;
}

/** «نوفمبر 2026» */
export function formatMonthLabel(day: string | null): string {
  if (!day) return "—";
  const [year, month] = day.split("-").map(Number);
  return `${MONTHS_AR[month - 1]} ${year}`;
}

/** رقم الدورة داخل الشهر: يوم 13 → 1، يوم 28 → 2 */
export const cycleNumberOf = (billingDay: number | null | undefined): string =>
  billingDay === 13 ? "1" : billingDay === 28 ? "2" : "-";

/** «#V{المورد}-{MM}-C{n}» — مشتق، لا يوجد ترقيم مركزي للفاتورة الحية. */
export function buildDerivedNumber(vendorId: string | number, day: string | null, billingDay: number | null | undefined): string {
  const mm = day ? day.slice(5, 7) : "--";
  return `#V${vendorId}-${mm}-C${cycleNumberOf(billingDay)}`;
}

const countDistinct = (values: string[]): number => new Set(values).size;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** الفاتورة الحية (تبويب الفاتورة الشاملة) — الطلبات المحسوبة فقط (يمرّرها `forPrint`). */
export function statementFromLive(seller: SettlementSeller, totals: SellerTotals, cycle: FinancialCycle | null): StatementData {
  const lines: StatementLine[] = seller.row.orders.map((order) => ({
    key: order.id,
    operationNumber: order.operationNumber || `OP-${order.id}`,
    orderNumber: String(order.orderNumber || order.id),
    productCode: order.productCode || "",
    homixDelivery: order.shipmentId != null,
    companyDue: order.companyDue,
    vendorDue: order.vendorDue,
    fines: order.fines,
  }));
  const monthDay = cairoDay(cycle?.referenceDate) ?? cairoDay(cycle?.endDate);
  const issueDay = cairoDay(cycle?.endDate) ?? monthDay;
  const status: StatementStatus = seller.invoice?.status ?? "open";
  return {
    number: buildDerivedNumber(seller.id, monthDay, cycle?.billingDay),
    cycleLabel: cycle?.billingDay ? `دورة ${cycle.billingDay}` : "—",
    monthLabel: formatMonthLabel(monthDay),
    issueDateLabel: formatIssueDate(issueDay),
    status,
    statusLabel: STATEMENT_STATUS_LABEL[status],
    overdue: false,
    vendorName: seller.name || "—",
    ordersCount: countDistinct(lines.map((l) => l.orderNumber)),
    operationsCount: countDistinct(lines.map((l) => l.operationNumber)),
    lines,
    vendorDueTotal: totals.dueSeller,
    companyDueTotal: totals.dueComp,
    finesTotal: totals.fine,
    adjustmentsTotal: null,
    net: totals.netRequired,
    netOwedToHomix: false,
    stampDate: STAMPED_STATUSES.has(status) ? issueDay : null,
  };
}

/** الفاتورة المحفوظة — لقطة الـ BE، البنود المحسوبة فقط. */
export function statementFromInvoice(detail: InvoiceDetail): StatementData {
  const { invoice } = detail;
  const counted = detail.lines.filter((line) => line.state === "included");
  const lines: StatementLine[] = counted.map((line) => ({
    key: line.id,
    operationNumber: line.operationNumber || `OP-${line.orderId}`,
    orderNumber: String(line.orderNumber || line.orderId),
    productCode: line.productCode || "",
    homixDelivery: line.isWarehouseDelivery,
    companyDue: line.companyDue,
    vendorDue: line.vendorDue,
    fines: line.fines,
  }));
  const issueDay = cairoDay(invoice.periodEnd);
  const status = invoice.status;
  const adjustments = round2(Number(invoice.adjustmentsTotal) || 0);
  return {
    number: invoice.code ? `#${invoice.code}` : buildDerivedNumber(invoice.vendorId, issueDay, invoice.billingDay),
    cycleLabel: `دورة ${invoice.billingDay}`,
    monthLabel: formatMonthLabel(issueDay),
    issueDateLabel: formatIssueDate(issueDay),
    status,
    statusLabel: STATEMENT_STATUS_LABEL[status],
    overdue: Boolean(invoice.isOverdue),
    vendorName: invoice.vendorName || "—",
    ordersCount: invoice.ordersCount,
    operationsCount: countDistinct(lines.map((l) => l.operationNumber)),
    lines,
    vendorDueTotal: invoice.vendorDueTotal,
    companyDueTotal: sumCompanyDue(counted),
    finesTotal: invoice.finesTotal,
    adjustmentsTotal: adjustments === 0 ? null : adjustments,
    net: Math.abs(invoice.netAmount),
    netOwedToHomix: invoice.dueParty === "homix",
    stampDate: STAMPED_STATUSES.has(status) ? cairoDay(invoice.reviewedAt) ?? issueDay : null,
  };
}

/** اسم ملف PDF آمن: الرقم بلا «#». */
export const statementFileCode = (number: string): string => number.replace(/^#/, "");
