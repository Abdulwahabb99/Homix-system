/**
 * «أخطاء وتصحيحات» — GET /financial-invoices/issues (موظفو المالية فقط، قراءة فقط).
 * المفتاح تحت financialKeys.invoices() فيتحدّث تلقائياً بعد أي تعديل على الفواتير.
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { INVOICES_PATH, serializeParams, type InvoiceStatus } from "./financialInvoices";
import { financialKeys } from "./keys";

export type IssueSeverity = "error" | "warning";
export type IssueType =
  | "cross_vendor" | "dup_in_invoice" | "dup_cross_cycle" | "dup_same_cycle"
  | "missing_operation" | "both_dues" | "order_changed" | "net_drift";

export interface IssueOccurrence {
  invoiceId: number;
  invoiceCode: string | null;
  invoiceStatus: InvoiceStatus;
  /** null لمشكلة على مستوى الفاتورة (صافي لا يطابق) */
  lineId: number | null;
  orderId: number | null;
  periodEnd: string | null;
  vendorId: number;
  vendorName: string;
}

export interface InvoiceIssue {
  id: string;
  type: IssueType;
  typeLabel: string;
  severity: IssueSeverity;
  operationNumber: string;
  orderNumber: string;
  orderId: number | null;
  vendorId: number;
  vendorName: string;
  details: string;
  occurrences: IssueOccurrence[];
}

export interface InvoiceIssuesResult {
  counts: { errors: number; warnings: number; total: number };
  issues: InvoiceIssue[];
  scopedInvoices: number;
  /** الفلتر أكبر من الحد الأقصى فجزء من الفواتير لم يُفحص — ضيّق الشهر أو الصانع */
  truncated: boolean;
}

export interface InvoiceIssuesParams {
  /** YYYY-MM لنهاية الدورة (القاهرة)؛ فارغ = كل الشهور */
  month?: string;
  billingDay?: 13 | 28;
  vendorId?: number;
}

export const invoiceIssuesKey = (params: InvoiceIssuesParams) =>
  [...financialKeys.invoices(), "issues", serializeParams({ ...params })] as const;

export function useInvoiceIssues(params: InvoiceIssuesParams, enabled = true) {
  const key = serializeParams({ ...params });
  return useQuery({
    queryKey: invoiceIssuesKey(params),
    queryFn: async () => {
      const response = await axiosRequest.get(`${INVOICES_PATH}/issues${key ? `?${key}` : ""}`);
      return response.data?.data as InvoiceIssuesResult;
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
