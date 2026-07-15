/**
 * ترويسة الملف الشخصي (.profile-card): غلاف متدرّج + صورة رمزية بحلقة اتصال +
 * الاسم/البريد + شارات (الدور/الحالة/تاريخ الانضمام) + صف إحصائيات ثابتة.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  onlineDotSx,
  onlineRingSx,
  profileAvatarSx,
  profileAvatarWrapSx,
  profileBodySx,
  profileCardSx,
  profileCoverSx,
  profileEmailSx,
  profileNameSx,
  profileStatsSx,
  profileTagsSx,
  pstatLblSx,
  pstatValSx,
  ptagSx,
  FONT,
} from "../utils/styles";
import { PROFILE_STATS } from "../utils/constants";
import { RoleMeta } from "../../utils/constants";

interface UserProfileHeaderProps {
  name: string;
  email: string;
  initials: string;
  role: RoleMeta;
  joined: string;
  isActive: boolean;
}

export default function UserProfileHeader({ name, email, initials, role, joined, isActive }: UserProfileHeaderProps) {
  const statusBg = isActive ? HX.greenLight : HX.redLight;
  const statusColor = isActive ? "#065f46" : "#991b1b";
  const statusDot = isActive ? HX.green : HX.red;
  const statusLabel = isActive ? "نشط" : "موقوف";

  return (
    <Box sx={profileCardSx}>
      <Box sx={profileCoverSx} />
      <Box sx={profileBodySx}>
        <Box sx={profileAvatarWrapSx}>
          <Box sx={{ ...(profileAvatarSx as object), background: role.gradient }}>{initials}</Box>
          <Box sx={{ ...(onlineRingSx as object), bgcolor: statusDot }} />
        </Box>

        <Box sx={profileNameSx}>{name}</Box>
        <Box sx={profileEmailSx}>{email}</Box>

        <Box sx={profileTagsSx}>
          <Box component="span" sx={ptagSx(role.bg, role.color)}>{role.label}</Box>
          <Box component="span" sx={ptagSx(statusBg, statusColor)}>
            <Box component="span" sx={{ ...(onlineDotSx as object), bgcolor: statusDot }} /> {statusLabel}
          </Box>
          <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx3, py: "4px", fontFamily: FONT }}>
            انضم في {joined}
          </Box>
        </Box>

        <Box sx={profileStatsSx}>
          {PROFILE_STATS.map((s) => (
            <Box key={s.label} sx={{ textAlign: "center" }}>
              <Box sx={{ ...(pstatValSx as object), color: s.color ?? HX.tx }}>{s.value}</Box>
              <Box sx={pstatLblSx}>{s.label}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
