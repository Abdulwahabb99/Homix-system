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

export type InvoiceStatus = "draft" | "reviewed" | "frozen" | "transferred" | "consolidated" | "cancelled";
/** standard = فاتورة دورة عادية، consolidated = «فاتورة شاملة» تضم فواتير مفتوحة لنفس الصانع */
export type InvoiceKind = "standard" | "consolidated";
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
  /** الصافي الموقّع = مستحق البائع − مستحق هوميكس − الغرامات (+ تعديلات): > 0 مستحق للبائع، < 0 مستحق لهوميكس، 0 لا مستحقات */
  netAmount: number;
  /** المبلغ المعروض: مبلغ التحويل الفعلي إن حُوّلت وإلا |الصافي| */
  amount: number;
  /** يُشتق من إشارة الصافي: null = الصافي صفر */
  dueParty: "vendor" | "homix" | null;
  reviewedAt: string | null;
  frozenAt: string | null;
  transferredAt: string | null;
  transferAmount: number | null;
  daysCounter: number | null;
  isOverdue: boolean;
  overdueDays: number;
  hasReceipt: boolean;
  /** عدد إيصالات التحويل (أكثر من إيصال للفاتورة) */
  receiptsCount?: number;
  receiptName: string | null;
  receiptUploadedAt: string | null;
  createdAt: string | null;
  kind?: InvoiceKind;
  /** يمكن دمجها الآن في فاتورة شاملة (الخادم يعيد التحقق تحت قفل) */
  mergeable?: boolean;
  /** للفاتورة المدمجة: الفاتورة الشاملة التي ضُمّت إليها */
  mergedIntoId?: number | null;
  mergedCode?: string | null;
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
  /** صافي البند الموقّع = مستحق البائع − مستحق هوميكس (تسليمات البائع) − الغرامات */
  netAmount?: number;
  /** حقول التعديل لا تصل إلى البائع إطلاقاً (undefined) — اختبرها بـ `!= null` */
  finesOverride?: number | null;
  vendorDueOverride?: number | null;
  companyDueOverride?: number | null;
  warehouseCostOverride?: number | null;
  collectionOverride?: number | null;
  /** شحن البائع المعدّل على الفاتورة (استبدال لقيمة النظام) */
  vendorShippingCostOverride?: number | null;
  /** نوع المستحق لهوميكس: margin (تسليم المخزن) أو vendorOwes (تسليم البائع) */
  companyDueKind?: "margin" | "vendorOwes";
  /** القيم الأصلية قبل التعديل — لا تصل إلى البائع */
  originalWarehouseCost?: number;
  originalCollection?: number;
  originalFines?: number;
  originalVendorShippingCost?: number;
  originalVendorDue?: number;
  originalCompanyDue?: number;
  overrideReason?: string | null;
  state: LineState;
  stateReason?: string | null;
  /** في الفاتورة الشاملة: الفاتورة الأصلية التي جاء منها البند */
  sourceInvoiceId?: number | null;
}

export interface InvoiceAdjustment {
  id: number;
  label: string;
  kind: "addition" | "deduction";
  amount: number;
  removedAt: string | null;
  createdAt: string | null;
}

/** بيانات حساب البائع (للموظف finance_settle وللبائع نفسه فقط) */
export interface VendorBank {
  bankName: string | null;
  accountHolder: string | null;
  accountNumber: string | null;
  walletNumber: string | null;
  instaPayNumber: string | null;
}

/** فاتورة مجمّعة داخل فاتورة شاملة: الدورة/الشهر/الصافي لكلٍّ منها وقت الدمج */
export interface MergedSource {
  id: number;
  code: string | null;
  billingDay: number;
  periodStart: string | null;
  periodEnd: string | null;
  /** YYYY-MM بتوقيت القاهرة */
  month: string;
  netAmount: number;
  dueParty: "vendor" | "homix" | null;
  ordersCount: number;
  /** حالتها قبل الدمج (وإليها تعود عند فك الدمج) */
  status: InvoiceStatus;
}

export interface InvoiceDetail {
  invoice: InvoiceSummary;
  /** للفاتورة الشاملة فقط */
  sources?: MergedSource[];
  lines: InvoiceLine[];
  adjustments: InvoiceAdjustment[];
  /** undefined = غير مسموح لهذا المستخدم، null = لم تُسجَّل بيانات بنكية */
  vendorBank?: VendorBank | null;
}

