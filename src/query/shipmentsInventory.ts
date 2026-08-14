import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
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
  /** تُرسَل للـ API — الفلترة محلياً كانت تطبَّق على الصفحة المعروضة فقط */
  productCode?: string;
  status?: string;
  vendorName?: string;
}

function buildQuery(p: InventoryParams): string {
  const query = new URLSearchParams({
    page: String(p.page),
    size: String(INVENTORY_PAGE_SIZE),
  });
  if (p.productCode) query.set("productCode", p.productCode);
  if (p.vendorName)  query.set("vendorName", p.vendorName);
  if (p.status)      query.set("status", p.status);
  return query.toString();
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

/** POST/PUT/DELETE /shipments/inventory — إدارة أصناف المخزون يدوياً. */
export interface InventoryMutationPayload {
  color?: string;
  costPrice: number;
  productCode: string;
  productId: number;
  quantity: number;
  size?: string;
  status?: number;
}

export async function postInventoryItem(body: InventoryMutationPayload): Promise<void> {
  await axiosRequest.post(`/shipments/inventory`, body);
}

export async function putInventoryItem(
  inventoryItemId: number,
  body: Partial<InventoryMutationPayload>
): Promise<void> {
  await axiosRequest.put(`/shipments/inventory/${inventoryItemId}`, body);
}

export async function deleteInventoryItem(inventoryItemId: number): Promise<void> {
  await axiosRequest.delete(`/shipments/inventory/${inventoryItemId}`);
}

export function useCreateInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postInventoryItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.inventoryRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تمت إضافة الصنف للمخزون");
    },
    onError: () => NotificationMeassage("error", "تعذّر إضافة الصنف"),
  });
}

export function useUpdateInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { inventoryItemId: number; body: Partial<InventoryMutationPayload> }) =>
      putInventoryItem(vars.inventoryItemId, vars.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.inventoryRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تحديث الصنف");
    },
    onError: () => NotificationMeassage("error", "تعذّر تحديث الصنف"),
  });
}

export function useDeleteInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.inventoryRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم حذف الصنف");
    },
    onError: () => NotificationMeassage("error", "تعذّر حذف الصنف"),
  });
}
