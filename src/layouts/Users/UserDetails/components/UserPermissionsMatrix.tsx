/**
 * مصفوفة الصلاحيات (الصلاحيات) — مدفوعة بـ permissionsSummary من الـ API،
 * مجمّعة حسب المجموعات (طلبات/صناع/منتجات/... إلخ) مع عدّاد إجمالي في الترويسة.
 */
import React from "react";
import { Box } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { cardSx, cardHeadSx, cardTitleSx, permHeaderBadgeSx } from "../utils/styles";
import { PermissionsSummary } from "../utils/types";
import PermissionSectionBlock from "./PermissionSectionBlock";

export default function UserPermissionsMatrix({ summary }: { summary: PermissionsSummary }) {
  const groups = summary?.groups ?? [];
  const activeCount = summary?.activeCount ?? 0;

  return (
    <Box sx={cardSx}>
      <Box sx={cardHeadSx}>
        <Box sx={cardTitleSx}>
          <ShieldOutlinedIcon />
          الصلاحيات
        </Box>
        <Box component="span" sx={permHeaderBadgeSx}>{activeCount} صلاحية نشطة</Box>
      </Box>

      {groups.map((group) => (
        <PermissionSectionBlock key={group.key} group={group} />
      ))}
    </Box>
  );
}
