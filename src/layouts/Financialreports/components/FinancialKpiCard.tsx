/**
 * بطاقة KPI واحدة — أيقونة + قيمة + عنوان + شارة سفلية (مطابقة لـ .kpi).
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { kpiCardSx, FONT } from "../utils/styles";

export interface FinancialKpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  /** نص صغير أعلى-يسار البطاقة */
  topRight: string;
  value: string;
  valueColor?: string;
  label: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
}

export default function FinancialKpiCard({
  icon, iconBg, iconColor, topRight, value, valueColor, label, badge, badgeBg, badgeColor,
}: FinancialKpiCardProps) {
  return (
    <Box sx={kpiCardSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: "10px", display: "flex",
          alignItems: "center", justifyContent: "center", bgcolor: iconBg, color: iconColor,
          "& svg": { fontSize: 18 },
        }}>
          {icon}
        </Box>
        <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>{topRight}</Box>
      </Box>

      <Box sx={{ fontSize: "22px", fontWeight: 800, lineHeight: 1, mb: "3px", color: valueColor ?? HX.tx, fontFamily: FONT }}>
        {value}
      </Box>
      <Box sx={{ fontSize: "11.5px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>{label}</Box>

      <Box sx={{
        display: "inline-block", mt: "8px", px: "10px", py: "2px", borderRadius: "20px",
        fontSize: "10.5px", fontWeight: 700, fontFamily: FONT, bgcolor: badgeBg, color: badgeColor,
      }}>
        {badge}
      </Box>
    </Box>
  );
}
