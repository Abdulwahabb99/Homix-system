import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

export interface InventoryItem {
  id: number;
  image: string | null;
  productCode: string;
  productName: string;
  quantity: number;
  costPrice: number;
  color: string | null;
  size: string | null;
  statusLabel: string;
  vendorName: string;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  page: number;
  size: number;
  totalCount: number;
}

export const INVENTORY_PAGE_SIZE = 20;

export interface InventoryParams {
  page: number;
}

function buildQuery(p: InventoryParams): string {
  return new URLSearchParams({
    page: String(p.page),
    size: String(INVENTORY_PAGE_SIZE),
  }).toString();
}

function normalizeResponse(data: any): InventoryListResponse {
  const raw = data?.data ?? data ?? {};
  return {
    items: Array.isArray(raw.items) ? raw.items : [],
    page:  raw.page ?? 1,
    size:  raw.size ?? INVENTORY_PAGE_SIZE,
    totalCount: raw.totalCount ?? 0,
  };
}

export async function fetchShipmentsInventory(params: InventoryParams): Promise<InventoryListResponse> {
  const { data } = await axiosRequest.get(`/shipments/inventory?${buildQuery(params)}`);
  return normalizeResponse(data);
}

export function useShipmentsInventoryQuery(params: InventoryParams) {
  return useQuery({
    queryKey: shipmentKeys.inventory(JSON.stringify(params)),
    queryFn: () => fetchShipmentsInventory(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
