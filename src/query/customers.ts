import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";

export interface CustomerListItem {
  address: string;
  createdAt: string;
  email: string;
  firstName: string;
  governorate: string;
  id: number;
  isManual: boolean;
  lastName: string;
  lastOrderDate: string | null;
  ordersCount: number;
  phoneNumber: string;
  totalSpend: number;
}

export interface CustomersSummary {
  topSpender: { name: string; totalSpend: number } | null;
  totalCustomers: number;
  totalSpend: number;
}

export interface CustomerFilters {
  page?: number;
  search?: string;
  size?: number;
  sort?: "recent" | "spend" | "orders";
}

export interface CreateCustomerPayload {
  address?: string;
  email?: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
}

const keys = {
  all: () => ["customers"] as const,
  list: (filtersKey: string) => [...keys.all(), "list", filtersKey] as const,
  summary: () => [...keys.all(), "summary"] as const,
};

const toQuery = (filters: CustomerFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.size) params.set("size", String(filters.size));
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.sort) params.set("sort", filters.sort);
  return params;
};

export function useCustomersQuery(filters: CustomerFilters) {
  const query = toQuery(filters);
  return useQuery<{ items: CustomerListItem[]; page: number; size: number; totalCount: number }>({
    queryKey: keys.list(query.toString()),
    queryFn: async () => (await axiosRequest.get(`/customers?${query}`)).data.data,
  });
}

export function useCustomersSummaryQuery() {
  return useQuery<CustomersSummary>({
    queryKey: keys.summary(),
    queryFn: async () => (await axiosRequest.get("/customers/summary")).data.data,
    staleTime: 60_000,
  });
}

export function useCreateCustomerMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCustomerPayload): Promise<CustomerListItem> =>
      (await axiosRequest.post("/customers", payload)).data.data,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.all() }),
      ]);
    },
  });
}

export async function exportCustomers(filters: Omit<CustomerFilters, "page" | "size">): Promise<void> {
  const query = toQuery(filters);
  const response = await axiosRequest.get(`/customers/export?${query}`, { responseType: "blob" });
  downloadBlobResponse(response, "customers.xlsx");
}
