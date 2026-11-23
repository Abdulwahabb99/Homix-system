/**
 * إيصالات التحويل لفاتورة «تم التحويل»: قائمة (أيقونة نوع / مصغّرة للصور الصغيرة)، تنزيل، حذف، ورفع أكثر من ملف.
 * البائع يعرض وينزّل إيصالات فاتورته فقط؛ الرفع والحذف للمالية (finance_settle) — والخادم هو الحَكَم.
 * المصغّرات تُحمَّل بالتسلسل وللصور الأصغر من حدّ معقول فقط كي لا تتضخم الذاكرة (الإيصال حتى 16MB).
 */
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  InvoiceReceipt, InvoiceSummary, downloadReceipt, fetchReceiptBlob, useInvoiceReceipts, useRemoveReceipt, useUploadReceipts,
} from "query/financialInvoices";
import {
  RECEIPT_ACCEPT, RECEIPTS_MAX_PER_INVOICE, btnDangerSx, btnGhostSx, btnPrimarySx, cardBoxSx, fmtDateTime, pickReceiptFiles, receiptKindOf,
} from "./shared";

/** مصغّرة لصور حتى هذا الحجم فقط؛ الأكبر تظهر بأيقونة (تُفتح بالتنزيل) */
const THUMB_MAX_BYTES = 3 * 1024 * 1024;

const sizeLabel = (bytes: number | null): string => {
  if (bytes === null) return "";
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

/** يحمّل مصغّرات الصور واحدة بعد الأخرى ويحرّر الروابط عند الإزالة */
function useThumbnails(invoiceId: number, receipts: InvoiceReceipt[]): Record<number, string> {
  const [urls, setUrls] = useState<Record<number, string>>({});
  const created = useRef<string[]>([]);
  const key = receipts.map((r) => `${r.id}:${r.size ?? ""}`).join("|");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const receipt of receipts) {
        if (cancelled) return;
        if (receiptKindOf(receipt.mime, receipt.name) !== "image" || receipt.size === null || receipt.size > THUMB_MAX_BYTES) continue;
        try {
          const blob = await fetchReceiptBlob(invoiceId, receipt.id);
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          created.current.push(url);
          setUrls((prev) => ({ ...prev, [receipt.id]: url }));
        } catch { /* المصغّرة اختيارية: نبقى على الأيقونة */ }
      }
    })();
    return () => { cancelled = true; };
  }, [invoiceId, key]);

  useEffect(() => () => { created.current.forEach((url) => URL.revokeObjectURL(url)); created.current = []; }, [invoiceId]);
  return urls;
}

interface Props {
  invoice: InvoiceSummary;
  staff: boolean;
  /** زر «تنزيل الفاتورة + كل الإيصالات (PDF واحد)» */
  onMerge: () => void;
  mergeBusy: boolean;
}

export default function ReceiptsPanel({ invoice, staff, onMerge, mergeBusy }: Props) {
  const { data: receipts = [], isLoading, isError } = useInvoiceReceipts(invoice.id);
  const upload = useUploadReceipts();
  const remove = useRemoveReceipt();
  const thumbs = useThumbnails(invoice.id, receipts);

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    const { accepted, rejected } = pickReceiptFiles(files, receipts.length);
    if (rejected.length > 0) NotificationMeassage("error", rejected.map((item) => `${item.name}: ${item.reason}`).join(" — "));
    if (accepted.length > 0) upload.mutate({ id: invoice.id, files: accepted });
  };

  const fail = () => NotificationMeassage("error", "تعذّر تحميل الإيصال");

  return (
    <Box sx={{ ...cardBoxSx, p: 1.5, display: "flex", flexDirection: "column", gap: "10px" }} data-testid="receipts-panel">
      <Box sx={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{ fontSize: "12.5px", fontWeight: 800 }}>إيصالات التحويل ({receipts.length})</Box>
        {receipts.length > 0 && (
          <Box component="button" type="button" disabled={mergeBusy} onClick={onMerge} sx={btnGhostSx}>
            {receipts.length > 1 ? "تنزيل الفاتورة + الإيصالات (PDF واحد)" : "تنزيل الفاتورة + الإيصال (PDF واحد)"}
          </Box>
        )}
        {staff && (
          <Box component="label" sx={{ ...btnPrimarySx, cursor: upload.isPending || receipts.length >= RECEIPTS_MAX_PER_INVOICE ? "default" : "pointer", opacity: upload.isPending ? 0.6 : 1, marginInlineStart: "auto" }}>
            {upload.isPending ? "جارٍ الرفع..." : receipts.length > 0 ? "إضافة إيصالات" : "رفع إيصال التحويل"}
            <input type="file" multiple accept={RECEIPT_ACCEPT} hidden disabled={upload.isPending || receipts.length >= RECEIPTS_MAX_PER_INVOICE} onChange={onPick} />
          </Box>
        )}
      </Box>

      {isError ? <Box sx={{ fontSize: 12, color: HX.red }}>تعذّر تحميل الإيصالات.</Box>
        : isLoading ? <Box sx={{ fontSize: 12, color: HX.tx3 }}>جارٍ التحميل...</Box>
        : receipts.length === 0 ? <Box sx={{ fontSize: 12, color: HX.amber }}>لسه مفيش إيصال مرفوع</Box>
        : (
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {receipts.map((receipt, index) => {
              const kind = receiptKindOf(receipt.mime, receipt.name);
              return (
                <Box component="li" key={receipt.id} data-testid="receipt-item" sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", border: `0.5px solid ${HX.border}`, borderRadius: "10px", p: "6px 10px", bgcolor: HX.surface2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "8px", overflow: "hidden", bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {thumbs[receipt.id]
                      ? <img src={thumbs[receipt.id]} alt={receipt.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : kind === "pdf" ? <PictureAsPdfOutlinedIcon sx={{ color: HX.red }} aria-label="PDF" /> : <InsertDriveFileOutlinedIcon sx={{ color: HX.tx3 }} aria-label={kind === "image" ? "صورة" : "ملف"} />}
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                    <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{index + 1}. {receipt.name}</Box>
                    <Box component="span" sx={{ fontSize: "11px", color: HX.tx3 }}>{[fmtDateTime(receipt.uploadedAt), sizeLabel(receipt.size)].filter(Boolean).join(" — ")}</Box>
                  </Box>
                  <Box component="button" type="button" onClick={() => downloadReceipt(invoice.id, receipt.id, receipt.name).catch(fail)} sx={btnGhostSx}>عرض / تحميل</Box>
                  {staff && (
                    <Box component="button" type="button" disabled={remove.isPending}
                      onClick={() => { if (window.confirm(`إزالة الإيصال «${receipt.name}»؟`)) remove.mutate({ id: invoice.id, receiptId: receipt.id }); }} sx={btnDangerSx}>إزالة</Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
    </Box>
  );
}
