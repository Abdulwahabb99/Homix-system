import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

export interface ReturnItem {
  id: number;
  daysCounter: number;
  operationNumber: string;
  orderNumber: string;
  reason: string;
  returnDate: string | null;
  sellerName: string;
  returnTypeLabel: string;
  statusLabel: string;
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

export function useVendorReturnsQuery(params: ReturnsParams) {
  return useQuery({
    queryKey: shipmentKeys.returns("vendor", JSON.stringify(params)),
    queryFn:  () => fetchVendorReturns(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCustomerReturnsQuery(params: ReturnsParams) {
  return useQuery({
    queryKey: shipmentKeys.returns("customer", JSON.stringify(params)),
    queryFn:  () => fetchCustomerReturns(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
