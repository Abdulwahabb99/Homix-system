import type { PrintedDocuments, ReceiptDocument } from "query/shipmentReceipts";

export const NO_VENDOR_LABEL = "بدون مصنع";

/** يدعم الاستجابة الجديدة (documents[]) والقديمة (سند واحد في الحقول العلوية). */
export function normalizePrintedDocuments(data: PrintedDocuments | null | undefined): ReceiptDocument[] {
  if (!data) return [];
  if (Array.isArray(data.documents) && data.documents.length) return data.documents;
  if (data.number && data.items) return [data as ReceiptDocument];
  return [];
}

export const documentVendorLabel = (document: ReceiptDocument): string => {
  const fromItems = [...new Set(document.items.map((item) => item.vendorName).filter(Boolean))].join("، ");
  return document.vendorName || fromItems || NO_VENDOR_LABEL;
};

export const documentItemCount = (document: ReceiptDocument): number =>
  document.itemCount ?? document.items.length;
