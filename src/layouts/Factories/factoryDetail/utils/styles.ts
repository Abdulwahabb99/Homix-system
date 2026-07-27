/**
 * أنماط (sx) صفحة تفاصيل المصنع — مطابقة لـ homix_factory_detail.html.
 *
 * تنبيه RTL: `sx` يعبر stylis-plugin-rtl فتُقلب الخصائص الفيزيائية
 * (`marginRight` → marginLeft، `textAlign: right` → left). تُستخدم هنا الخصائص
 * المنطقية فقط (`marginInline*`، `borderInline*`، `start`/`end`).
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { R, R_SM } from "../../utils/constants";

export const FONT = "'Cairo', sans-serif";

/** لون الشريط الجانبي — يُستخدم لترويسة بطاقة البنك (--sb في التصميم) */
export const SIDEBAR_DARK = "#0f1117";
export const SIDEBAR_DARK_2 = "#1a1f2e";

/* ── الشبكة الرئيسية: عمود مرن + عمود ثابت 320px ── */
export const detailGridSx: SxProps<Theme> = {
  display: "grid",
  gap: "14px",
  alignItems: "start",
  gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 320px" },
};

export const colStackSx: SxProps<Theme> = {
  display: "flex", flexDirection: "column", gap: "12px", minWidth: 0,
};

/* ── بطاقة ── */
export const cardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  overflow: "hidden", fontFamily: FONT,
};

export const cardHeadSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: "10px", p: "12px 16px", borderBottom: `0.5px solid ${HX.border}`,
};

export const cardTitleSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "8px",
  fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT,
  "& svg": { fontSize: 15, color: HX.tx2 },
};

export const cardBodySx: SxProps<Theme> = { p: "16px" };

/* ── صف معلومة ── */
export const infoRowSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "10px",
  py: "9px", borderBottom: `0.5px solid ${HX.border}`,
  "&:first-of-type": { pt: 0 },
  "&:last-of-type": { borderBottom: "none", pb: 0 },
};

export function infoIconSx(bg: string, color: string): SxProps<Theme> {
  return {
    width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    bgcolor: bg, color, "& svg": { fontSize: 14 },
  };
}

export const infoLabelSx: SxProps<Theme> = {
  fontSize: "11.5px", color: HX.tx3, fontWeight: 500,
  minWidth: 104, flexShrink: 0, fontFamily: FONT,
};

/** كائنات عادية (بلا وسم SxProps) لأنها تُدمج بالنشر — الوسم يوسّعها لاتحاد يشمل المصفوفات */
export const infoValueSx = {
  fontSize: "13px", fontWeight: 600, color: HX.tx, flex: 1,
  minWidth: 0, fontFamily: FONT, wordBreak: "break-word",
} as const;

export const monoValueSx = {
  fontFamily: "monospace", fontSize: "12px", letterSpacing: ".5px",
  unicodeBidi: "plaintext",
} as const;

/** الفاصل بين عمودَي بطاقة «بيانات المصنع» — منطقي حتى لا ينقلب */
export const infoSplitSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: { xs: 0, sm: "16px" },
  "& > :nth-of-type(2)": {
    borderInlineStart: { xs: "none", sm: `0.5px solid ${HX.border}` },
    paddingInlineStart: { xs: 0, sm: "16px" },
  },
};

/* ── زر النسخ ── */
export function copyBtnSx(copied: boolean): SxProps<Theme> {
  return {
    width: 24, height: 24, borderRadius: "6px", flexShrink: 0, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: ".15s",
    border: `0.5px solid ${copied ? "transparent" : HX.border}`,
    bgcolor: copied ? HX.greenLight : HX.surface2,
    color: copied ? HX.green : HX.tx3,
    "&:hover": copied ? {} : { bgcolor: HX.accentLight, borderColor: HX.accentBorder, color: HX.accent },
    "& svg": { fontSize: 12 },
  };
}

/* ── بطاقة البنك ── */
export const bankHeaderSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "10px", p: "14px 16px", mb: "14px",
  borderRadius: R_SM, background: `linear-gradient(135deg, ${SIDEBAR_DARK}, ${SIDEBAR_DARK_2})`,
};

export const bankLogoSx: SxProps<Theme> = {
  width: 38, height: 38, borderRadius: "9px", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  bgcolor: "rgba(255,255,255,.1)", color: "#fff", "& svg": { fontSize: 17 },
};

