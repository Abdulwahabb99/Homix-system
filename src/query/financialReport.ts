/**
 * تكامل تقرير دورة الفوترة — GET /orders/financialReport?billingDay=13|28
 *
 * يُرجع الـ BE مجاميع كل مورّد مع الطلبات التابعة له ضمن ثلاثة أقسام
 * (الفاتورة الشاملة / تسويات البائع / تسويات المخزن) + الملخص والدورة.
 *
 * الاصطلاحات: استخدم `axiosRequest` دائماً، ومفاتيح `financialKeys`، وعالِج
 * `force_logout` كبقية استعلامات المشروع.
 */
import { useQuery } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";
import { financialKeys } from "query/keys";
import { BillingDay } from "layouts/Financialreports/utils/types";
import type { VendorBank } from "query/financialInvoices";

export const FINANCIAL_REPORT_PATH = "/orders/financialReport";
export const FINANCIAL_REPORT_EXPORT_PATH = `${FINANCIAL_REPORT_PATH}/export`;

/**
 * معاملات التقرير — مصدر واحد يستخدمه الجلب والتصدير، فلا يُصدَّر ملف بدورة
 * فوترة مختلفة عمّا يراه المستخدم.
 */
/** نطاق مخصّص على تاريخ التسليم (YYYY-MM-DD) — يُرسَل كاملاً أو لا يُرسَل */
export interface FinancialDateRange {
  startDate: string;
  endDate: string;
}

export function buildFinancialReportQuery(billingDay: BillingDay, referenceDate?: string, range?: FinancialDateRange): string {
  const params = new URLSearchParams({ billingDay: String(billingDay) });
  if (referenceDate) params.set("referenceDate", referenceDate);
  if (range?.startDate && range?.endDate) {
    params.set("startDate", range.startDate);
    params.set("endDate", range.endDate);
  }
  return params.toString();
}

/** بيانات الدورة الحالية (cycle) */
export interface FinancialCycle {
  billingDay: number;
  startDate: string | null;
  endDate: string | null;
  referenceDate: string | null;
  mode: string | null;
}

/** الملخّص العام أعلى الاستجابة (يقود بطاقات الـ KPIs) */
export interface FinancialTopSummary {
  totalSales: number;
  vendorDue: number;
  companyDue: number;
  fines: number;
  /** Σ حصة هوميكس (تسليمات المخزن) */
  homixMargin: number;
  /** Σ ما يسدّده الصانع لهوميكس (تسليمات البائع) */
  vendorOwes: number;
  /** الصافي الموقّع = مستحق البائعين − المستحق لهوميكس − الغرامات */
  netAmount: number;
  vendorsCount: number;
}

/** مجاميع مورّد واحد داخل قسم معيّن */
export interface FinancialVendorItem {
  vendorId: number;
  vendorName: string;
  ordersCount: number;
  warehouseCost: number;
  collectionTotal: number;
  fines: number;
  vendorDue: number;
  companyDue: number;
  homixMargin: number;
  vendorOwes: number;
  /** الصافي الموقّع للمورّد (للقراءة؛ الواجهة تعيد حسابه بعد التراكب) */
  netAmount: number;
  /** بيانات حساب البائع — للموظف (finance_settle) والبائع نفسه فقط */
  vendorBank?: VendorBank | null;
  orders: FinancialOrderItem[];
}

export interface FinancialOrderItem {
  collectionTotal: number;
  companyDue: number;
  /** margin = تسليم المخزن · vendorOwes = تسليم البائع */
  companyDueKind?: "margin" | "vendorOwes";
  fines: number;
  id: number;
  operationNumber: string;
  orderId: number;
  orderNumber: string;
  paymentStatus: number | null;
  paymentStatusLabel: string;
  productCode: string;
  productId: number | null;
  shipmentId: number | null;
  vendorDue: number;
  vendorShippingCost: number;
  warehouseCost: number;
}

/** ملخّص قسم واحد (fullInvoice / vendorDeliveries / warehouseDeliveries) */
export interface FinancialSectionSummary {
  collectionTotal: number;
  companyDue: number;
  fines: number;
  homixMargin: number;
  vendorOwes: number;
  netAmount: number;
  ordersCount: number;
  vendorDue: number;
  warehouseCost: number;
}

