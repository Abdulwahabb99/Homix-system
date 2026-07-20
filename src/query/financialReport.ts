/**
 * تكامل تقرير دورة الفوترة — GET /orders/financialReport?billingDay=13|28
 *
 * يُرجع الـ BE مجاميع لكل مورّد ضمن ثلاثة أقسام (الفاتورة الشاملة / تسويات
 * البائع / تسويات المخزن) + ملخّص عام (KPIs) + بيانات الدورة (cycle). لا يوفّر
 * هذا الـ endpoint تفصيل الطلبات فرداً فرداً؛ لذلك يعمل الجدول على مستوى المورّد.
 *
 * الاصطلاحات: استخدم `axiosRequest` دائماً، ومفاتيح `financialKeys`، وعالِج
 * `force_logout` كبقية استعلامات المشروع.
 */
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";
import { financialKeys } from "query/keys";
import { BillingDay } from "layouts/Financialreports/utils/types";

export const FINANCIAL_REPORT_PATH = "/orders/financialReport";

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
}

/** ملخّص قسم واحد (fullInvoice / vendorDeliveries / warehouseDeliveries) */
export interface FinancialSectionSummary {
  collectionTotal: number;
  companyDue: number;
  fines: number;
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
  };
}

function normalizeSectionSummary(raw: any): FinancialSectionSummary {
  return {
    collectionTotal: num(raw?.collectionTotal),
    companyDue: num(raw?.companyDue),
    fines: num(raw?.fines),
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
    vendorsCount: num(raw?.vendorsCount),
  };
}

export const EMPTY_SECTION: FinancialSection = {
  summary: { collectionTotal: 0, companyDue: 0, fines: 0, ordersCount: 0, vendorDue: 0, warehouseCost: 0 },
  items: [],
};

export const EMPTY_REPORT: FinancialReport = {
  cycle: { billingDay: 0, startDate: null, endDate: null, referenceDate: null, mode: null },
  summary: { totalSales: 0, vendorDue: 0, companyDue: 0, fines: 0, vendorsCount: 0 },
  fullInvoice: EMPTY_SECTION,
  vendorDeliveries: EMPTY_SECTION,
  warehouseDeliveries: EMPTY_SECTION,
};

export async function fetchFinancialReport(
  billingDay: BillingDay,
  navigate: NavigateFunction
): Promise<FinancialReport> {
  const url = `${FINANCIAL_REPORT_PATH}?billingDay=${billingDay}`;
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

export function useFinancialReport(billingDay: BillingDay) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: financialKeys.report(billingDay),
    queryFn: () => fetchFinancialReport(billingDay, navigate),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
