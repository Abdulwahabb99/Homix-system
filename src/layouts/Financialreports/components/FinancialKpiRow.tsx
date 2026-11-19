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
import { arNum } from "../utils/format";
import { FinancialKpis } from "../utils/types";
import FinancialKpiCard, { FinancialKpiCardProps } from "./FinancialKpiCard";

export default function FinancialKpiRow({ kpis, archive = false }: { kpis: FinancialKpis; archive?: boolean }) {
  const cards: FinancialKpiCardProps[] = [
    {
      icon: <Inventory2OutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent,
      topRight: `${arNum(kpis.sellersCount)} صُنّاع`,
      value: arNum(kpis.totalSales), valueColor: HX.tx,
      label: "إجمالي مبيعات الدورة (ج.م)",
      badge: archive ? "إجمالي الفواتير في الأرشيف" : "الدورة الحالية", badgeBg: HX.accentLight, badgeColor: HX.accent,
    },
    {
      icon: <PaymentsOutlinedIcon />, iconBg: HX.greenLight, iconColor: HX.green,
      topRight: "مستحق للصُنّاع",
      value: arNum(kpis.totalDueSeller), valueColor: HX.green,
      label: "إجمالي المستحق للبائعين (ج.م)",
      badge: kpis.totalSales > 0 ? `${arNum(kpis.dueSellerPct)}٪ من الإجمالي` : "—", badgeBg: HX.greenLight, badgeColor: HX.green,
    },
    {
      icon: <AccountBalanceOutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent,
      topRight: "المستحق لهوميكس",
      value: arNum(kpis.totalDueComp), valueColor: HX.accent,
      label: "إجمالي المستحق لهوميكس (ج.م)",
      badge: kpis.totalSales > 0 ? `${arNum(kpis.dueCompPct)}٪ من الإجمالي` : "—", badgeBg: HX.accentLight, badgeColor: HX.accent,
    },
    {
      icon: <WarningAmberOutlinedIcon />, iconBg: HX.redLight, iconColor: HX.red,
      topRight: "إجمالي الغرامات",
      value: arNum(kpis.totalFine), valueColor: HX.red,
      label: "غرامات التأخير هذه الدورة (ج.م)",
      badge: kpis.lateSellersCount > 0 ? `${arNum(kpis.lateSellersCount)} صُنّاع عليهم غرامات` : "مفيش غرامات", badgeBg: HX.redLight, badgeColor: HX.red,
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
