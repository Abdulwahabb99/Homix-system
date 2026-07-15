/**
 * صف معلومات عام (.ir): أيقونة ملوّنة + عنوان + قيمة (+ لاحقة اختيارية مثل زر النسخ).
 * مشترك بين بطاقات الحساب والبيانات الوظيفية والتحويل.
 */
import React from "react";
import { Box } from "@mui/material";
import { infoIcoSx, infoLabelSx, infoRowSx, infoValSx } from "../utils/styles";
import { infoRowIcon } from "../utils/icons";
import { TONE_MAP } from "../utils/constants";
import { InfoRow } from "../utils/types";

interface InfoRowItemProps extends InfoRow {
  /** عنصر يظهر في نهاية الصف (زر نسخ مثلاً) */
  trailing?: React.ReactNode;
  /** أنماط إضافية للقيمة (مثل الخط أحادي المسافة) */
  valueSx?: object;
}

export default function InfoRowItem({ label, value, tone, icon, trailing, valueSx }: InfoRowItemProps) {
  const t = TONE_MAP[tone];
  return (
    <Box sx={infoRowSx}>
      <Box sx={infoIcoSx(t.bg, t.color)}>{infoRowIcon(icon)}</Box>
      <Box component="span" sx={infoLabelSx}>{label}</Box>
      <Box component="span" sx={{ ...(infoValSx as object), ...(valueSx ?? {}) }}>{value}</Box>
      {trailing}
    </Box>
  );
}