export interface InvoiceListParams {
  status?: InvoiceStatus[];
  vendorId?: number;
  search?: string;
  invoiceCode?: string;
  billingDay?: number;
  /** consolidated = «الفواتير الشاملة» فقط */
  kind?: InvoiceKind;
  invoiceFrom?: string;
  invoiceTo?: string;
  transferredFrom?: string;
  transferredTo?: string;
  /** غياب القيمة (أو "both") = بلا فلتر اتجاه */
  dueParty?: "vendor" | "homix" | "both";
  /** شهر نهاية الدورة بتوقيت القاهرة YYYY-MM */
  month?: string;
  receipt?: "uploaded" | "missing";
  overdue?: boolean;
  page?: number;
  size?: number;
}

export interface InvoiceListResult {
  items: InvoiceSummary[];
  counts: Partial<Record<InvoiceStatus, number>>;
  /** أعداد الحالات تحت كل الفلاتر عدا الحالة/الشاملة (أعداد الشرائح) */
  filteredCounts?: Partial<Record<InvoiceStatus, number>>;
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
  mergedCode?: string | null;
  mergedIntoId?: number | null;
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

export interface InvoiceMonth { month: string; count: number }

/** شهور (بتوقيت القاهرة) التي بها فواتير في الأرشيف */
export function useInvoiceMonths() {
  return useQuery({
    queryKey: financialKeys.invoiceMonths(),
    queryFn: async () => unwrap<InvoiceMonth[]>(await axiosRequest.get(`${INVOICES_PATH}/months`)),
    staleTime: 60 * 1000,
  });
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

/** مراجعة صانع واحد من التقرير الحي: يُنشئ/يعيد استخدام المسودة ثم يراجعها في معاملة واحدة */
export const useReviewLive = () =>
  useInvoiceMutation(async (vars: { billingDay: 13 | 28; referenceDate: string; vendorId: number }) =>
    unwrap<{ alreadyReviewed: boolean; invoice: InvoiceSummary; vendorId: number }>(
      await axiosRequest.post(`${INVOICES_PATH}/review-live`, vars)), "تمت مراجعة الفاتورة");

/** مراجعة كل صنّاع الدورة (نتيجة لكل صانع؛ الفشل الجزئي لا يوقف الباقي) */
export const useReviewLiveAll = () =>
  useInvoiceMutation(async (vars: { billingDay: 13 | 28; referenceDate: string }) =>
    unwrap<{ failed: number; succeeded: number; results: Array<{ vendorId: number; ok: boolean; invoiceId?: number; alreadyReviewed?: boolean; error?: string }> }>(
      await axiosRequest.post(`${INVOICES_PATH}/review-live-all`, vars)));

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
  vendorShippingCostOverride?: number | null;
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

/** مسودة (صانع + دورة) تُحدَّد من الصف الحي — الخادم ينشئ المسودة أولاً إن لم توجد ثم يطبّق الإجراء في معاملة واحدة */
export interface LiveDraftTarget {
  vendorId: number;
  billingDay: 13 | 28;
  /** يوم نهاية الدورة (YYYY-MM-DD بتوقيت القاهرة) */
  cycleEndDay: string;
}

export const liveDraftPayload = (target: LiveDraftTarget) => ({
  billingDay: target.billingDay, referenceDate: target.cycleEndDay, vendorId: target.vendorId,
});

/** تجميد / فك تجميد / تحويل لدورة أخرى / حذف / إرجاع لطلب من الصف الحي (يُنشئ المسودة تلقائياً) */
export const useLiveLineAction = () =>
  useInvoiceMutation(async (vars: LiveDraftTarget & { orderId: number; action: LineAction; reason?: string }) =>
    unwrap<{ state: LineState; netAmount: number; created: boolean; invoiceId: number }>(
      await axiosRequest.post(`${INVOICES_PATH}/live/line-action`, { ...liveDraftPayload(vars), orderId: vars.orderId, action: vars.action, reason: vars.reason })));

/** «إضافة طلب» من قسم الصانع الحي (يُنشئ المسودة تلقائياً) */
export const useLiveAddOrder = () =>
  useInvoiceMutation(async (vars: LiveDraftTarget & { orderId: number }) =>
    unwrap<{ netAmount: number; created: boolean; invoiceId: number; alreadyIncluded: boolean }>(
      await axiosRequest.post(`${INVOICES_PATH}/live/lines`, { ...liveDraftPayload(vars), orderId: vars.orderId })));

/** نتيجة بحث «إضافة طلب»: كل طلب للصانع مع حكم الإتاحة من الخادم */
export interface OrderCandidate {
  id: number;
  code: string | null;
  orderNumber: string | null;
  status: number;
  available: boolean;
  reason?: "already_invoiced" | "order_not_delivered" | "shipment_not_delivered";
  /** الفاتورة التي تحجز الطلب (reason = already_invoiced) */
  invoice?: { id: number; code: string | null; status: string; periodEnd: string | null; lineState: string };
}

/** منتقي الطلبات للصف الحي: يبحث بالصانع (لا يحتاج فاتورة موجودة) */
export function useLiveOrderCandidates(vendorId: number | null, q: string) {
  return useQuery({
    queryKey: [...financialKeys.invoices(), "live-candidates", vendorId, q] as const,
    queryFn: async () => unwrap<OrderCandidate[]>(
      await axiosRequest.get(`${INVOICES_PATH}/live/order-candidates?${serializeParams({ q, vendorId })}`)),
    enabled: vendorId !== null && q.trim().length >= 2,
  });
}

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
    queryFn: async () => unwrap<OrderCandidate[]>(
      await axiosRequest.get(`${INVOICES_PATH}/${invoiceId}/order-candidates?${serializeParams({ q })}`)),
    enabled: invoiceId !== null && q.trim().length >= 2,
  });
}