/** قسم = ملخّص + قائمة موردين */
export interface FinancialSection {
  summary: FinancialSectionSummary;
  items: FinancialVendorItem[];
}

/** الاستجابة المُطبّعة الكاملة */
export interface FinancialReport {
  cycle: FinancialCycle;
  summary: FinancialTopSummary;
  fullInvoice: FinancialSection;
  vendorDeliveries: FinancialSection;
  warehouseDeliveries: FinancialSection;
}

interface ApiFinancialReportResponse {
  status?: boolean;
  force_logout?: boolean;
  data?: any;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown): string | null => {
  if (v == null) return null;
  const s = String(v);
  return s !== "" ? s : null;
};

function normalizeVendorItem(raw: any): FinancialVendorItem {
  return {
    vendorId: num(raw?.vendorId),
    vendorName: (raw?.vendorName != null ? String(raw.vendorName) : "").trim() || "—",
    ordersCount: num(raw?.ordersCount),
    warehouseCost: num(raw?.warehouseCost),
    collectionTotal: num(raw?.collectionTotal),
    fines: num(raw?.fines),
    vendorDue: num(raw?.vendorDue),
    companyDue: num(raw?.companyDue),
    homixMargin: num(raw?.homixMargin),
    vendorOwes: num(raw?.vendorOwes),
    netAmount: num(raw?.netAmount),
    // undefined (مفتاح غائب) ≠ null (لا بيانات مسجّلة)
    vendorBank: "vendorBank" in (raw ?? {}) ? normalizeVendorBank(raw.vendorBank) : undefined,
    orders: Array.isArray(raw?.orders) ? raw.orders.map(normalizeOrderItem) : [],
  };
}

export function normalizeVendorBank(raw: any): VendorBank | null {
  if (!raw || typeof raw !== "object") return null;
  const text = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
  const bank: VendorBank = {
    accountHolder: text(raw.accountHolder),
    accountNumber: text(raw.accountNumber),
    bankName: text(raw.bankName),
    instaPayNumber: text(raw.instaPayNumber),
    walletNumber: text(raw.walletNumber),
  };
  return Object.values(bank).some((v) => v !== null) ? bank : null;
}

function normalizeOrderItem(raw: any): FinancialOrderItem {
  return {
    collectionTotal: num(raw?.collectionTotal),
    companyDue: num(raw?.companyDue),
    companyDueKind: raw?.companyDueKind === "margin" || raw?.companyDueKind === "vendorOwes" ? raw.companyDueKind : undefined,
    fines: num(raw?.fines),
    id: num(raw?.id),
    operationNumber: String(raw?.operationNumber ?? ""),
    orderId: num(raw?.orderId ?? raw?.id),
    orderNumber: String(raw?.orderNumber ?? ""),
    paymentStatus: raw?.paymentStatus == null ? null : num(raw.paymentStatus),
    paymentStatusLabel: String(raw?.paymentStatusLabel ?? ""),
    productCode: String(raw?.productCode ?? ""),
    productId: raw?.productId == null ? null : num(raw.productId),
    shipmentId: raw?.shipmentId == null ? null : num(raw.shipmentId),
    vendorDue: num(raw?.vendorDue),
    vendorShippingCost: num(raw?.vendorShippingCost),
    warehouseCost: num(raw?.warehouseCost),
  };
}

function normalizeSectionSummary(raw: any): FinancialSectionSummary {
  return {
    collectionTotal: num(raw?.collectionTotal),
    companyDue: num(raw?.companyDue),
    fines: num(raw?.fines),
    homixMargin: num(raw?.homixMargin),
    vendorOwes: num(raw?.vendorOwes),
    netAmount: num(raw?.netAmount),
    ordersCount: num(raw?.ordersCount),
    vendorDue: num(raw?.vendorDue),
    warehouseCost: num(raw?.warehouseCost),
  };
}

function normalizeSection(raw: any): FinancialSection {
  return {
    summary: normalizeSectionSummary(raw?.summary),
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeVendorItem) : [],
  };
}

