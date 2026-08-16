import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";
import { formatMoney } from "../utils";
import type { OrderTotals } from "../types";
import SectionCard from "./SectionCard";

export interface OrderSummarySidebarProps {
  totals: OrderTotals;
  itemsCount: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function Row({ label, value, accent, strong }: { label: string; value: string; accent?: boolean; strong?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: "9px", borderBottom: `0.5px solid ${HX.border}`, "&:last-of-type": { borderBottom: "none" } }}>
      <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2 }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: strong ? "14px" : "13px", fontWeight: strong ? 900 : 700, color: accent ? HX.accent : HX.tx }}>{value}</Typography>
    </Box>
  );
}

export default function OrderSummarySidebar({ totals, itemsCount, canSubmit, isSubmitting, onSubmit }: OrderSummarySidebarProps) {
  return (
    <Box sx={{ position: { lg: "sticky" }, top: { lg: 12 } }}>
      <SectionCard title="ملخص الطلب" subtitle="يتحدّث تلقائياً" icon={<ReceiptLongOutlinedIcon />} iconBg={HX.accentLight} iconColor={HX.accent}>
        <Row label={`إجمالي المنتجات (${itemsCount})`} value={`${formatMoney(totals.itemsTotal)} ج.م`} />
        <Row label="تكلفة الشحن" value={`${formatMoney(totals.shippingFees)} ج.م`} />
        {totals.totalDiscounts > 0 && (
          <Row label="الخصم" value={`− ${formatMoney(totals.totalDiscounts)} ج.م`} />
        )}
        <Row label="جدية الشراء" value={`${formatMoney(totals.downPayment)} ج.م`} />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "12px", p: "12px 14px", borderRadius: "10px", background: `linear-gradient(135deg, ${HX.accentLight}, rgba(99,102,241,0.03))`, border: `0.5px solid ${HX.accentBorder}` }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>المطلوب تحصيله</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: "16px", fontWeight: 900, color: HX.accent }}>{formatMoney(totals.toBeCollected)} ج.م</Typography>
        </Box>

        <Box
          component="button"
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          sx={{
            width: "100%", mt: "16px", height: 42, borderRadius: "10px", border: "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px",
            bgcolor: canSubmit ? HX.accent : HX.surface3, color: canSubmit ? "#fff" : HX.tx3,
            cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
            fontFamily: FONT, fontSize: "13.5px", fontWeight: 800,
            boxShadow: canSubmit ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
            transition: ".15s", "&:hover": canSubmit ? { bgcolor: "#4f46e5" } : {},
          }}
        >
          {isSubmitting ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <CheckRoundedIcon sx={{ fontSize: 17 }} />}
          إنشاء الطلب الآن
        </Box>

        {!canSubmit && (
          <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, textAlign: "center", mt: "8px" }}>
            أضف اسم العميل، رقم الهاتف، ومنتجاً واحداً على الأقل
          </Typography>
        )}
      </SectionCard>
    </Box>
  );
}