/** إيصال تحويل (يمكن أكثر من إيصال للفاتورة؛ id = 0 يعني الإيصال القديم الوحيد قبل الترحيل) */
export interface InvoiceReceipt {
  id: number;
  name: string;
  mime: string;
  size: number | null;
  uploadedAt: string | null;
  /** للموظفين فقط */
  uploadedBy?: number | null;
}

export function useInvoiceReceipts(invoiceId: number | null, enabled = true) {
  return useQuery({
    queryKey: financialKeys.invoiceReceipts(invoiceId ?? 0),
    queryFn: async () => unwrap<InvoiceReceipt[]>(await axiosRequest.get(`${INVOICES_PATH}/${invoiceId}/receipts`)),
    enabled: enabled && invoiceId !== null,
  });
}

/** رفع إيصال أو أكثر (حقل `files` المتكرر) */
export const useUploadReceipts = () =>
  useInvoiceMutation(async (vars: { id: number; files: File[] }) => {
    const form = new FormData();
    vars.files.forEach((file) => form.append("files", file));
    return axiosRequest.post(`${INVOICES_PATH}/${vars.id}/receipts`, form);
  }, "اترفعت الإيصالات");

export const useRemoveReceipt = () =>
  useInvoiceMutation(async (vars: { id: number; receiptId: number }) => axiosRequest.delete(`${INVOICES_PATH}/${vars.id}/receipts/${vars.receiptId}`), "اتشال الإيصال");

/** دمج فواتير مفتوحة (معلّقة/تمت المراجعة) لنفس الصانع في «فاتورة شاملة» */
export const useConsolidateInvoices = () =>
  useInvoiceMutation(async (vars: { invoiceIds: number[] }) =>
    unwrap<{ invoice: InvoiceSummary; sources: MergedSource[] }>(await axiosRequest.post(`${INVOICES_PATH}/consolidate`, vars)), "تم دمج الفواتير في فاتورة شاملة");

export const useUnconsolidateInvoice = () =>
  useInvoiceMutation(async (id: number) =>
    unwrap<{ cancelledId: number }>(await axiosRequest.post(`${INVOICES_PATH}/${id}/unconsolidate`)), "تم فك الدمج وأُعيدت الفواتير كما كانت");

export const useRecordReconciliation = () =>
  useInvoiceMutation(async (vars: { bankTotal: number; from?: string; to?: string }) =>
    unwrap<{ count: number; systemTotal: number; bankTotal: number; difference: number }>(
      await axiosRequest.post(`${INVOICES_PATH}/reconciliation`, vars)));

/** الإيصال يُقدَّم عبر endpoint موثّق فقط — نجلبه كـ blob (للتنزيل أو للدمج في PDF أو للمصغّرة) */
export async function fetchReceiptBlob(id: number, receiptId: number): Promise<Blob> {
  const response = await axiosRequest.get(`${INVOICES_PATH}/${id}/receipts/${receiptId}`, { responseType: "blob" });
  return response.data as Blob;
}

export async function downloadReceipt(id: number, receiptId: number, fileName: string | null): Promise<void> {
  const response = await axiosRequest.get(`${INVOICES_PATH}/${id}/receipts/${receiptId}`, { responseType: "blob" });
  downloadBlobResponse(response, fileName || `receipt-${id}-${receiptId}`);
}

/** الإيصال الأول (للأرشيف: زر «عرض» السريع) — يقرأ القائمة ثم ينزّل الأول */
export async function downloadFirstReceipt(id: number): Promise<void> {
  const list = unwrap<InvoiceReceipt[]>(await axiosRequest.get(`${INVOICES_PATH}/${id}/receipts`));
  if (!list.length) throw new Error("no receipt");
  await downloadReceipt(id, list[0].id, list[0].name);
}
