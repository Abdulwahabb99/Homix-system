import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";
import {
  SHIPMENT_STATUS_VALUES,
  SHIPMENT_TYPE_VALUES,
  GOVERNORATES_VALUES,
} from "shared/utils/constants";

export interface ShipmentsMetaOption {
  value: string | number;
  label: string;
}

export interface ShipmentsMeta {
  shipmentStatuses: ShipmentsMetaOption[];
  shipmentTypes: ShipmentsMetaOption[];
  paymentStatuses: ShipmentsMetaOption[];
  governorates: ShipmentsMetaOption[];
  deliveryByOptions: ShipmentsMetaOption[];
  vendors: ShipmentsMetaOption[];
  tabCounts: {
    shipments: number;
    returns: number;
    inventory: number;
    accounts: number;
  };
}

const FALLBACK: ShipmentsMeta = {
  shipmentStatuses: SHIPMENT_STATUS_VALUES,
  shipmentTypes: SHIPMENT_TYPE_VALUES,
  paymentStatuses: [
    { value: 1, label: "الدفع عند الاستلام" },
    { value: 2, label: "مدفوع" },
  ],
  governorates: GOVERNORATES_VALUES,
  deliveryByOptions: [],
  vendors: [],
  tabCounts: { shipments: 0, returns: 0, inventory: 0, accounts: 0 },
};

function normalizeMeta(raw: any): ShipmentsMeta {
  if (!raw || typeof raw !== "object") return FALLBACK;

  const pick = (field: string, fallback: ShipmentsMetaOption[]) => {
    const arr = raw[field];
    return Array.isArray(arr) && arr.length > 0 ? arr : fallback;
  };

  return {
    shipmentStatuses: pick("shipmentStatuses", FALLBACK.shipmentStatuses),
    shipmentTypes:    pick("shipmentTypes",    FALLBACK.shipmentTypes),
    paymentStatuses:  pick("paymentStatuses",  FALLBACK.paymentStatuses),
    governorates:     pick("governorates",     FALLBACK.governorates),
    deliveryByOptions: pick("deliveryByOptions", FALLBACK.deliveryByOptions),
    vendors:          pick("vendors",          FALLBACK.vendors),
    tabCounts: {
      shipments: raw.tabCounts?.shipments ?? 0,
      returns:   raw.tabCounts?.returns   ?? 0,
      inventory: raw.tabCounts?.inventory ?? 0,
      accounts:  raw.tabCounts?.accounts  ?? 0,
    },
  };
}

export async function fetchShipmentsMeta(): Promise<ShipmentsMeta> {
  const { data } = await axiosRequest.get("/shipments/meta");
  return normalizeMeta(data?.data);
}

export function useShipmentsMetaQuery() {
  return useQuery({
    queryKey: shipmentKeys.meta(),
    queryFn: fetchShipmentsMeta,
    staleTime: 5 * 60_000,
  });
}
