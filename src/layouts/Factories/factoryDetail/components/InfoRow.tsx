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
      {/*
        أنماط mono (ومنها unicode-bidi: plaintext) تُطبَّق على span داخلي لا على
        حاوية القيمة: الحاوية عرضها flex:1، ولو صار اتجاهها LTR — وهذا ما يحدث مع
        قيمة أرقام فقط بلا حرف اتجاهي قوي — فإنّ text-align:start يعني يساراً
        فينزلق الرقم لأقصى الشمال. الـ span الداخلي بحجم محتواه فيبقى في البداية.
      */}
      <Box component="span" sx={infoValueSx}>
        {mono ? (
          <Box component="span" sx={monoValueSx}>{children}</Box>
        ) : (
          children
        )}
      </Box>
      {copyValue ? <CopyButton value={copyValue} label={label} /> : null}
    </Box>
  );
}
