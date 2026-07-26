/**
 * بطاقة مؤشّر واحدة — أيقونة + قيمة + عنوان + سطر تغيير سفلي (مطابقة لـ .kc).
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { kpiCardSx, FONT } from "../utils/styles";

export interface FactoriesKpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  /** نص صغير في أقصى الجانب المقابل للأيقونة (اختياري) */
  topNote?: string;
  value: string;
  valueColor?: string;
  label: string;
  /** سطر التغيير أسفل البطاقة */
  change: string;
  /** true = أخضر (تحسّن) / false = أحمر (تراجع) */
  changeUp: boolean;
}

export default function FactoriesKpiCard({
  icon, iconBg, iconColor, topNote, value, valueColor, label, change, changeUp,
}: FactoriesKpiCardProps) {
  return (
    <Box sx={kpiCardSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px" }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "9px", display: "flex",
          alignItems: "center", justifyContent: "center",
          bgcolor: iconBg, color: iconColor, "& svg": { fontSize: 17 },
        }}>
          {icon}
        </Box>
        {topNote ? (
          <Box sx={{ fontSize: "10px", color: HX.tx3, fontFamily: FONT }}>{topNote}</Box>
        ) : null}
      </Box>

      <Box sx={{
        fontSize: "22px", fontWeight: 800, lineHeight: 1, mb: "3px",
        color: valueColor ?? HX.tx, fontFamily: FONT,
      }}>
        {value}
      </Box>
      <Box sx={{ fontSize: "11.5px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>
        {label}
      </Box>
      <Box sx={{
        mt: "6px", fontSize: "10.5px", fontWeight: 600, fontFamily: FONT,
        color: changeUp ? HX.green : HX.red,
      }}>
        {change}
      </Box>
    </Box>
  );
}
