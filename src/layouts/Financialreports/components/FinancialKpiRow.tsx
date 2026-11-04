/**
 * صف مؤشرات الأداء (4 بطاقات) — يُبنى من KPIs المُشتقّة من بيانات التسويات.
 */
import React from "react";
import { Box } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { money } from "../utils/calc";
import { FinancialKpis } from "../utils/types";
import FinancialKpiCard, { FinancialKpiCardProps } from "./FinancialKpiCard";

export default function FinancialKpiRow({ kpis, archive = false }: { kpis: FinancialKpis; archive?: boolean }) {
  const cards: FinancialKpiCardProps[] = [
    {
      icon: <Inventory2OutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent,
      topRight: `${kpis.sellersCount} صُنّاع`,
      value: money(kpis.totalSales), valueColor: HX.tx,
      label: "إجمالي مبيعات الدورة (ج.م)",
      badge: archive ? "إجمالي الفواتير في الأرشيف" : "الدورة الحالية", badgeBg: HX.accentLight, badgeColor: HX.accent,
    },
    {
      icon: <PaymentsOutlinedIcon />, iconBg: HX.greenLight, iconColor: HX.green,
      topRight: "مستحق للصُنّاع",
      value: money(kpis.totalDueSeller), valueColor: HX.green,
      label: "إجمالي المستحق للبائعين (ج.م)",
      badge: kpis.totalSales > 0 ? `${Math.round(kpis.dueSellerPct)}% من الإجمالي` : "—", badgeBg: HX.greenLight, badgeColor: HX.green,
    },
    {
      icon: <AccountBalanceOutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent,
      topRight: "عمولة الشركة",
      value: money(kpis.totalDueComp), valueColor: HX.accent,
      label: "إجمالي المستحق للشركة (ج.م)",
      badge: kpis.totalSales > 0 ? `${Math.round(kpis.dueCompPct)}% من الإجمالي` : "—", badgeBg: HX.accentLight, badgeColor: HX.accent,
    },
    {
      icon: <WarningAmberOutlinedIcon />, iconBg: HX.redLight, iconColor: HX.red,
      topRight: "إجمالي الغرامات",
      value: money(kpis.totalFine), valueColor: HX.red,
      label: "غرامات التأخير هذه الدورة (ج.م)",
      badge: kpis.lateSellersCount > 0 ? `${kpis.lateSellersCount} صُنّاع عليهم غرامات` : "مفيش غرامات", badgeBg: HX.redLight, badgeColor: HX.red,
    },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4,1fr)" }, gap: "12px" }}>
      {cards.map((c) => (
        <FinancialKpiCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
