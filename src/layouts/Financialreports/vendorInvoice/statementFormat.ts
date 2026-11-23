/**
 * منطق نقي لكشف تسوية المورّد: تنسيق بأرقام لاتينية، اشتقاق الرقم/الدورة/الشهر/التاريخ،
 * وتحويل بيانات الفاتورة الحية والمحفوظة إلى شكل واحد (`StatementData`) يرسمه
 * `SettlementStatement`. بلا React ولا DOM فيُختبر مباشرة.
 */
import type { FinancialCycle } from "query/financialReport";
import type { InvoiceDetail, InvoiceStatus, VendorBank } from "query/financialInvoices";
import { MONTHS_AR } from "../utils/cycle";
import { countsTowardCompanyDue, sumCompanyDue } from "../utils/companyDue";
import { netDirectionOf, netLabelOf, roundMoney, transferredLabelOf, type NetDirection } from "../utils/netDirection";
import { HOMIX_BANK_DETAILS } from "./vendorInvoiceConstants";
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

export interface StatementExtraTotal { label: string; value: number }

/** صندوق بيانات التحويل أسفل الكشف — يتبع إشارة الصافي */
export interface StatementTransfer {
  /** vendor = بيانات حساب البائع (الصافي له) · homix = حساب هوميكس (الصافي عليه) · none = لا صندوق (صفر / غير مسموح) */
  kind: "vendor" | "homix" | "none";
  title: string;
  rows: Array<[string, string]>;
  note: string;
}

/** سطر في معادلة الإجماليات المطبوعة؛ sign: "" للأول، "+" أو "−" للباقي */
export interface StatementEquationRow { label: string; sign: "" | "+" | "−"; value: number; tone: "green" | "navy" | "red" | "plain"; kind: "vendor" | "company" | "fines" | "adjustments" }

