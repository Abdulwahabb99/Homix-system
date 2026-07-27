/**
 * صف المؤشرات — كل القيم من `summary` في استجابة `GET /factories`.
 *
 * التصميم الأصلي فيه بطاقتان لعدد المنتجات وإجمالي المبيعات؛ لا يوفّرهما مصدر
 * الصنّاع، فحُلَّتا ببطاقتَي «أوفلاين» و«عدد التخصصات» بنفس الشكل بدل عرض أرقام
 * لا سند لها.
 */
import React from "react";
import { Box } from "@mui/material";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { activityPct, fmt } from "../utils/calc";
import { FactoriesSummary } from "../utils/types";
import FactoriesKpiCard, { FactoriesKpiCardProps } from "./FactoriesKpiCard";

export default function FactoriesKpiRow({ summary }: { summary: FactoriesSummary }) {
  const pct = activityPct(summary.onlineFactories, summary.totalFactories);
  const offlinePct = activityPct(summary.offlineFactories, summary.totalFactories);

  const cards: FactoriesKpiCardProps[] = [
    {
      icon: <FactoryOutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent,
      topNote: "الكل",
      value: fmt(summary.totalFactories), label: "إجمالي الصنّاع",
      change: `${fmt(summary.specialtiesCount)} تخصص مختلف`, changeUp: true,
    },
    {
      icon: <CheckCircleOutlineIcon />, iconBg: HX.greenLight, iconColor: HX.green,
      value: fmt(summary.onlineFactories), valueColor: HX.green, label: "أونلاين ونشطين",
      change: `↑ ${pct}% نسبة النشاط`, changeUp: true,
    },
    {
      icon: <DoNotDisturbOnOutlinedIcon />, iconBg: HX.redLight, iconColor: HX.red,
      value: fmt(summary.offlineFactories), valueColor: HX.red, label: "أوفلاين",
      change: `${offlinePct}% من الإجمالي`, changeUp: false,
    },
    {
      icon: <CategoryOutlinedIcon />, iconBg: HX.blueLight, iconColor: HX.blue,
      value: fmt(summary.specialtiesCount), label: "عدد التخصصات",
      change: "تصنيفات المصانع المسجّلة", changeUp: true,
    },
  ];

  return (
    <Box sx={{
      display: "grid", gap: "10px",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" },
    }}>
      {cards.map((c) => (
        <FactoriesKpiCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
