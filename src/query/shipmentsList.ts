import moment from "moment";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

export interface ShipmentSummaryCard {
  key: string;
  label: string;
  value: number | string;
  description?: string;
}

export const SHIPMENTS_LIST_PAGE_SIZE = 20;

export interface ShipmentItem {
  id: number;
  shipmentNumber: string;
  operationNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  sellerName: string;
  governorate: string;
  shipmentStatus: number;
  shipmentStatusLabel: string;
  shipmentType: string;
  shipmentTypeLabel: string;
  paymentStatus: number;
  paymentStatusLabel: string;
  deliveryBy: string;
  amountToCollect: number;
  shippingCost: number;
  receivedInWarehouseDate: string | null;
  scheduledDeliveryDate: string | null;
  deliveryDate: string | null;
  daysCounter: number;
}

export interface ShipmentsListResponse {
  items: ShipmentItem[];
  page: number;
  size: number;
  totalCount: number;
}

export interface ShipmentsListParams {
  page: number;
  operationCode?: string;
  customerName?: string;
  customerPhone?: string;
  shipmentStatus?: string;
  paymentStatus?: string;
  shipmentType?: string;
  deliveryBy?: string;
  vendorName?: string;
  startDate?: any;
  endDate?: any;
  deliveryDateFrom?: any;
  deliveryDateTo?: any;
}

function toDateString(v: any): string | undefined {
  if (!v) return undefined;
  const m = moment.isMoment(v) ? v : moment(String(v), "DD-MM-YYYY");
  return m.isValid() ? m.toISOString() : undefined;
}

function buildQuery(p: ShipmentsListParams): string {
  const q = new URLSearchParams({
    page: String(p.page),
    size: String(SHIPMENTS_LIST_PAGE_SIZE),
  });
  if (p.operationCode)  q.set("operationCode",  p.operationCode);
  if (p.customerName)   q.set("customerName",   p.customerName);
  if (p.customerPhone)  q.set("customerPhone",  p.customerPhone);
  if (p.shipmentStatus) q.set("shipmentStatus", p.shipmentStatus);
  if (p.paymentStatus)  q.set("paymentStatus",  p.paymentStatus);
  if (p.shipmentType)   q.set("shipmentType",   p.shipmentType);
  if (p.deliveryBy)     q.set("deliveryBy",     p.deliveryBy);
  if (p.vendorName)     q.set("vendorName",     p.vendorName);
  const sd = toDateString(p.startDate);
  const ed = toDateString(p.endDate);
  const df = toDateString(p.deliveryDateFrom);
  const dt = toDateString(p.deliveryDateTo);
  if (sd) q.set("startDate",       sd);
  if (ed) q.set("endDate",         ed);
  if (df) q.set("deliveryDateFrom", df);
  if (dt) q.set("deliveryDateTo",   dt);
  return q.toString();
}

export async function fetchShipmentsList(
  params: ShipmentsListParams
): Promise<ShipmentsListResponse> {
  const { data } = await axiosRequest.get(`/shipments?${buildQuery(params)}`);
  return data.data;
}

export function useShipmentsListQuery(params: ShipmentsListParams) {
  return useQuery({
    queryKey: shipmentKeys.list(JSON.stringify(params)),
    queryFn: () => fetchShipmentsList(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export async function fetchShipmentsSummary(
  params: ShipmentsListParams
): Promise<ShipmentSummaryCard[]> {
  const { data } = await axiosRequest.get(`/shipments/summary?${buildQuery(params)}`);
  const cards = data?.data?.cards;
  if (!Array.isArray(cards)) return [];
  return cards.filter(
    (c: any) => c && typeof c === "object" && c.key && c.label
  ) as ShipmentSummaryCard[];
}

export function useShipmentsSummaryQuery(params: ShipmentsListParams) {
  return useQuery({
    queryKey: shipmentKeys.summary(JSON.stringify(params)),
    queryFn: () => fetchShipmentsSummary(params),
    staleTime: 30_000,
  });
}
