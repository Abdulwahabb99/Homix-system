/**
 * صف معلومة: أيقونة ملوّنة + عنوان + قيمة (+ زر نسخ اختياري).
 * مطابق لـ .ir في التصميم.
 */
import React from "react";
import { Box } from "@mui/material";
import { infoIconSx, infoLabelSx, infoRowSx, infoValueSx, monoValueSx } from "../utils/styles";
import CopyButton from "./CopyButton";

export interface InfoRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  children: React.ReactNode;
  /** خط أحادي المسافة للأرقام والأكواد */
  mono?: boolean;
  /** القيمة النصّية المنسوخة — عند تمريرها يظهر زر النسخ */
  copyValue?: string;
}

export default function InfoRow({
  icon, iconBg, iconColor, label, children, mono, copyValue,
}: InfoRowProps) {
  return (
    <Box sx={infoRowSx}>
      <Box sx={infoIconSx(iconBg, iconColor)}>{icon}</Box>
      <Box component="span" sx={infoLabelSx}>{label}</Box>
      <Box component="span" sx={{ ...infoValueSx, ...(mono ? monoValueSx : null) }}>
        {children}
      </Box>
      {copyValue ? <CopyButton value={copyValue} label={label} /> : null}
    </Box>
  );
}
