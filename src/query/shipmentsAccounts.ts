import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

export interface DeliveryAccountItem {
  id: number;
  operationNumber: string;
  orderNumber: string;
  sellerName: string;
  productCode: string;
  deliveryBy: string;
  deliveryDate: string | null;
  paymentMethodLabel: string;
  amountToCollect: number;
  shippingCost: number;
  accountingStatusLabel: string;
  accountingDate: string | null;
  reference: string | null;
}

export interface ExpenseItem {
  id: number;
  accountingDate: string | null;
  accountingStatusLabel: string;
  amount: number;
  reason: string;
  typeLabel: string;
}

export const ACCOUNTS_PAGE_SIZE = 20;

export interface AccountsParams {
  page: number;
}

function buildQuery(p: AccountsParams): string {
  return new URLSearchParams({
    page: String(p.page),
    size: String(ACCOUNTS_PAGE_SIZE),
  }).toString();
}

function normalizeList<T>(data: any): { items: T[]; page: number; size: number; totalCount: number } {
  const raw = data?.data ?? data ?? {};
  return {
    items: Array.isArray(raw.items) ? raw.items : [],
    page:  raw.page ?? 1,
    size:  raw.size ?? ACCOUNTS_PAGE_SIZE,
    totalCount: raw.totalCount ?? 0,
  };
}

export async function fetchDeliveryAccounts(params: AccountsParams) {
  const { data } = await axiosRequest.get(`/shipments/accounts/deliveries?${buildQuery(params)}`);
  return normalizeList<DeliveryAccountItem>(data);
}

export async function fetchExpenseAccounts(params: AccountsParams) {
  const { data } = await axiosRequest.get(`/shipments/accounts/expenses?${buildQuery(params)}`);
  return normalizeList<ExpenseItem>(data);
}

export function useDeliveryAccountsQuery(params: AccountsParams) {
  return useQuery({
    queryKey: shipmentKeys.accounts("deliveries", JSON.stringify(params)),
    queryFn: () => fetchDeliveryAccounts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useExpenseAccountsQuery(params: AccountsParams) {
  return useQuery({
    queryKey: shipmentKeys.accounts("expenses", JSON.stringify(params)),
    queryFn: () => fetchExpenseAccounts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
