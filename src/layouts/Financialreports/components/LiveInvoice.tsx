/**
 * ربط التقرير الحي بفواتير الدورة: سياق مشترك (حالة الدورة/الصلاحيات/فتح الفاتورة/حفظ التعديل)
 * + شارة حالة الفاتورة لكل صانع. التبويبات الثلاثة تقرأ السياق بدل تمرير خصائص كثيرة.
 */
import React, { createContext, useContext } from "react";
import { Box } from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useRefreshDraft, useReviewLive } from "query/financialInvoices";
import type { LiveLineEditVars } from "query/financialInvoices";
import { FONT } from "../utils/styles";
import type { LiveEditContext } from "../utils/liveOverlay";
import type { BillingDay, SettlementSeller } from "../utils/types";
import { STATUS_META } from "../invoices/shared";
import { liveInvoiceChipMeta, reviewButtonState, REVIEW_LABEL, type LiveChipTone } from "../utils/liveReview";

const TONE_COLORS: Record<LiveChipTone, { color: string; bg: string }> = {
  pending: { color: HX.tx2, bg: HX.surface3 },
  reviewed: STATUS_META.reviewed,
  frozen: STATUS_META.frozen,
  transferred: STATUS_META.transferred,
};

export interface LiveInvoiceContextValue extends LiveEditContext {
  billingDay: BillingDay;
  /** يوم نهاية الدورة (YYYY-MM-DD القاهرة) — null خارج دورات الفوترة */
  cycleEndDay: string | null;
  /** الدورة لم تنتهِ بعد: مسودات قابلة للتعديل لكن المراجعة محجوبة */
  cycleOpen: boolean;
  /** يوجد تعديل قيد الحفظ — نمنع تعديلاً ثانياً بالتوازي */
  saving: boolean;
  openInvoice: (invoiceId: number) => void;
  saveLine: (vars: Omit<LiveLineEditVars, "billingDay" | "cycleEndDay">) => void;
}

/** الافتراضي = بلا ميزات حية (فترة مخصصة، قراءة فقط) — يبقي المكوّنات صالحة خارج الصفحة */
const DEFAULT_VALUE: LiveInvoiceContextValue = {
  billingDay: 13,
  canSettle: false,
  cycleEndDay: null,
  cycleOpen: false,
  cycleState: "custom",
  invoicesState: "idle",
  isVendor: false,
  openInvoice: () => undefined,
  saveLine: () => undefined,
  saving: false,
};

const LiveInvoiceContext = createContext<LiveInvoiceContextValue>(DEFAULT_VALUE);
export const LiveInvoiceProvider = LiveInvoiceContext.Provider;
export const useLiveInvoice = () => useContext(LiveInvoiceContext);

const chipSx = (color: string, bg: string, dashed = false) => ({
  display: "inline-flex", alignItems: "center", px: "9px", py: "1px", borderRadius: "20px", fontSize: "10.5px", fontWeight: 700,
  fontFamily: FONT, color, bgcolor: bg, border: dashed ? `1px dashed ${HX.border2}` : "1px solid transparent", whiteSpace: "nowrap",
} as const);

/** شارة حالة فاتورة الصانع للدورة المعروضة — تضغط فتفتح الفاتورة */
export default function LiveInvoiceChip({ seller }: { seller: SettlementSeller }) {
  const { cycleOpen, cycleState, invoicesState, openInvoice } = useLiveInvoice();
  if (cycleState === "custom") return null;
  if (invoicesState === "loading") return <Box component="span" sx={chipSx(HX.tx3, HX.surface2, true)}>جارٍ التحميل...</Box>;
  if (invoicesState === "error") return <Box component="span" sx={chipSx(HX.red, HX.redLight, true)} title="تعذّر تحميل حالة الفواتير">الحالة غير متاحة</Box>;
  const invoice = seller.invoice;
  const chip = liveInvoiceChipMeta(invoice?.status);
  const tone = TONE_COLORS[chip.tone];
  if (!invoice) return <Box component="span" sx={chipSx(tone.color, tone.bg, true)} title={chip.tooltip}>{chip.label}</Box>;
  return (
    <Box component="button" type="button" title={chip.tooltip || `فتح الفاتورة${invoice.code ? ` ${invoice.code}` : ""}`}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); openInvoice(invoice.id); }}
      sx={{ ...chipSx(tone.color, tone.bg), cursor: "pointer", "&:hover": { borderColor: tone.color }, "&:focus-visible": { outline: `2px solid ${HX.accent}`, outlineOffset: 2 } }}>
      {chip.label}
      {cycleOpen && invoice.status === "draft" && <Box component="span" sx={{ marginInlineStart: "6px", fontWeight: 600, opacity: 0.8 }}>• دورة جارية</Box>}
    </Box>
  );
}

/** زر «تمت المراجعة» الأساسي: يُنشئ المسودة ويراجعها بخطوة واحدة؛ معطّل أثناء الدورة الجارية؛ لا يظهر للبائع */
export function LiveReviewButton({ seller }: { seller: SettlementSeller }) {
  const { billingDay, canSettle, cycleEndDay, cycleOpen, cycleState, invoicesState, isVendor } = useLiveInvoice();
  const review = useReviewLive();
  const state = reviewButtonState({ canSettle, cycleOpen, cycleState, invoiceStatus: seller.invoice?.status, invoicesState, isVendor });
  const vendorId = Number(seller.row.vendorId);
  if (!state.visible || !cycleEndDay || !vendorId) return null;
  const disabled = state.disabled || review.isPending;
  return (
    <Box component="button" type="button" disabled={disabled} title={state.tooltip || "يُصدر الفاتورة ويراجعها (تُقفل الأرقام بعدها)"}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        review.mutate({ billingDay, referenceDate: cycleEndDay, vendorId });
      }}
      sx={{ ...chipSx("#fff", HX.accent), cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, border: "none", "&:hover": { filter: disabled ? "none" : "brightness(.95)" } }}>
      {review.isPending ? "جارٍ المراجعة..." : REVIEW_LABEL}
    </Box>
  );
}

/** شارة الحالة + زر «تحديث المسودة» (للمسودات فقط، يدوي، لا يعمل تلقائياً) في ترويسة تفاصيل الصانع */
export function LiveInvoiceHeaderStatus({ seller }: { seller: SettlementSeller }) {
  const { canSettle, isVendor, cycleState } = useLiveInvoice();
  const refresh = useRefreshDraft();
  const invoice = seller.invoice;
  const canRefresh = canSettle && !isVendor && cycleState === "billing" && invoice?.status === "draft";
  return (
    <>
      <LiveInvoiceChip seller={seller} />
      <LiveReviewButton seller={seller} />
      {canRefresh && invoice && (
        <Box component="button" type="button" disabled={refresh.isPending} title="يعيد حساب أرقام النظام ويحتفظ بتعديلاتك اليدوية"
          onClick={() => {
            if (!window.confirm("تحديث المسودة بأحدث أرقام النظام؟ تعديلاتك اليدوية وحالات الطلبات والتعديلات على الفاتورة ستبقى كما هي.")) return;
            refresh.mutate(invoice.id, { onSuccess: (r) => NotificationMeassage("success", r.refreshed ? `تم تحديث ${r.refreshed} طلب` : "الأرقام محدّثة بالفعل") });
          }}
          sx={{ ...chipSx(HX.accent, HX.accentLight), cursor: "pointer", opacity: refresh.isPending ? 0.6 : 1 }}>
          تحديث المسودة
        </Box>
      )}
    </>
  );
}
