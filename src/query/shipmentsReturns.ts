import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { shipmentKeys } from "./keys";

export interface ReturnItem {
  id: number;
  daysCounter: number;
  operationNumber: string;
  orderNumber: string;
  reason: string;
  returnDate: string | null;
  sellerName: string;
  returnType?: number | null;
  returnTypeLabel: string;
  statusLabel: string;
  /** معرّف الحالة — يُستخدم لتعبئة نموذج التعديل. غير مضمون في كل استجابة. */
  status?: number | null;
  /** معرّف الطلب الرقمي — مطلوب في جسم التحديث. غير مضمون في كل استجابة. */
  orderId?: number | null;
}

export interface ReturnsListResponse {
  items: ReturnItem[];
  page: number;
  size: number;
  totalCount: number;
}

export const RETURNS_PAGE_SIZE = 20;

export interface ReturnsParams {
  page: number;
  orderNumber?: string;
  operationCode?: string;
  status?: string;
  sellerName?: string;
}

function buildQuery(p: ReturnsParams): string {
  const q = new URLSearchParams({
    page: String(p.page),
    size: String(RETURNS_PAGE_SIZE),
  });
  if (p.orderNumber)   q.set("orderNumber",   p.orderNumber);
  if (p.operationCode) q.set("operationCode", p.operationCode);
  if (p.status)        q.set("status",        p.status);
  if (p.sellerName)    q.set("sellerName",     p.sellerName);
  return q.toString();
}

function normalizeResponse(data: any): ReturnsListResponse {
  const raw = data?.data ?? data ?? {};
  return {
    items:      Array.isArray(raw.items) ? raw.items : [],
    page:       raw.page ?? 1,
    size:       raw.size ?? RETURNS_PAGE_SIZE,
    totalCount: raw.totalCount ?? 0,
  };
}

export async function fetchVendorReturns(params: ReturnsParams): Promise<ReturnsListResponse> {
  const { data } = await axiosRequest.get(`/shipments/returns/vendor?${buildQuery(params)}`);
  return normalizeResponse(data);
}

export async function fetchCustomerReturns(params: ReturnsParams): Promise<ReturnsListResponse> {
  const { data } = await axiosRequest.get(`/shipments/returns/customer?${buildQuery(params)}`);
  return normalizeResponse(data);
}

export function useVendorReturnsQuery(params: ReturnsParams, enabled = true) {
  return useQuery({
    queryKey: shipmentKeys.returns("vendor", JSON.stringify(params)),
    queryFn:  () => fetchVendorReturns(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCustomerReturnsQuery(params: ReturnsParams, enabled = true) {
  return useQuery({
    queryKey: shipmentKeys.returns("customer", JSON.stringify(params)),
    queryFn:  () => fetchCustomerReturns(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** PUT /shipments/returns/customer/{returnId} — تحديث مرتجع العميل. */
export interface UpdateCustomerReturnPayload {
  orderId?: number;
  reason?: string;
  /** ISO — مثال: "2026-05-18T00:00:00.000Z" */
  returnDate?: string;
  /** أحد معرّفات customerReturnStatuses من /shipments/meta */
  status: number;
}

export async function putCustomerReturn(
  returnId: number | string,
  body: UpdateCustomerReturnPayload
): Promise<void> {
  await axiosRequest.put(`/shipments/returns/customer/${returnId}`, body);
}

export function useUpdateCustomerReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { returnId: number | string; body: UpdateCustomerReturnPayload }) =>
      putCustomerReturn(vars.returnId, vars.body),
    onSuccess: async () => {
      // يشمل قوائم المرتجعات وعدّادات التبويبات في الـ meta
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.returnsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تحديث حالة المرتجع");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء تحديث المرتجع");
    },
  });
}

/** PUT /shipments/returns/vendor/{returnId} — تحديث مرتجع المورد (نفس شكل جسم مرتجع العميل). */
export type UpdateVendorReturnPayload = UpdateCustomerReturnPayload;

export async function putVendorReturn(
  returnId: number | string,
  body: UpdateVendorReturnPayload
): Promise<void> {
  await axiosRequest.put(`/shipments/returns/vendor/${returnId}`, body);
}

export function useUpdateVendorReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { returnId: number | string; body: UpdateVendorReturnPayload }) =>
      putVendorReturn(vars.returnId, vars.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.returnsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تحديث حالة المرتجع");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء تحديث المرتجع");
    },
  });
}
