import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { orderKeys, shipmentKeys } from "./keys";

export interface ReceiptItem {
  orderId: number;
  operationNumber: string;
  orderNumber: string;
  productName: string;
  productSku: string;
  vendorName: string;
  quantity: number;
  manufactureDate: string | null;
  receivedDate: string | null;
  receiverName: string | null;
  senderName: string | null;
  notes: string | null;
  manufactureDays: number | null;
  documentNumber: string | null;
  documentIssuedAt: string | null;
}
export interface ReceiptDocument {
  number: string;
  issuedAt: string | null;
  items: ReceiptItem[];
}
export interface ReceiptList {
  items: ReceiptItem[];
  totalCount: number;
  page: number;
  size: number;
}
export const receiptError = (error: any): string =>
  error?.response?.data?.message || "تعذّر تنفيذ العملية، حاول مرة أخرى";

export function useReceiptList(
  mode: "received" | "candidates",
  page: number,
  search: string,
  date: string,
  enabled = true
) {
  const query = new URLSearchParams({ page: String(page), search });
  if (date && mode === "received") query.set("date", date);
  return useQuery<ReceiptList>({
    queryKey: shipmentKeys.receipts(`${mode}:${query}`),
    queryFn: async () =>
      (
        await axiosRequest.get(
          `/shipments/receipts${mode === "candidates" ? "/candidates" : ""}?${query}`
        )
      ).data.data,
    enabled,
    staleTime: 0,
  });
}
export async function fetchReceiptDocument(number: string): Promise<ReceiptDocument> {
  return (await axiosRequest.get(`/shipments/receipts/documents/${number}`)).data.data;
}
export function useReceiveItems() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      orderIds: number[];
      receivedDate: string;
      senderName: string;
      notes: string;
    }): Promise<{ orderIds: number[]; receiverName: string }> =>
      (await axiosRequest.post("/shipments/receipts", body)).data.data,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: shipmentKeys.all() }),
        client.invalidateQueries({ queryKey: orderKeys.all() }),
      ]);
    },
  });
}
export function useReceiptDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (orderIds: number[]): Promise<ReceiptDocument> =>
      (await axiosRequest.post("/shipments/receipts/documents", { orderIds })).data.data,
    onSuccess: async () => {
      // Printing re-stamps the document number/date on these orders, which the
      // "received" list and the documents history both display.
      await client.invalidateQueries({ queryKey: shipmentKeys.all() });
    },
  });
}

export function useReceiptDocuments(page: number, search: string, enabled: boolean) {
  return useQuery<{
    items: Array<{ number: string; issuedAt: string; itemCount: number; quantity: number }>;
    totalCount: number;
  }>({
    queryKey: shipmentKeys.receipts(`documents:${page}:${search}`),
    queryFn: async () =>
      (
        await axiosRequest.get(
          `/shipments/receipts/documents?${new URLSearchParams({ page: String(page), search })}`
        )
      ).data.data,
    enabled,
    staleTime: 0,
  });
}
