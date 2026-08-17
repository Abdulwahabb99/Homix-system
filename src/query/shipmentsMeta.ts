import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";
import { SHIPMENT_STATUS_VALUES, SHIPMENT_TYPE_VALUES } from "shared/utils/constants";

export interface ShipmentsMetaOption {
  value: string | number;
  label: string;
}

export interface ShipmentsTabCount {
  id: string;
  label: string;
  count?: number;
}

export interface ShipmentsMeta {
  assignees: ShipmentsMetaOption[];
  shipmentStatuses: ShipmentsMetaOption[];
  shipmentTypes: ShipmentsMetaOption[];
  paymentStatuses: ShipmentsMetaOption[];
  governorates: ShipmentsMetaOption[];
  deliveryByOptions: ShipmentsMetaOption[];
  shippingCompanies: ShipmentsMetaOption[];
  accountingStatuses: ShipmentsMetaOption[];
  vendorReturnStatuses: ShipmentsMetaOption[];
  customerReturnStatuses: ShipmentsMetaOption[];
  inventoryStatuses: ShipmentsMetaOption[];
  expenseTypes: ShipmentsMetaOption[];
  scheduleStatuses: ShipmentsMetaOption[];
  subTabCounts: {
    accountDeliveries: number;
    accountExpenses: number;
    customerReturns: number;
    vendorReturns: number;
  };
  tabs: ShipmentsTabCount[];
}

function toOptions(arr: any[]): ShipmentsMetaOption[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({ value: item.id, label: item.label }));
}

function normalizeMeta(raw: any): ShipmentsMeta {
  if (!raw || typeof raw !== "object") return FALLBACK;

  const pick = (field: string, fallback: ShipmentsMetaOption[]) => {
    const arr = raw[field];
    const opts = toOptions(arr);
    return opts.length > 0 ? opts : fallback;
  };

  return {
    assignees:              pick("assignees",              []),
    shipmentStatuses:       pick("shipmentStatuses",       SHIPMENT_STATUS_VALUES),
    shipmentTypes:          pick("shipmentTypes",          SHIPMENT_TYPE_VALUES),
    paymentStatuses:        pick("paymentStatuses",        FALLBACK.paymentStatuses),
    governorates:           pick("governorates",           FALLBACK.governorates),
    deliveryByOptions:      pick("deliveryByOptions",      []),
    shippingCompanies:      pick("shippingCompanies",      []),
    accountingStatuses:     pick("accountingStatuses",     []),
    vendorReturnStatuses:   pick("vendorReturnStatuses",   []),
    customerReturnStatuses: pick("customerReturnStatuses", []),
    inventoryStatuses:      pick("inventoryStatuses",      []),
    expenseTypes:           pick("expenseTypes",           []),
    scheduleStatuses:       pick("scheduleStatuses",       []),
    subTabCounts: {
      accountDeliveries: Number(raw.subTabCounts?.accountDeliveries) || 0,
      accountExpenses: Number(raw.subTabCounts?.accountExpenses) || 0,
      customerReturns: Number(raw.subTabCounts?.customerReturns) || 0,
      vendorReturns: Number(raw.subTabCounts?.vendorReturns) || 0,
    },
    tabs: Array.isArray(raw.tabs) ? raw.tabs : [],
  };
}

const FALLBACK: ShipmentsMeta = {
  assignees: [],
  shipmentStatuses: SHIPMENT_STATUS_VALUES,
  shipmentTypes: SHIPMENT_TYPE_VALUES,
  paymentStatuses: [
    { value: 1, label: "الدفع عند الاستلام" },
    { value: 2, label: "مدفوع" },
  ],
  governorates: [],
  deliveryByOptions: [],
  shippingCompanies: [],
  accountingStatuses: [],
  vendorReturnStatuses: [],
  customerReturnStatuses: [],
  inventoryStatuses: [],
  expenseTypes: [],
  scheduleStatuses: [],
  subTabCounts: {
    accountDeliveries: 0,
    accountExpenses: 0,
    customerReturns: 0,
    vendorReturns: 0,
  },
  tabs: [],
};

export async function fetchShipmentsMeta(): Promise<ShipmentsMeta> {
  const { data } = await axiosRequest.get("/shipments/meta");
  return normalizeMeta(data?.data);
}

export function useShipmentsMetaQuery() {
  return useQuery({
    queryKey: shipmentKeys.meta(),
    queryFn: fetchShipmentsMeta,
    gcTime: 0,
    refetchOnMount: "always",
    staleTime: 0,
  });
}
