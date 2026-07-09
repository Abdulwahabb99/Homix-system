import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { shipmentKeys } from "./keys";

/** شركة شحن كما تُرجعها /shipments/shipping-companies */
export interface ShippingCompany {
  id: number;
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
