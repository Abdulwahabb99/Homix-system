/**
 * أزرار الشريط العلوي لصفحة التفاصيل: رجوع + تعديل (حقيقيان) + تعليق الحساب +
 * إدارة الصلاحيات (ثابتان حالياً — «قريباً»). مكوّن عرضي؛ المنطق يُمرَّر من الصفحة.
 */
import React from "react";
import { Box } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/Block";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { topBtnSx } from "../utils/styles";

interface UserDetailActionsProps {
  onBack: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  onManagePermissions: () => void;
}

export default function UserDetailActions({ onBack, onEdit, onSuspend, onManagePermissions }: UserDetailActionsProps) {
  return (
    <>
      <Box component="button" type="button" onClick={onBack} sx={topBtnSx("ghost")}>
        <ChevronRightIcon /> رجوع
      </Box>
      <Box component="button" type="button" onClick={onEdit} sx={topBtnSx("ghost")}>
        <EditOutlinedIcon /> تعديل
      </Box>
      <Box component="button" type="button" onClick={onSuspend} sx={topBtnSx("danger")}>
        <BlockIcon /> تعليق الحساب
      </Box>
      <Box component="button" type="button" onClick={onManagePermissions} sx={topBtnSx("primary")}>
        <ShieldOutlinedIcon /> إدارة الصلاحيات
      </Box>
    </>
  );
}
