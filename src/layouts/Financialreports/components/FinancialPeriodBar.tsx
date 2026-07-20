/**
 * شريط اختيار دورة الفوترة — أزرار (pills) ليوم 13/28 + نطاق الفترة وحالتها.
 * القيمة الحالية تقود استعلام الـ BE؛ النطاق والحالة يُشتقّان من `cycle`.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FinancialCycle } from "query/financialReport";
import { periodBarSx, periodPillSx, FONT } from "../utils/styles";
import { BILLING_DAY_OPTIONS, PERIOD_RANGE_FALLBACK } from "../utils/constants";
import { BillingDay } from "../utils/types";

interface FinancialPeriodBarProps {
  billingDay: BillingDay;
  onChange: (day: BillingDay) => void;
  cycle: FinancialCycle | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function rangeLabel(cycle: FinancialCycle | null): string {
  const start = formatDate(cycle?.startDate ?? null);
  const end = formatDate(cycle?.endDate ?? null);
  if (!start && !end) return PERIOD_RANGE_FALLBACK;
  return `الفترة: ${start} — ${end}`;
}

export default function FinancialPeriodBar({ billingDay, onChange, cycle }: FinancialPeriodBarProps) {
  const closed = cycle?.endDate ? new Date(cycle.endDate).getTime() < Date.now() : false;
  const statusLabel = closed ? "دورة مغلقة" : "قيد المعالجة";
  const statusColor = closed ? HX.green : HX.amber;

  return (
    <Box sx={periodBarSx}>
      <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
        دورة الفوترة:
      </Box>

      <Box sx={{ display: "flex", gap: "6px" }}>
        {BILLING_DAY_OPTIONS.map((p) => (
          <Box key={p.day} onClick={() => onChange(p.day)} sx={periodPillSx(billingDay === p.day)}>
            {p.label}
          </Box>
        ))}
      </Box>

      <Box sx={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Box sx={{
          fontSize: "12px", color: HX.tx2, bgcolor: HX.surface2,
          border: `0.5px solid ${HX.border}`, px: "14px", py: "5px", borderRadius: "20px", fontFamily: FONT,
        }}>
          {rangeLabel(cycle)}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusColor }} />
          <Box component="span" sx={{ fontSize: "12px", color: statusColor, fontWeight: 600, fontFamily: FONT }}>
            {statusLabel}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
