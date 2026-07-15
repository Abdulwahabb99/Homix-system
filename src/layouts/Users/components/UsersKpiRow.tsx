/**
 * صف مؤشرات المستخدمين (4 بطاقات). «الإجمالي» و«المدراء» من بيانات حقيقية؛
 * «متصلين الآن» و«موقوفين» تعرض «—» لعدم توفّر الحالة من الـ API.
 */
import React from "react";
import { Box } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { kpiCardSx, FONT } from "../utils/styles";
import { PLACEHOLDER } from "../utils/constants";
import { UsersKpis } from "../hooks/useUsers";

interface CardDef {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: React.ReactNode;
  valueColor?: string;
  label: string;
}

function KpiCard({ icon, iconBg, iconColor, value, valueColor, label }: CardDef) {
  return (
    <Box sx={kpiCardSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "8px" }}>
        <Box sx={{
          width: 30, height: 30, borderRadius: "8px", display: "flex", alignItems: "center",
          justifyContent: "center", bgcolor: iconBg, color: iconColor, "& svg": { fontSize: 16 },
        }}>
          {icon}
        </Box>
      </Box>
      <Box sx={{ fontSize: "20px", fontWeight: 800, lineHeight: 1, mb: "2px", color: valueColor ?? HX.tx, fontFamily: FONT }}>
        {value}
      </Box>
      <Box sx={{ fontSize: "11px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>{label}</Box>
    </Box>
  );
}

export default function UsersKpiRow({ kpis }: { kpis: UsersKpis }) {
  const cards: CardDef[] = [
    { icon: <PeopleAltOutlinedIcon />, iconBg: HX.accentLight, iconColor: HX.accent, value: kpis.total, valueColor: HX.tx, label: "إجمالي المستخدمين" },
    { icon: <AccessTimeIcon />, iconBg: HX.greenLight, iconColor: HX.green, value: PLACEHOLDER, valueColor: HX.green, label: "متصلين الآن" },
    { icon: <ShieldOutlinedIcon />, iconBg: HX.purpleLight, iconColor: HX.purple, value: kpis.admins, label: "مدراء" },
    { icon: <ErrorOutlineIcon />, iconBg: HX.redLight, iconColor: HX.red, value: PLACEHOLDER, valueColor: HX.red, label: "موقوفين" },
  ];
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: "10px" }}>
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </Box>
  );
}
