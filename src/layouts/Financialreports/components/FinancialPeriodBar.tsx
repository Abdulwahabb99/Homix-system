/**
 * شريط اختيار دورة الفوترة — أزرار (pills) + نطاق الفترة + حالتها.
 * مُتحكَّم به من الأب (القيمة الحالية تُستخدم لاحقاً لقيادة استعلام الـ BE).
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  periodBarSx, periodPillSx, FONT,
} from "../utils/styles";
import {
  PERIOD_OPTIONS, PERIOD_RANGE_LABEL, PERIOD_STATUS_LABEL,
} from "../utils/constants";

interface FinancialPeriodBarProps {
  value: string;
  onChange: (id: string) => void;
}

export default function FinancialPeriodBar({ value, onChange }: FinancialPeriodBarProps) {
  return (
    <Box sx={periodBarSx}>
      <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
        دورة الفوترة:
      </Box>

      <Box sx={{ display: "flex", gap: "6px" }}>
        {PERIOD_OPTIONS.map((p) => (
          <Box key={p.id} onClick={() => onChange(p.id)} sx={periodPillSx(value === p.id)}>
            {p.label}
          </Box>
        ))}
      </Box>

      <Box sx={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Box sx={{
          fontSize: "12px", color: HX.tx2, bgcolor: HX.surface2,
          border: `0.5px solid ${HX.border}`, px: "14px", py: "5px", borderRadius: "20px", fontFamily: FONT,
        }}>
          {PERIOD_RANGE_LABEL}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: HX.amber }} />
          <Box component="span" sx={{ fontSize: "12px", color: HX.amber, fontWeight: 600, fontFamily: FONT }}>
            {PERIOD_STATUS_LABEL}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
