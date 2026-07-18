/**
 * مصفوفة الصلاحيات (الصلاحيات) — مدفوعة بـ permissionsSummary من الـ API،
 * مجمّعة حسب المجموعات. تتضمّن الترويسة عدّاداً + زر تعديل يفتح نافذة إدارة الصلاحيات.
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { cardSx, cardHeadSx, cardTitleSx, permEditBtnSx, permHeaderBadgeSx } from "../utils/styles";
import { PermissionsSummary } from "../utils/types";
import PermissionSectionBlock from "./PermissionSectionBlock";
import PermissionsEditModal from "./PermissionsEditModal";

interface UserPermissionsMatrixProps {
  summary: PermissionsSummary;
  userId: number | string;
}

export default function UserPermissionsMatrix({ summary, userId }: UserPermissionsMatrixProps) {
  const groups = summary?.groups ?? [];
  const activeCount = summary?.activeCount ?? 0;
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Box sx={cardSx}>
      <Box sx={cardHeadSx}>
        <Box sx={cardTitleSx}>
          <ShieldOutlinedIcon />
          الصلاحيات
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box component="span" sx={permHeaderBadgeSx}>{activeCount} صلاحية نشطة</Box>
          <Box component="button" type="button" title="تعديل الصلاحيات" onClick={() => setEditOpen(true)} sx={permEditBtnSx}>
            <EditOutlinedIcon />
          </Box>
        </Box>
      </Box>

      {groups.map((group) => (
        <PermissionSectionBlock key={group.key} group={group} />
      ))}

      <PermissionsEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        userId={userId}
        summary={summary}
      />
    </Box>
  );
}
