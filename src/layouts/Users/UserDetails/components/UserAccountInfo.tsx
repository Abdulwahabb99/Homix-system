/**
 * بطاقة بيانات الحساب: البريد/الدور/الحالة حقيقية من الـ API؛
 * «آخر تغيير لكلمة المرور» ثابتة حالياً.
 */
import React from "react";
import { Box } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../utils/styles";
import { ACCOUNT_STATIC } from "../utils/constants";
import { RoleMeta } from "../../utils/constants";
import DetailCard from "./DetailCard";
import InfoRowItem from "./InfoRowItem";

interface UserAccountInfoProps {
  email: string;
  role: RoleMeta;
  joined: string;
  isActive: boolean;
}

export default function UserAccountInfo({ email, role, joined, isActive }: UserAccountInfoProps) {
  const statusColor = isActive ? HX.green : HX.red;
  return (
    <DetailCard title="بيانات الحساب" icon={<PersonOutlineIcon />}>
      <InfoRowItem
        icon="email"
        tone="blue"
        label="البريد"
        value={<Box component="span" sx={{ fontSize: "12px" }}>{email}</Box>}
      />
      <InfoRowItem
        icon="shield"
        tone="purple"
        label="الدور"
        value={
          <Box
            component="span"
            sx={{ bgcolor: role.bg, color: role.color, px: "10px", py: "3px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700, fontFamily: FONT }}
          >
            {role.label}
          </Box>
        }
      />
      <InfoRowItem
        icon="clock"
        tone="green"
        label="الحالة"
        value={
          <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusColor }} />
            {isActive ? "نشط" : "موقوف"}
          </Box>
        }
      />
      <InfoRowItem icon="calendar" tone="amber" label="انضم في" value={joined} />
      <InfoRowItem
        icon="lock"
        tone="accent"
        label="آخر تغيير لكلمة المرور"
        value={<Box component="span" sx={{ fontSize: "12px" }}>{ACCOUNT_STATIC.lastPasswordChange}</Box>}
      />
    </DetailCard>
  );
}
