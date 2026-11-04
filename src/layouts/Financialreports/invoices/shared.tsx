/**
 * عناصر مشتركة لواجهة فواتير الصناع: تنسيق التواريخ، شارة الحالة، غلاف النوافذ، أنماط الحقول.
 */
import React from "react";
import { Box, Dialog, DialogTitle, IconButton } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { InvoiceStatus } from "query/financialInvoices";
import { FONT } from "../utils/styles";

export const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Cairo" }).format(d);
};

export const fmtDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" }).format(d);
};

/** اليوم بتوقيت القاهرة بصيغة YYYY-MM-DD (لنهاية الدورة المرسَلة كمرجع للإصدار) */
export const cairoDay = (iso: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

export const STATUS_META: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "معلّقة", color: HX.tx2, bg: HX.surface3 },
  reviewed: { label: "تمت المراجعة", color: HX.accent, bg: HX.accentLight },
  frozen: { label: "مجمدة", color: HX.blue, bg: HX.blueLight },
  transferred: { label: "تم التحويل", color: "#065f46", bg: HX.greenLight },
};

export function StatusPill({ status, overdue }: { status: InvoiceStatus; overdue?: boolean }) {
  const meta = STATUS_META[status];
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
      <Box component="span" sx={{ px: "10px", py: "2px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, fontFamily: FONT, color: meta.color, bgcolor: meta.bg }}>
        {meta.label}
      </Box>
      {overdue && (
        <Box component="span" sx={{ px: "8px", py: "2px", borderRadius: "20px", fontSize: "10.5px", fontWeight: 700, fontFamily: FONT, color: HX.red, bgcolor: HX.redLight }}>
          متأخرة
        </Box>
      )}
    </Box>
  );
}

export const btnGhostSx = {
  display: "inline-flex", alignItems: "center", gap: "6px", height: 32, px: "12px",
  bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, borderRadius: "9px",
  fontSize: "12px", fontWeight: 600, fontFamily: FONT, color: HX.tx2, cursor: "pointer", transition: ".15s",
  "&:hover:not(:disabled)": { borderColor: HX.accent, color: HX.accent }, "&:disabled": { opacity: 0.5, cursor: "default" }, "& svg": { fontSize: 15 },
} as const;

export const btnPrimarySx = {
  ...btnGhostSx, bgcolor: HX.accent, color: "#fff", border: "none", fontWeight: 700,
  "&:hover:not(:disabled)": { bgcolor: "#5254e0", color: "#fff" },
} as const;

export const btnDangerSx = {
  ...btnGhostSx, color: HX.red, "&:hover:not(:disabled)": { borderColor: HX.red, color: HX.red },
} as const;

export const inputSx = {
  height: 34, px: "10px", border: `0.5px solid ${HX.border2}`, borderRadius: "8px", bgcolor: HX.surface,
  color: HX.tx, fontFamily: FONT, fontSize: "12.5px", "&:focus": { outline: `2px solid ${HX.accentBorder}`, borderColor: HX.accent },
} as const;

export const cardBoxSx = { bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: "14px", overflow: "hidden", fontFamily: FONT } as const;

export const thSx = { fontSize: "11px", fontWeight: 700, color: HX.tx3, textAlign: "start", p: "9px 12px", bgcolor: HX.surface2, borderBottom: `0.5px solid ${HX.border}`, whiteSpace: "nowrap" } as const;
export const tdSx = { fontSize: "12.5px", p: "10px 12px", borderBottom: `0.5px solid ${HX.border}`, color: HX.tx, whiteSpace: "nowrap" } as const;

export function ModalShell({ open, title, onClose, children, actions, maxWidth = "sm" }: {
  open: boolean; title: React.ReactNode; onClose: () => void; children: React.ReactNode; actions?: React.ReactNode; maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <Dialog open={open} onClose={onClose} dir="rtl" fullWidth maxWidth={maxWidth} PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", fontFamily: FONT } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.25, py: 1.75, fontFamily: FONT, fontSize: 14, fontWeight: 800 }}>
        <Box component="span">{title}</Box>
        <IconButton aria-label="إغلاق" onClick={onClose} size="small" sx={{ bgcolor: HX.surface2, width: 26, height: 26, borderRadius: "7px" }}>
          <CloseOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <Box sx={{ borderTop: `0.5px solid ${HX.border}`, p: "16px 18px", maxHeight: "min(720px, calc(100vh - 170px))", overflowY: "auto", fontFamily: FONT }}>{children}</Box>
      {actions && <Box sx={{ borderTop: `0.5px solid ${HX.border}`, px: 2.25, py: 1.5, display: "flex", gap: 1, justifyContent: "flex-start", flexWrap: "wrap" }}>{actions}</Box>}
    </Dialog>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <Box sx={{ py: 5, px: 2.5, textAlign: "center", color: HX.tx3, fontSize: 13, fontFamily: FONT }}>{text}</Box>;
}

/** أسماء أحداث سجل النشاط بالعربية */
export const ACTION_LABELS: Record<string, string> = {
  "invoice.generated": "إصدار فاتورة",
  "invoice.synced": "إضافة طلبات للفاتورة",
  "invoice.reviewed": "تمت المراجعة",
  "invoice.reverted_to_draft": "رجوع لمعلّقة",
  "invoice.frozen": "تجميد فاتورة",
  "invoice.unfrozen": "إلغاء تجميد",
  "invoice.transferred": "تم التحويل",
  "invoice.transfer_reverted": "تراجع عن التحويل",
  "adjustment.added": "إضافة تعديل يدوي",
  "adjustment.removed": "حذف تعديل يدوي",
  "line.overridden": "تعديل رقم طلب",
  "line.added": "إضافة طلب للفاتورة",
  "line.defer": "تحويل طلب للفاتورة الجاية",
  "line.freeze": "تجميد طلب",
  "line.unfreeze": "فك تجميد طلب",
  "line.delete": "حذف طلب نهائيًا",
  "line.restore": "إرجاع طلب للفاتورة",
  "receipt.uploaded": "رفع إيصال تحويل",
  "receipt.removed": "حذف إيصال",
  "reconciliation.recorded": "تسوية بنكية",
};