export interface StatementData {
  /** عنوان المستند تحت الشعار */
  title: string;
  /** صفوف إجماليات إضافية تُعرض قبل صافي المستحق (مثلاً إجمالي التحصيل للبائع) */
  extraTotals: StatementExtraTotal[];
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
  /** الصافي الموقّع = مستحق البائع (إجمالي) − مستحق هوميكس − الغرامات (+ التعديلات): السالب = مستحق لهوميكس. يُعرض بقيمته المطلقة */
  net: number;
  /** اتجاه الصافي (للألوان والتسميات) */
  netDirection: NetDirection;
  /** «صافي المستحق للبائع» / «صافي المستحق لهوميكس» / «لا يوجد مستحق» */
  netLabel: string;
  /** صندوق بيانات التحويل بحسب إشارة الصافي */
  transfer: StatementTransfer;
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

/** تسمية الحالة: «تم التحويل» تتبع الاتجاه (للبائع / استلام من البائع) */
export const statementStatusLabel = (status: StatementStatus, net: number): string =>
  status === "transferred" ? transferredLabelOf(net) : STATEMENT_STATUS_LABEL[status];

export const TRANSFER_NOTES = {
  homix: "يُرجى تحويل الصافي المستحق لهوميكس وإرسال صورة إيصال التحويل.",
  vendor: "سيتم تحويل الصافي المستحق للبائع على الحساب الموضح وفق دورة السداد.",
  vendorMissing: "لم تُسجَّل بيانات بنكية لهذا البائع بعد.",
} as const;

/**
 * صندوق التحويل بحسب إشارة الصافي: الصافي > 0 ← حساب البائع (من `vendorBank`)، < 0 ← حساب هوميكس، 0 ← بلا صندوق.
 * `vendorBank`: undefined = المستخدم غير مسموح له برؤية بيانات البائع (لا صندوق)، null = لم تُسجَّل بيانات.
 */
export function buildTransfer(net: number, vendorName: string, vendorBank: VendorBank | null | undefined): StatementTransfer {
  const direction = netDirectionOf(net);
  if (direction === "homix") {
    return {
      kind: "homix",
      title: "بيانات التحويل البنكي — هوميكس",
      rows: [["البنك", HOMIX_BANK_DETAILS.bank], ["رقم الحساب", HOMIX_BANK_DETAILS.accountNumber], ["اسم الحساب", HOMIX_BANK_DETAILS.accountName], ["InstaPay", HOMIX_BANK_DETAILS.instapay]],
      note: TRANSFER_NOTES.homix,
    };
  }
  if (direction === "vendor" && vendorBank !== undefined) {
    const rows: Array<[string, string]> = vendorBank
      ? ([
        ["البنك", vendorBank.bankName],
        ["رقم الحساب", vendorBank.accountNumber],
        ["اسم الحساب", vendorBank.accountHolder],
        ["المحفظة", vendorBank.walletNumber],
        ["InstaPay", vendorBank.instaPayNumber],
      ] as Array<[string, string | null]>).filter((row): row is [string, string] => Boolean(row[1]))
      : [];
    return {
      kind: "vendor",
      title: `بيانات حساب البائع — ${vendorName}`,
      rows,
      note: rows.length > 0 ? TRANSFER_NOTES.vendor : TRANSFER_NOTES.vendorMissing,
    };
  }
  return { kind: "none", title: "", rows: [], note: "" };
}

/**
 * سطور معادلة الإجماليات المطبوعة: الصافي ≥ 0 ← مستحق البائع (إجمالي) − مستحق هوميكس − الغرامات؛
 * الصافي < 0 ← مستحق هوميكس + الغرامات − مستحق البائع (إجمالي). التعديلات اليدوية (إن وُجدت) تُعرض بإشارة تجعل المعادلة تُجمع تماماً.
 */
export function statementEquation(data: Pick<StatementData, "vendorDueTotal" | "companyDueTotal" | "finesTotal" | "adjustmentsTotal" | "net">): StatementEquationRow[] {
  const toHomix = roundMoney(data.net) < 0;
  const adjustments = data.adjustmentsTotal ?? 0;
  const vendor: StatementEquationRow = { label: "مستحق البائع (إجمالي)", sign: "", value: data.vendorDueTotal, tone: "green", kind: "vendor" };
  const company: StatementEquationRow = { label: "مستحق هوميكس", sign: "", value: data.companyDueTotal, tone: "navy", kind: "company" };
  const fines: StatementEquationRow = { label: "الغرامات", sign: "", value: data.finesTotal, tone: "red", kind: "fines" };
  const rows = toHomix
    ? [{ ...company }, { ...fines, sign: "+" as const }, { ...vendor, sign: "−" as const }]
    : [{ ...vendor }, { ...company, sign: "−" as const }, { ...fines, sign: "−" as const }];
  if (adjustments !== 0) {
    // الصافي الموقّع = بائع − هوميكس − غرامات + تعديلات؛ في العرض المعكوس نطرح التعديلات من |الصافي|
    const signedForView = toHomix ? -adjustments : adjustments;
    rows.push({ label: "تعديلات يدوية", sign: signedForView > 0 ? "+" : "−", value: Math.abs(adjustments), tone: "plain", kind: "adjustments" });
  }
  return rows;
}

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
export function buildDerivedNumber(vendorId: string | number, day: string | null, billingDay: number | null | undefined, prefix = "V"): string {
  const mm = day ? day.slice(5, 7) : "--";
  return `#${prefix}${vendorId}-${mm}-C${cycleNumberOf(billingDay)}`;
}

const countDistinct = (values: string[]): number => new Set(values).size;

const round2 = (n: number) => Math.round(n * 100) / 100;

const netFields = (net: number, _status: StatementStatus, vendorName: string, vendorBank: VendorBank | null | undefined) => ({
  net,
  netDirection: netDirectionOf(net),
  netLabel: netLabelOf(net),
  transfer: buildTransfer(net, vendorName, vendorBank),
});

/** الفاتورة الحية (تبويب الفاتورة الشاملة) — الطلبات المحسوبة فقط (يمرّرها `forPrint`). */
export type StatementKind = "vendor" | "seller";

export const STATEMENT_TITLES: Record<StatementKind, string> = { vendor: "كشف تسوية مورد", seller: "كشف تسوية بائع" };

/**
 * `kind: "seller"` = تبويب «تسويات البائع» (تسليمات البائع): نفس التصميم، العنوان «كشف تسوية بائع»،
 * الرقم #S…، والصافي = «المستحق للبائع» كما يعرضه التبويب، مع إجمالي التحصيل وشحن البائع كصفين إضافيين.
 */
export function statementFromLive(seller: SettlementSeller, totals: SellerTotals, cycle: FinancialCycle | null, kind: StatementKind = "vendor"): StatementData {
  const lines: StatementLine[] = seller.row.orders.map((order) => ({
    key: order.id,
    operationNumber: order.operationNumber || `OP-${order.id}`,
    orderNumber: String(order.orderNumber || order.id),
    productCode: order.productCode || "",
    homixDelivery: order.shipmentId != null,
    // تسليم المخزن لا مستحق لهوميكس فيه: صفر ← الخلية «—»
    companyDue: countsTowardCompanyDue(order) ? order.companyDue : 0,
    vendorDue: order.vendorDue,
    fines: order.fines,
  }));
  const monthDay = cairoDay(cycle?.referenceDate) ?? cairoDay(cycle?.endDate);
  const issueDay = cairoDay(cycle?.endDate) ?? monthDay;
  const status: StatementStatus = seller.invoice?.status ?? "open";
  const companyDueTotal = sumCompanyDue(seller.row.orders.map((order) => ({ ...order, state: "included" })));
  // الصافي من نفس الأرقام المطبوعة كي تُجمع المعادلة تماماً (بائع − هوميكس − غرامات)
  const net = round2(totals.dueSeller - companyDueTotal - totals.fine);
  return {
    title: STATEMENT_TITLES[kind],
    extraTotals: kind === "seller"
      ? [{ label: "إجمالي التحصيل", value: totals.collect }, { label: "إجمالي شحن البائع", value: totals.vendorShippingCost }]
      : [],
    number: buildDerivedNumber(seller.id, monthDay, cycle?.billingDay, kind === "seller" ? "S" : "V"),
    cycleLabel: cycle?.billingDay ? `دورة ${cycle.billingDay}` : "—",
    monthLabel: formatMonthLabel(monthDay),
    issueDateLabel: formatIssueDate(issueDay),
    status,
    statusLabel: statementStatusLabel(status, net),
    overdue: false,
    vendorName: seller.name || "—",
    ordersCount: countDistinct(lines.map((l) => l.orderNumber)),
    operationsCount: countDistinct(lines.map((l) => l.operationNumber)),
    lines,
    vendorDueTotal: totals.dueSeller,
    // نفس قاعدة الخلايا: بنود تسليم البائع فقط
    companyDueTotal,
    finesTotal: totals.fine,
    adjustmentsTotal: null,
    ...netFields(net, status, seller.name, seller.row.vendorBank),
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
    companyDue: countsTowardCompanyDue(line) ? line.companyDue : 0,
    vendorDue: line.vendorDue,
    fines: line.fines,
  }));
  const issueDay = cairoDay(invoice.periodEnd);
  const status = invoice.status;
  const adjustments = round2(Number(invoice.adjustmentsTotal) || 0);
  const companyDueTotal = sumCompanyDue(counted);
  // الصافي من نفس الأرقام المطبوعة (مطابق لـ netAmount المحفوظ لأي فاتورة حُسبت بالنموذج الحالي)
  const net = round2(invoice.vendorDueTotal - companyDueTotal - invoice.finesTotal + adjustments);
  return {
    title: STATEMENT_TITLES.vendor,
    extraTotals: [],
    number: invoice.code ? `#${invoice.code}` : buildDerivedNumber(invoice.vendorId, issueDay, invoice.billingDay),
    cycleLabel: `دورة ${invoice.billingDay}`,
    monthLabel: formatMonthLabel(issueDay),
    issueDateLabel: formatIssueDate(issueDay),
    status,
    statusLabel: statementStatusLabel(status, net),
    overdue: Boolean(invoice.isOverdue),
    vendorName: invoice.vendorName || "—",
    ordersCount: invoice.ordersCount,
    operationsCount: countDistinct(lines.map((l) => l.operationNumber)),
    lines,
    vendorDueTotal: invoice.vendorDueTotal,
    companyDueTotal,
    finesTotal: invoice.finesTotal,
    adjustmentsTotal: adjustments === 0 ? null : adjustments,
    ...netFields(net, status, invoice.vendorName || "—", detail.vendorBank),
    stampDate: STAMPED_STATUSES.has(status) ? cairoDay(invoice.reviewedAt) ?? issueDay : null,
  };
}

/** اسم ملف PDF آمن: الرقم بلا «#». */
export const statementFileCode = (number: string): string => number.replace(/^#/, "");
