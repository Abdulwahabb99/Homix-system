import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

export interface ShipmentDetailCustomer {
  address: string;
  name: string;
  phoneNumber: string;
}

export interface ShipmentDetailFinancial {
  amountToCollect: number;
  shippingCost: number;
  totalPrice: number;
}

export interface ShipmentDetailNote {
  id: number;
  createdAt: string;
  text: string;
  userName: string;
}

export interface ShipmentDetailProduct {
  color: string | null;
  image: string | null;
  price: number;
  productCode: string;
  productName: string;
  quantity: number;
  size: string | null;
  vendorName: string;
}

export interface ShipmentDetailInfo {
  amountToCollect: number;
  customerName: string;
  customerPhone: string;
  daysCounter: number;
  deliveryBy: string;
  deliveryDate: string | null;
  governorate: string;
  id: number;
  operationNumber: string;
  orderNumber: string;
  paymentStatus: number;
  paymentStatusLabel: string;
  receivedInWarehouseDate: string | null;
  scheduledDeliveryDate: string | null;
  sellerName: string;
  shipmentNumber: string;
  shipmentStatus: number;
  shipmentStatusLabel: string;
  scheduleStatus?: number;
  scheduleStatusLabel?: string;
  shipmentType: string;
  shipmentTypeLabel: string;
  shippingCost: number;
  shippingCompany: string;
}

export interface ShipmentDetailTimelineEvent {
  id: number;
  changedAt: string;
  message: string;
  userName: string;
}

export interface ShipmentDetailVendor {
  name: string;
}

export interface ShipmentDetailData {
  customer: ShipmentDetailCustomer;
  financial: ShipmentDetailFinancial;
  notes: ShipmentDetailNote[];
  products: ShipmentDetailProduct[];
  shipment: ShipmentDetailInfo;
  timeline: ShipmentDetailTimelineEvent[];
  vendor: ShipmentDetailVendor;
}

export async function fetchShipmentDetail(shipmentId: string): Promise<ShipmentDetailData> {
  const { data } = await axiosRequest.get(`/shipments/${shipmentId}`);
  return data.data;
}

export function useShipmentDetailQuery(shipmentId: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(shipmentId),
    queryFn: () => fetchShipmentDetail(shipmentId),
    enabled: !!shipmentId,
    staleTime: 30_000,
  });
}