function normalizeCycle(raw: any): FinancialCycle {
  return {
    billingDay: num(raw?.billingDay),
    startDate: str(raw?.startDate),
    endDate: str(raw?.endDate),
    referenceDate: str(raw?.referenceDate),
    mode: str(raw?.mode),
  };
}

function normalizeTopSummary(raw: any): FinancialTopSummary {
  return {
    totalSales: num(raw?.totalSales),
    vendorDue: num(raw?.vendorDue),
    companyDue: num(raw?.companyDue),
    fines: num(raw?.fines),
    homixMargin: num(raw?.homixMargin),
    vendorOwes: num(raw?.vendorOwes),
    netAmount: num(raw?.netAmount),
    vendorsCount: num(raw?.vendorsCount),
  };
}

export const EMPTY_SECTION: FinancialSection = {
  summary: { collectionTotal: 0, companyDue: 0, fines: 0, homixMargin: 0, netAmount: 0, ordersCount: 0, vendorDue: 0, vendorOwes: 0, warehouseCost: 0 },
  items: [],
};

export const EMPTY_REPORT: FinancialReport = {
  cycle: { billingDay: 0, startDate: null, endDate: null, referenceDate: null, mode: null },
  summary: { totalSales: 0, vendorDue: 0, companyDue: 0, fines: 0, homixMargin: 0, vendorOwes: 0, netAmount: 0, vendorsCount: 0 },
  fullInvoice: EMPTY_SECTION,
  vendorDeliveries: EMPTY_SECTION,
  warehouseDeliveries: EMPTY_SECTION,
};

export async function fetchFinancialReport(
  billingDay: BillingDay,
  navigate: NavigateFunction,
  referenceDate?: string,
  range?: FinancialDateRange,
): Promise<FinancialReport> {
  const url = `${FINANCIAL_REPORT_PATH}?${buildFinancialReportQuery(billingDay, referenceDate, range)}`;
  const { data } = await axiosRequest.get(url);

  const root = data as ApiFinancialReportResponse;
  if (root?.force_logout) {
    forceLogoutAndNavigate(navigate);
    return EMPTY_REPORT;
  }

  const d = root?.data ?? {};
  return {
    cycle: normalizeCycle(d.cycle),
    summary: normalizeTopSummary(d.summary),
    fullInvoice: normalizeSection(d.fullInvoice),
    vendorDeliveries: normalizeSection(d.vendorDeliveries),
    warehouseDeliveries: normalizeSection(d.warehouseDeliveries),
  };
}

/**
 * `GET /orders/financialReport/export` — بنفس معاملات الجلب.
 * طلب واحد موثّق بالتوكن ثم يُحفظ الملف من نفس الاستجابة (بلا تنقّل).
 * تمرير `vendorId` (مثلاً من صف مورّد واحد في تبويب البائع/المخزن/الشاملة)
 * يقصر التصدير على فاتورة هذا المورّد وحده — الـ BE يدعم الفلترة بالفعل.
 */
export async function exportFinancialReport(billingDay: BillingDay, vendorId?: string | number, referenceDate?: string, range?: FinancialDateRange): Promise<void> {
  const params = new URLSearchParams(buildFinancialReportQuery(billingDay, referenceDate, range));
  if (vendorId !== undefined && vendorId !== null && String(vendorId).trim() !== "") {
    params.set("vendorId", String(vendorId));
  }
  const res = await axiosRequest.get(
    `${FINANCIAL_REPORT_EXPORT_PATH}?${params.toString()}`,
    { responseType: "blob" }
  );
  const fileName = vendorId
    ? `vendor-invoice-${vendorId}-day-${billingDay}${referenceDate ? `-${referenceDate}` : ""}.xlsx`
    : `financial-report-day-${billingDay}${referenceDate ? `-${referenceDate}` : ""}.xlsx`;
  downloadBlobResponse(res, fileName);
}

export function useFinancialReport(billingDay: BillingDay, referenceDate?: string, range?: FinancialDateRange) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: financialKeys.report(billingDay, referenceDate, range ? `${range.startDate}_${range.endDate}` : undefined),
    queryFn: () => fetchFinancialReport(billingDay, navigate, referenceDate, range),
    staleTime: 30_000,
  });
}
