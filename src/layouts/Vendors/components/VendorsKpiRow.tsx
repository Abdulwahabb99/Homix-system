/**
 * صف مؤشرات الموردين (4 بطاقات) — كلها من بيانات حقيقية:
 * الإجمالي · النشطون (+نسبة النشاط) · متوسط مدة الشحن (من daysToDeliver) · غير النشطين.
 */
import React from "react";
import { Box } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { kpiCardSx, FONT } from "../utils/styles";
import { PLACEHOLDER } from "../utils/constants";
import { VendorsKpis } from "../hooks/useVendors";

interface CardDef {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: React.ReactNode;
  valueColor?: string;
  label: string;
  change?: string;
  changeColor?: string;
}

function KpiCard({ icon, iconBg, iconColor, value, valueColor, label, change, changeColor }: CardDef) {
  return (
    <Box sx={kpiCardSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "8px" }}>
        <Box sx={{ width: 30, height: 30, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: iconBg, color: iconColor, "& svg": { fontSize: 16 } }}>
          {icon}
        </Box>
      </Box>
      <Box sx={{ fontSize: "20px", fontWeight: 800, lineHeight: 1, mb: "2px", color: valueColor ?? HX.tx, fontFamily: FONT }}>{value}</Box>
      <Box sx={{ fontSize: "11px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>{label}</Box>
      {change && <Box sx={{ fontSize: "10px", mt: "5px", fontWeight: 600, color: changeColor ?? HX.green, fontFamily: FONT }}>{change}</Box>}
    </Box>
  );
}

export default function VendorsKpiRow({ kpis }: { kpis: VendorsKpis }) {
  const cards: CardDef[] = [
    { icon: <Inventory2OutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent, value: kpis.total, label: "إجمالي الموردين" },
    { icon: <CheckCircleOutlineIcon />, iconBg: HX.greenLight, iconColor: HX.green, value: kpis.active, valueColor: HX.green, label: "نشطين", change: `${kpis.activePct}% نسبة النشاط`, changeColor: HX.green },
    { icon: <AccessTimeIcon />, iconBg: HX.tealLight, iconColor: HX.teal, value: kpis.avgShipDays != null ? `${kpis.avgShipDays} يوم` : PLACEHOLDER, valueColor: HX.teal, label: "متوسط مدة الشحن" },
    { icon: <ErrorOutlineIcon />, iconBg: HX.redLight, iconColor: HX.red, value: kpis.inactive, valueColor: HX.red, label: "غير نشطين" },
  ];
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: "10px" }}>
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </Box>
  );
}
