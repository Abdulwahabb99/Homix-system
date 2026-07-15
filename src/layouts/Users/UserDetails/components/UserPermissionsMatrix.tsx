/**
 * مصفوفة الصلاحيات (الصلاحيات) — بيانات ثابتة حالياً؛ ستُربط بالـ BE مستقبلاً.
 * بطاقة تحوي عدّاداً إجمالياً في الترويسة ثم أقساماً (طلبات/صناع/شحن/مالية/تذاكر/مستخدمين).
 */
import React from "react";
import { Box } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { cardSx, cardHeadSx, cardTitleSx, permHeaderBadgeSx } from "../utils/styles";
import { ACTIVE_PERMISSIONS_COUNT, PERMISSION_SECTIONS } from "../utils/constants";
import PermissionSectionBlock from "./PermissionSectionBlock";

export default function UserPermissionsMatrix() {
  return (
    <Box sx={cardSx}>
      <Box sx={cardHeadSx}>
        <Box sx={cardTitleSx}>
          <ShieldOutlinedIcon />
          الصلاحيات
        </Box>
        <Box component="span" sx={permHeaderBadgeSx}>{ACTIVE_PERMISSIONS_COUNT} صلاحية نشطة</Box>
      </Box>

      {PERMISSION_SECTIONS.map((section) => (
        <PermissionSectionBlock key={section.key} section={section} />
      ))}
    </Box>
  );
}
