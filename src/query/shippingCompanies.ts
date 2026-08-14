import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { orderKeys, shipmentKeys } from "./keys";

/** شركة شحن كما تُرجعها /shipments/shipping-companies */
export interface ShippingCompany {
  id: number;
  linkedOrdersCount: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/** GET /shipments/shipping-companies → عناصر { id, name } */
export async function fetchShippingCompanies(): Promise<ShippingCompany[]> {
  const { data } = await axiosRequest.get("/shipments/shipping-companies");
  const items = data?.data?.items;
  return Array.isArray(items) ? (items as ShippingCompany[]) : [];
}

export function useShippingCompaniesQuery(enabled = true) {
  return useQuery({
    queryKey: shipmentKeys.shippingCompanies(),
    queryFn: fetchShippingCompanies,
    staleTime: 60_000,
    enabled,
  });
}

/** POST /shipments/shipping-companies { name } → الشركة المُنشأة (إن أعادها الخادم) */
export async function createShippingCompany(name: string): Promise<ShippingCompany | null> {
  const { data } = await axiosRequest.post("/shipments/shipping-companies", { name });
  const created = data?.data?.item ?? data?.data ?? null;
  return created && typeof created === "object" && created.id != null
    ? (created as ShippingCompany)
    : null;
}

export function useCreateShippingCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createShippingCompany(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.shippingCompanies() });
      NotificationMeassage("success", "تمت إضافة شركة الشحن");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر إضافة شركة الشحن");
    },
  });
}

/** PUT /shipments/shipping-companies/{id} { name } → الشركة بعد التعديل (إن أعادها الخادم) */
export async function updateShippingCompany(
  id: number | string,
  name: string
): Promise<ShippingCompany | null> {
  const { data } = await axiosRequest.put(`/shipments/shipping-companies/${id}`, { name });
  const updated = data?.data?.item ?? data?.data ?? null;
  return updated && typeof updated === "object" && updated.id != null
    ? (updated as ShippingCompany)
    : null;
}

export function useUpdateShippingCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number | string; name: string }) =>
      updateShippingCompany(id, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.shippingCompanies() });
      NotificationMeassage("success", "تم تعديل شركة الشحن");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر تعديل شركة الشحن");
    },
  });
}

export interface DeleteShippingCompanyResponse {
  linkedOrdersCount: number;
  message: string;
}

/** DELETE /shipments/shipping-companies/{id}; linked orders remain, without a shipping company. */
export async function deleteShippingCompany(
  id: number | string
): Promise<DeleteShippingCompanyResponse> {
  const { data } = await axiosRequest.delete(`/shipments/shipping-companies/${id}`);
  return {
    linkedOrdersCount: Number(data?.linkedOrdersCount) || 0,
    message: String(data?.message ?? ""),
  };
}

export function useDeleteShippingCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteShippingCompany(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.shippingCompanies() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
      ]);
      NotificationMeassage("success", "تم حذف شركة الشحن");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر حذف شركة الشحن");
    },
  });
}
