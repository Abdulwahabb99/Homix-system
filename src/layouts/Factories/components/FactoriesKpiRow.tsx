/**
 * صف المؤشرات (5 بطاقات) — العدد/النشاط/المبيعات مُشتقّة من القائمة،
 * وعدد المنتجات و«تحتاج مراجعة» ثابتة حتى يوفّرها الـ BE.
 */
import React from "react";
import { Box } from "@mui/material";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { KPI_BADGES } from "../data/staticFactories";
import { compactMoney, fmt } from "../utils/calc";
import { CURRENCY } from "../utils/constants";
import { FactoryKpis } from "../utils/types";
import FactoriesKpiCard, { FactoriesKpiCardProps } from "./FactoriesKpiCard";

export default function FactoriesKpiRow({ kpis }: { kpis: FactoryKpis }) {
  const cards: FactoriesKpiCardProps[] = [
    {
      icon: <FactoryOutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent,
      topNote: "الكل",
      value: fmt(kpis.total), label: "إجمالي الصنّاع",
      change: KPI_BADGES.newThisMonth, changeUp: true,
    },
    {
      icon: <CheckCircleOutlineIcon />, iconBg: HX.greenLight, iconColor: HX.green,
      value: fmt(kpis.online), valueColor: HX.green, label: "أونلاين ونشطين",
      change: `↑ ${kpis.activePct}% نسبة النشاط`, changeUp: true,
    },
    {
      icon: <Inventory2OutlinedIcon />, iconBg: HX.blueLight, iconColor: HX.blue,
      value: fmt(kpis.totalProducts), label: "إجمالي المنتجات",
      change: KPI_BADGES.newProducts, changeUp: true,
    },
    {
      icon: <LocalShippingOutlinedIcon />, iconBg: HX.amberLight, iconColor: HX.amber,
      value: compactMoney(kpis.totalSales), label: `إجمالي المبيعات (${CURRENCY})`,
      change: KPI_BADGES.salesGrowth, changeUp: true,
    },
    {
      icon: <ErrorOutlineIcon />, iconBg: HX.redLight, iconColor: HX.red,
      value: fmt(kpis.needsReview), valueColor: HX.red, label: "تحتاج مراجعة",
      change: KPI_BADGES.lateOrders, changeUp: false,
    },
  ];

  return (
    <Box sx={{
      display: "grid", gap: "10px",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(5,1fr)" },
    }}>
      {cards.map((c) => (
        <FactoriesKpiCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
