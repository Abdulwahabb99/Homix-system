import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { orderKeys, shipmentKeys } from "./keys";
import { normalizePrintedDocuments } from "layouts/Shipments/components/receipts/receiptDocuments";

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
  /** يملأها الخادم عند الإصدار؛ بدون مصنع => vendorId = null واسم فارغ */
  vendorId?: number | null;
  vendorName?: string;
  itemCount?: number;
}
/** استجابة إصدار السندات: سند لكل مصنع. الحقول العلوية (number/items…) تظهر فقط عند مصنع واحد. */
export interface PrintedDocuments extends Partial<ReceiptDocument> {
  documents?: ReceiptDocument[];
}
export interface ReceiptList {
  items: ReceiptItem[];
  totalCount: number;
  page: number;
  size: number;
}
export const receiptError = (error: any): string =>
  error?.response?.data?.message || "تعذّر تنفيذ العملية، حاول مرة أخرى";

export interface ReceiptFilters {
  sku?: string;
  operationNumber?: string;
  orderNumber?: string;
  vendorId?: string;
  documentNumber?: string;
  /** issued = طُبع له سند، none = لم يُطبع بعد */
  documentState?: "" | "issued" | "none";
  dateFrom?: string;
  dateTo?: string;
}
const filterQuery = (query: URLSearchParams, date: string, filters: ReceiptFilters) => {
  if (date) query.set("date", date);
  (Object.keys(filters) as Array<keyof ReceiptFilters>).forEach((key) => {
    const value = filters[key]?.trim();
    if (value) query.set(key, value);
  });
  return query;
};

/** The candidates endpoint only understands these four filters. */
const pickCandidateFilters = ({ sku, operationNumber, orderNumber, vendorId }: ReceiptFilters): ReceiptFilters => ({
  sku, operationNumber, orderNumber, vendorId,
});

export function useReceiptList(
  mode: "received" | "candidates",
  page: number,
  search: string,
  date: string,
  enabled = true,
  filters: ReceiptFilters = {}
) {
  const query = new URLSearchParams({ page: String(page), search });
  if (mode === "received") filterQuery(query, date, filters);
  else filterQuery(query, "", pickCandidateFilters(filters));
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
/** Downloads every received row matching the active filters (no pagination). */
export async function exportReceipts(search: string, date: string, filters: ReceiptFilters): Promise<void> {
  const query = filterQuery(new URLSearchParams({ search }), date, filters);
  const response = await axiosRequest.get(`/shipments/receipts/export?${query}`, { responseType: "blob" });
  downloadBlobResponse(response, "receipts.xlsx");
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
/** تعديل ملاحظات الاستلام و/أو تاريخ التصنيع لصنف مستلم (PATCH /shipments/receipts/:orderId) */
export function useUpdateReceipt() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { orderId: number; notes?: string; manufactureDate?: string | null }) => {
      const { orderId, ...body } = vars;
      return (await axiosRequest.patch(`/shipments/receipts/${orderId}`, body)).data.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: shipmentKeys.all() }),
  });
}
export function useCancelReceipt() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => (await axiosRequest.post(`/shipments/receipts/${orderId}/cancel`)).data.data,
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
    mutationFn: async (orderIds: number[]): Promise<ReceiptDocument[]> =>
      normalizePrintedDocuments(
        (await axiosRequest.post("/shipments/receipts/documents", { orderIds })).data.data
      ),
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

export interface ReceiptVendor {
  id: number;
  name: string;
}
/** All factories for the receipts filters — gated by receipts permission only (not `vendors_view`). */
export function useReceiptVendors() {
  return useQuery<ReceiptVendor[]>({
    queryKey: shipmentKeys.receiptVendors(),
    queryFn: async () => (await axiosRequest.get("/shipments/receipts/vendors")).data.data,
    staleTime: 60_000,
  });
}
