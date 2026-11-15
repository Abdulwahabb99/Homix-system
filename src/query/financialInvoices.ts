/**
 * فواتير الصناع المحفوظة — GET/POST /financial-invoices/*
 * (الفاتورة تُولَّد من تقرير الدورة ثم تُجمَّد كلقطة؛ الحالات: draft → reviewed → transferred / frozen).
 * كل الطلبات عبر `axiosRequest`، والمفاتيح من `financialKeys`.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { financialKeys } from "./keys";

export const INVOICES_PATH = "/financial-invoices";

export type InvoiceStatus = "draft" | "reviewed" | "frozen" | "transferred";
export type LineState = "included" | "frozen" | "deferred" | "removed";
export type LineAction = "defer" | "freeze" | "unfreeze" | "delete" | "restore";

export interface InvoiceSummary {
  id: number;
  code: string | null;
  vendorId: number;
  vendorName: string;
  billingDay: number;
  periodStart: string | null;
  periodEnd: string | null;
  status: InvoiceStatus;
  statusLabel: string;
  ordersCount: number;
  collectionTotal: number;
  warehouseCost: number;
  vendorShippingCost: number;
  finesTotal: number;
  vendorDueTotal: number;
  companyDueTotal: number;
  adjustmentsTotal: number;
  /** الصافي الموقّع: ≥ 0 مستحق للبائع، < 0 مستحق لهوميكس */
  netAmount: number;
  /** المبلغ المعروض: مبلغ التحويل الفعلي إن حُوّلت وإلا |الصافي| */
  amount: number;
  dueParty: "vendor" | "homix";
  reviewedAt: string | null;
  frozenAt: string | null;
  transferredAt: string | null;
  transferAmount: number | null;
  daysCounter: number | null;
  isOverdue: boolean;
  overdueDays: number;
  hasReceipt: boolean;
  receiptName: string | null;
  receiptUploadedAt: string | null;
  createdAt: string | null;
}

export interface InvoiceLine {
  id: number;
  orderId: number;
  operationNumber: string;
  orderNumber: string;
  productCode: string;
  paymentStatus: number | null;
  paymentStatusLabel: string;
  isWarehouseDelivery: boolean;
  collectionTotal: number;
  warehouseCost: number;
  vendorShippingCost: number;
  fines: number;
  vendorDue: number;
  companyDue: number;
  /** حقول التعديل لا تصل إلى البائع إطلاقاً (undefined) — اختبرها بـ `!= null` */
  finesOverride?: number | null;
  vendorDueOverride?: number | null;
  companyDueOverride?: number | null;
  warehouseCostOverride?: number | null;
  collectionOverride?: number | null;
  /** هامش هوميكس أم مستحق على الصانع (الحساب نفسه، الاختلاف في المعنى فقط) */
  companyDueKind?: "margin" | "vendorOwes";
  /** القيم الأصلية قبل التعديل — لا تصل إلى البائع */
  originalWarehouseCost?: number;
  originalCollection?: number;
  originalFines?: number;
  originalVendorDue?: number;
  originalCompanyDue?: number;
  overrideReason?: string | null;
  state: LineState;
  stateReason?: string | null;
}

export interface InvoiceAdjustment {
  id: number;
  label: string;
  kind: "addition" | "deduction";
  amount: number;
  removedAt: string | null;
  createdAt: string | null;
}

export interface InvoiceDetail {
  invoice: InvoiceSummary;
  lines: InvoiceLine[];
  adjustments: InvoiceAdjustment[];
}

export interface InvoiceListParams {
  status?: InvoiceStatus[];
  vendorId?: number;
  search?: string;
  invoiceCode?: string;
  billingDay?: number;
  invoiceFrom?: string;
  invoiceTo?: string;
  transferredFrom?: string;
  transferredTo?: string;
  dueParty?: "vendor" | "homix";
  receipt?: "uploaded" | "missing";
  overdue?: boolean;
  page?: number;
  size?: number;
}

export interface InvoiceListResult {
  items: InvoiceSummary[];
  counts: Partial<Record<InvoiceStatus, number>>;
  page: number;
  size: number;
  total: number;
}

export interface InvoicedLine extends InvoiceLine {
  invoiceId: number;
  invoiceCode: string | null;
  invoiceStatus: InvoiceStatus;
  invoiceStatusLabel: string;
  periodEnd: string | null;
  transferredAt: string | null;
  vendorId: number;
  vendorName: string;
  hasReceipt: boolean;
}