export const bankFieldSx: SxProps<Theme> = {
  bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`,
  borderRadius: R_SM, p: "10px 14px", mb: "8px",
  "&:last-of-type": { mb: 0 },
};

export const bankFieldLabelSx: SxProps<Theme> = {
  fontSize: "10.5px", fontWeight: 700, color: HX.tx3,
  letterSpacing: ".5px", textTransform: "uppercase", mb: "4px", fontFamily: FONT,
};

export const bankFieldValueSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
  fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT, minWidth: 0,
};

/* ── مصاريف الشحن ── */
export const shipGridSx: SxProps<Theme> = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5px", bgcolor: HX.border,
};

export const shipCellSx: SxProps<Theme> = {
  bgcolor: HX.surface, p: "14px", textAlign: "center",
};

export const shipZoneSx: SxProps<Theme> = {
  fontSize: "11px", color: HX.tx3, fontWeight: 500, mb: "6px", fontFamily: FONT,
};

export const shipAmountSx: SxProps<Theme> = {
  fontSize: "18px", fontWeight: 900, color: HX.tx, fontFamily: FONT,
};

export const shipUnitSx: SxProps<Theme> = {
  fontSize: "11px", color: HX.tx3, fontWeight: 400, fontFamily: FONT,
};

/* ── المستندات ── */
export const attSectionLabelSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
  fontSize: "10px", fontWeight: 700, color: HX.tx3,
  letterSpacing: ".8px", textTransform: "uppercase", mb: "8px", fontFamily: FONT,
};

export const attAddBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "3px",
  fontSize: "11px", fontWeight: 600, color: HX.accent,
  cursor: "pointer", border: "none", bgcolor: "transparent", fontFamily: FONT,
  "&:hover": { textDecoration: "underline" },
  "& svg": { fontSize: 12 },
};

export const attListSx: SxProps<Theme> = {
  display: "flex", flexDirection: "column", gap: "8px",
};

export const attItemSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "10px", p: "10px 12px",
  bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: R_SM,
  transition: ".15s", "&:hover": { borderColor: HX.accent },
};

export function attIconSx(bg: string): SxProps<Theme> {
  return {
    width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "17px", lineHeight: 1, bgcolor: bg,
  };
}

/** لون شارة حالة التوثيق */
export type AttStatusTone = "verified" | "pending" | "expired";

export function attStatusSx(tone: AttStatusTone): SxProps<Theme> {
  const map = {
    verified: { bg: HX.greenLight, color: "#065f46" },
    pending: { bg: HX.amberLight, color: "#92400e" },
    expired: { bg: HX.redLight, color: HX.red },
  }[tone];
  return {
    display: "inline-flex", alignItems: "center", gap: "3px",
    px: "8px", py: "2px", borderRadius: "5px",
    fontSize: "10px", fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap",
    bgcolor: map.bg, color: map.color,
  };
}

export function attBtnSx(danger?: boolean): SxProps<Theme> {
  return {
    width: 28, height: 28, borderRadius: "7px", flexShrink: 0, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx3,
    transition: ".15s",
    "&:hover": danger
      ? { borderColor: HX.red, color: HX.red, bgcolor: HX.redLight }
      : { borderColor: HX.accent, color: HX.accent, bgcolor: HX.accentLight },
    "& svg": { fontSize: 13 },
  };
}

export const attSeparatorSx: SxProps<Theme> = {
  height: "0.5px", bgcolor: HX.border, my: "10px",
};

export function attUploadZoneSx(dragOver: boolean): SxProps<Theme> {
  return {
    border: `1.5px dashed ${dragOver ? HX.accent : HX.border2}`,
    borderRadius: R_SM, p: "18px", textAlign: "center", cursor: "pointer",
    transition: ".2s", bgcolor: dragOver ? HX.accentLight : HX.surface2,
    "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight },
  };
}

export const attUploadIconSx: SxProps<Theme> = {
  width: 36, height: 36, borderRadius: R_SM, mx: "auto", mb: "8px",
  display: "flex", alignItems: "center", justifyContent: "center",
  bgcolor: HX.accentLight, color: HX.accent, "& svg": { fontSize: 17 },
};

export const attTypeChipSx: SxProps<Theme> = {
  fontSize: "10px", fontWeight: 600, px: "8px", py: "2px",
  bgcolor: HX.surface, border: `0.5px solid ${HX.border}`,
  borderRadius: "5px", color: HX.tx3, fontFamily: FONT, whiteSpace: "nowrap",
};

/* ── أزرار الشريط العلوي ── */
export const topBtnGhostSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "5px", height: 32, px: "15px",
  borderRadius: R_SM, border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2,
  color: HX.tx2, fontSize: "12px", fontWeight: 700, fontFamily: FONT,
  cursor: "pointer", transition: ".15s",
  "&:hover": { borderColor: HX.accent, color: HX.accent },
  "& svg": { fontSize: 14 },
};

export const topBtnPrimarySx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "5px", height: 32, px: "15px",
  borderRadius: R_SM, border: "none", bgcolor: HX.accent, color: "#fff",
  fontSize: "12px", fontWeight: 700, fontFamily: FONT,
  cursor: "pointer", transition: ".15s",
  "&:hover": { bgcolor: "#5254e0" },
  "& svg": { fontSize: 14 },
};

/* ── حالات الصفحة ── */
export const stateBoxSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "center",
  minHeight: "50vh", fontSize: "13px", fontFamily: FONT, color: HX.tx2,
};
