import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

/** صنف ضمن مجموعة التوصيل المجمع (GET /shipments/:id/grouped-items) */
export interface GroupedShipmentItem {
  id: number;
  operationNumber: string;
  orderNumber: string;
  productName: string;
  productSku: string;
  sellerName: string;
  shipmentStatusLabel: string;
  inWarehouse: boolean;
  current: boolean;
}

export function useGroupedItems(shipmentId: number | undefined) {
  return useQuery({
    queryKey: shipmentKeys.grouped(shipmentId ?? 0),
    enabled: Boolean(shipmentId),
    staleTime: 0,
    queryFn: async (): Promise<GroupedShipmentItem[]> =>
      (await axiosRequest.get(`/shipments/${shipmentId}/grouped-items`)).data?.data ?? [],
  });
}