/** فاتورة صانع داخل دورة واحدة (بدون الأرقام التفصيلية) */
export interface CycleInvoiceRef {
  id: number;
  vendorId: number;
  code: string | null;
  status: InvoiceStatus;
  statusLabel: string;
  adjustmentsTotal: number;
  netAmount: number;
}

/** بند فاتورة لا يستطيع التقرير الحي إعادة إنتاجه وحده (معدّل / غير محسوب / خارج نافذة الدورة) */
export interface CycleOverlayLine extends InvoiceLine {
  invoiceId: number;
  vendorId: number;
  outsideCycle: boolean;
}

export interface CycleOverview {
  invoices: CycleInvoiceRef[];
  lines: CycleOverlayLine[];
  /** invoiceId → أرقام الطلبات المحسوبة في الفاتورة */
  includedOrderIds: Record<string, number[]>;
}

export interface ActivityEvent {
  id: number;
  invoiceId: number | null;
  invoiceCode: string | null;
  vendorName: string | null;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  detail: Record<string, unknown>;
  actorName: string | null;
  createdAt: string;
}

const unwrap = <T,>(response: { data?: { data?: T } }): T => response.data?.data as T;

export function serializeParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return;
    search.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  return search.toString();
}

/** رسالة خطأ الـ API (409/400…) كما هي لعرضها للمستخدم */
export function apiErrorMessage(error: unknown, fallback = "حدث خطأ غير متوقع"): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || fallback;
}

