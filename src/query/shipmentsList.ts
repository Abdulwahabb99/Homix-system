import moment from "moment";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

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
  shipmentStatus?: string;
  shipmentType?: string;
  governorate?: string;
  orderNumber?: string;
  shippingCompany?: string;
  startDate?: any;
  endDate?: any;
}

function buildQuery(p: ShipmentsListParams): string {
  const q = new URLSearchParams({
    page: String(p.page),
    size: String(SHIPMENTS_LIST_PAGE_SIZE),
  });
  if (p.shipmentStatus) q.set("shipmentStatus", p.shipmentStatus);
  if (p.shipmentType)   q.set("shipmentType",   p.shipmentType);
  if (p.governorate)    q.set("governorate",    p.governorate);
  if (p.orderNumber)    q.set("orderNumber",    p.orderNumber);
  if (p.shippingCompany) q.set("shippingCompany", p.shippingCompany);
  if (p.startDate) {
    const d = moment.isMoment(p.startDate)
      ? p.startDate
      : moment.utc(String(p.startDate), "DD-MM-YYYY");
    q.set("shipmentStartDate", d.toISOString());
  }
  if (p.endDate) {
    const d = moment.isMoment(p.endDate)
      ? p.endDate
      : moment.utc(String(p.endDate), "DD-MM-YYYY");
    q.set("shipmentEndDate", d.toISOString());
  }
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