export function useInvoicesList(params: InvoiceListParams, enabled = true) {
  const key = serializeParams({ ...params });
  return useQuery({
    queryKey: financialKeys.invoiceList(key),
    queryFn: async () => unwrap<InvoiceListResult>(await axiosRequest.get(`${INVOICES_PATH}?${key}`)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** طلب واحد لكل دورة: حالة فاتورة كل صانع + البنود المعدّلة (يُستخدم في التقرير الحي). */
export function useCycleInvoices(periodEnd: string | null, enabled = true) {
  return useQuery({
    queryKey: financialKeys.invoiceCycle(periodEnd ?? ""),
    queryFn: async () => unwrap<CycleOverview>(await axiosRequest.get(`${INVOICES_PATH}/cycle?${serializeParams({ periodEnd })}`)),
    enabled: enabled && Boolean(periodEnd),
  });
}

export function useInvoiceDetail(id: number | null) {
  return useQuery({
    queryKey: financialKeys.invoiceDetail(id ?? 0),
    queryFn: async () => unwrap<InvoiceDetail>(await axiosRequest.get(`${INVOICES_PATH}/${id}`)),
    enabled: id !== null,
  });
}

export interface InvoicedLinesParams {
  operationNumber?: string;
  orderNumber?: string;
  productCode?: string;
  invoiceCode?: string;
  /** رقم أو قائمة أرقام مفصولة بفاصلة (الـ BE يتجاهلها للبائع) */
  vendorId?: string;
  page?: number;
  size?: number;
}

/** خيارات فلتر الصانع (للموظفين فقط) */
export function useVendorOptions(enabled: boolean) {
  return useQuery({
    queryKey: financialKeys.vendorOptions(),
    queryFn: async () => unwrap<Array<{ id: number; name: string }>>(await axiosRequest.get(`${INVOICES_PATH}/vendors`)),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvoicedLines(params: InvoicedLinesParams, enabled = true) {
  const key = serializeParams({ ...params });
  return useQuery({
    queryKey: financialKeys.invoicedLines(key),
    queryFn: async () => unwrap<{ items: InvoicedLine[]; total: number; page: number; size: number }>(await axiosRequest.get(`${INVOICES_PATH}/lines?${key}`)),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useInvoiceActivity(params: { invoiceId?: number; page?: number; size?: number }, enabled = true) {
  const key = serializeParams(params);
  return useQuery({
    queryKey: financialKeys.invoiceActivity(key),
    queryFn: async () => unwrap<{ rows: ActivityEvent[]; total: number }>(await axiosRequest.get(`${INVOICES_PATH}/activity?${key}`)),
    enabled,
  });
}

export function useReconciliationSummary(range: { from?: string; to?: string }, enabled = true) {
  const key = serializeParams(range);
  return useQuery({
    queryKey: financialKeys.reconciliation(key),
    queryFn: async () => unwrap<{ count: number; systemTotal: number }>(await axiosRequest.get(`${INVOICES_PATH}/reconciliation?${key}`)),
    enabled,
  });
}

/** كل التعديلات تُبطل مفاتيح الفواتير كلها (قوائم/تفاصيل/سجل النشاط) */
function useInvoiceMutation<TVars, TData = unknown>(
  mutationFn: (vars: TVars) => Promise<TData>,
  successMessage?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.invoices() });
      /* التقرير الحي يعرض أي البنود مفوتَرة — حدّثه أيضاً بعد الإصدار/التعديل. */
      queryClient.invalidateQueries({ queryKey: financialKeys.all() });
      if (successMessage) NotificationMeassage("success", successMessage);
    },
    onError: (error) => NotificationMeassage("error", apiErrorMessage(error)),
  });
}

export const useGenerateInvoices = () =>
  useInvoiceMutation(async (vars: { billingDay: 13 | 28; referenceDate?: string; vendorId?: number }) =>
    unwrap<{ invoices: Array<{ created: boolean; added: number; vendorId: number; invoiceId: number }> }>(
      await axiosRequest.post(`${INVOICES_PATH}/generate`, vars)));

export const useTransitionInvoice = () =>
  useInvoiceMutation(async (vars: { id: number; to: InvoiceStatus; transferAmount?: number }) =>
    unwrap<InvoiceSummary>(await axiosRequest.post(`${INVOICES_PATH}/${vars.id}/transition`, { to: vars.to, transferAmount: vars.transferAmount })));

export const useBulkTransition = () =>
  useInvoiceMutation(async (vars: { ids: number[]; to: "reviewed" | "frozen" | "transferred" }) =>
    unwrap<{ results: Array<{ id: number; ok: boolean; error?: string }>; succeeded: number }>(
      await axiosRequest.post(`${INVOICES_PATH}/bulk-transition`, vars)));

export const useSyncInvoice = () =>
  useInvoiceMutation(async (id: number) =>
    unwrap<{ added: number; skippedDeferred: number[] }>(await axiosRequest.post(`${INVOICES_PATH}/${id}/sync`)));

export const useAddAdjustment = () =>
  useInvoiceMutation(async (vars: { id: number; label: string; kind: "addition" | "deduction"; amount: number }) =>
    unwrap(await axiosRequest.post(`${INVOICES_PATH}/${vars.id}/adjustments`, { label: vars.label, kind: vars.kind, amount: vars.amount })));

export const useRemoveAdjustment = () =>
  useInvoiceMutation(async (vars: { id: number; adjustmentId: number }) =>
    unwrap(await axiosRequest.delete(`${INVOICES_PATH}/${vars.id}/adjustments/${vars.adjustmentId}`)));

export interface LineOverridePatch {
  warehouseCostOverride?: number | null;
  collectionOverride?: number | null;
  finesOverride?: number | null;
  vendorDueOverride?: number | null;
  companyDueOverride?: number | null;
  reason?: string;
}
export const useSetLineOverride = () =>
  useInvoiceMutation(async (vars: { id: number; lineId: number; patch: LineOverridePatch }) =>
    unwrap(await axiosRequest.patch(`${INVOICES_PATH}/${vars.id}/lines/${vars.lineId}`, vars.patch)));

export interface LiveLineEditVars {
  /** فاتورة الصانع في هذه الدورة إن وُجدت — وإلا تُصدر تلقائياً عند أول تعديل */
  invoiceId: number | null;
  vendorId: number;
  billingDay: 13 | 28;
  /** يوم نهاية الدورة (YYYY-MM-DD بتوقيت القاهرة) */
  cycleEndDay: string;
  orderId: number;
  patch: LineOverridePatch;
}

const liveEditError = (message: string) => Object.assign(new Error(message), { response: { data: { message } } });

/**
 * تعديل رقم طلب من التقرير الحي: (1) يُصدر مسودة فاتورة الصانع للدورة المغلقة إن لم توجد،
 * (2) يجد بند الطلب في الفاتورة (ويزامنها مرة واحدة إن لم يكن موجوداً)، (3) يطبّق التعديل.
 * الخادم هو الحَكَم: يرفض غير المسودات (409) ومن لا يملك finance_settle (403).
 */
export const useLiveLineEdit = () =>
  useInvoiceMutation(async (vars: LiveLineEditVars) => {
    let invoiceId = vars.invoiceId;
    if (invoiceId === null) {
      const generated = await unwrap<{ invoices: Array<{ vendorId: number; invoiceId: number }> }>(
        await axiosRequest.post(`${INVOICES_PATH}/generate`, { billingDay: vars.billingDay, referenceDate: vars.cycleEndDay, vendorId: vars.vendorId }));
      invoiceId = generated.invoices.find((item) => Number(item.vendorId) === vars.vendorId)?.invoiceId ?? null;
      if (invoiceId === null) throw liveEditError("تعذّر إصدار فاتورة الصانع لهذه الدورة");
    }
    const fetchDetail = async () => unwrap<InvoiceDetail>(await axiosRequest.get(`${INVOICES_PATH}/${invoiceId}`));
    let detail = await fetchDetail();
    if (detail.invoice.status !== "draft") throw liveEditError("الفاتورة مقفلة — أرجعها إلى «معلّقة» أولاً لتعديلها");
    let line = detail.lines.find((item) => Number(item.orderId) === vars.orderId);
    if (!line) {
      // طلب سُلّم بعد إصدار المسودة: زامن الفاتورة مرة واحدة ثم أعد البحث
      await axiosRequest.post(`${INVOICES_PATH}/${invoiceId}/sync`);
      detail = await fetchDetail();
      line = detail.lines.find((item) => Number(item.orderId) === vars.orderId);
    }
    if (!line) throw liveEditError("هذا الطلب غير مضمّن في فاتورة الدورة (مفوتَر في فاتورة أخرى أو محذوف)");
    if (line.state !== "included") throw liveEditError("هذا الطلب غير محسوب في الفاتورة — أعده إليها أولاً من الأرشيف");
    return unwrap(await axiosRequest.patch(`${INVOICES_PATH}/${invoiceId}/lines/${line.id}`, vars.patch));
  });

/** تحديث المسودة: يعيد حساب أرقام النظام للبنود الحالية ويحتفظ بكل التعديلات اليدوية */
export const useRefreshDraft = () =>
  useInvoiceMutation(async (id: number) =>
    unwrap<{ refreshed: number }>(await axiosRequest.post(`${INVOICES_PATH}/${id}/refresh`)));

export const useLineAction = () =>
  useInvoiceMutation(async (vars: { id: number; lineId: number; action: LineAction; reason?: string }) =>
    unwrap(await axiosRequest.post(`${INVOICES_PATH}/${vars.id}/lines/${vars.lineId}/action`, { action: vars.action, reason: vars.reason })));

export const useAddOrderToInvoice = () =>
  useInvoiceMutation(async (vars: { id: number; orderId: number }) =>
    unwrap(await axiosRequest.post(`${INVOICES_PATH}/${vars.id}/lines`, { orderId: vars.orderId })), "اتضاف الطلب للفاتورة");

export function useOrderCandidates(invoiceId: number | null, q: string) {
  return useQuery({
    queryKey: [...financialKeys.invoices(), "candidates", invoiceId, q] as const,
    queryFn: async () => unwrap<Array<{ id: number; code: string | null; orderNumber: string | null }>>(
      await axiosRequest.get(`${INVOICES_PATH}/${invoiceId}/order-candidates?${serializeParams({ q })}`)),
    enabled: invoiceId !== null && q.trim().length >= 2,
  });
}

export const useUploadReceipt = () =>
  useInvoiceMutation(async (vars: { id: number; file: File }) => {
    const form = new FormData();
    form.append("files", vars.file);
    return axiosRequest.post(`${INVOICES_PATH}/${vars.id}/receipt`, form);
  }, "اترفع إيصال التحويل");

export const useRemoveReceipt = () =>
  useInvoiceMutation(async (id: number) => axiosRequest.delete(`${INVOICES_PATH}/${id}/receipt`), "اتشال الإيصال");

export const useRecordReconciliation = () =>
  useInvoiceMutation(async (vars: { bankTotal: number; from?: string; to?: string }) =>
    unwrap<{ count: number; systemTotal: number; bankTotal: number; difference: number }>(
      await axiosRequest.post(`${INVOICES_PATH}/reconciliation`, vars)));

/** الإيصال يُقدَّم عبر endpoint موثّق فقط — نحمّله كـ blob ثم نحفظه/نعرضه */
export async function downloadReceipt(id: number, fileName: string | null): Promise<void> {
  const response = await axiosRequest.get(`${INVOICES_PATH}/${id}/receipt`, { responseType: "blob" });
  downloadBlobResponse(response, fileName || `receipt-${id}`);
}
