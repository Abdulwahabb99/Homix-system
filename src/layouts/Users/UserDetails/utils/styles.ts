/**
 * أنماط (sx) صفحة تفاصيل المستخدم — مطابقة لـ homix_user_detail.html على رموز HX.
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { R } from "./constants";

export const FONT = "'Cairo', sans-serif";

/* ── حاوية المحتوى ── */
export const contentSx: SxProps<Theme> = {
  mt: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  fontFamily: FONT,
};

/* ── بطاقة عامة (.card) ── */
export const cardSx: SxProps<Theme> = {
  bgcolor: HX.surface,
  borderRadius: R,
  border: `0.5px solid ${HX.border}`,
  overflow: "hidden",
  fontFamily: FONT,
};

/* ── ترويسة البطاقة (.ch) ── */
export const cardHeadSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  p: "12px 16px",
  borderBottom: `0.5px solid ${HX.border}`,
};
export const cardTitleSx: SxProps<Theme> = {
  fontSize: "13px",
  fontWeight: 700,
  color: HX.tx,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontFamily: FONT,
  "& svg": { fontSize: 16, color: HX.tx2 },
};
export const cardBodySx: SxProps<Theme> = { p: "16px" };

/* ────────────────── ترويسة الملف الشخصي (.profile-card) ────────────────── */
export const profileCardSx: SxProps<Theme> = {
  bgcolor: HX.surface,
  borderRadius: R,
  border: `0.5px solid ${HX.border}`,
  overflow: "hidden",
  fontFamily: FONT,
};
export const profileCoverSx: SxProps<Theme> = {
  height: 80,
  background: "linear-gradient(135deg,#4338ca,#7c3aed,#6366f1)",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    opacity: 0.12,
    backgroundImage:
      "radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px),radial-gradient(circle at 80% 20%,#fff 1px,transparent 1px),radial-gradient(circle at 50% 80%,#fff 1px,transparent 1px)",
    backgroundSize: "40px 40px",
  },
};
export const profileBodySx: SxProps<Theme> = { px: "22px", pb: "20px", position: "relative" };
export const profileAvatarWrapSx: SxProps<Theme> = {
  position: "relative",
  display: "inline-block",
  mt: "-32px",
  mb: "12px",
};
export const profileAvatarSx: SxProps<Theme> = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  fontWeight: 900,
  color: "#fff",
  border: `3px solid ${HX.surface}`,
  fontFamily: FONT,
};
export const onlineRingSx: SxProps<Theme> = {
  position: "absolute",
  bottom: 2,
  insetInlineStart: 2,
  width: 14,
  height: 14,
  borderRadius: "50%",
  bgcolor: HX.green,
  border: `2px solid ${HX.surface}`,
};
export const profileNameSx: SxProps<Theme> = {
  fontSize: "18px",
  fontWeight: 800,
  color: HX.tx,
  mb: "3px",
  fontFamily: FONT,
};
export const profileEmailSx: SxProps<Theme> = {
  fontSize: "12.5px",
  color: HX.tx3,
  mb: "8px",
  fontFamily: FONT,
};
export const profileTagsSx: SxProps<Theme> = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  alignItems: "center",
};
export function ptagSx(bg: string, color: string): SxProps<Theme> {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    px: "11px",
    py: "4px",
    borderRadius: "7px",
    fontSize: "11.5px",
    fontWeight: 700,
    fontFamily: FONT,
    bgcolor: bg,
    color,
  };
}
export const onlineDotSx: SxProps<Theme> = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  bgcolor: HX.green,
};
export const profileStatsSx: SxProps<Theme> = {
  display: "flex",
  gap: "20px",
  mt: "14px",
  pt: "14px",
  borderTop: `0.5px solid ${HX.border}`,
  flexWrap: "wrap",
};
export const pstatValSx: SxProps<Theme> = {
  fontSize: "18px",
  fontWeight: 800,
  color: HX.tx,
  fontFamily: FONT,
};
export const pstatLblSx: SxProps<Theme> = {
  fontSize: "10.5px",
  color: HX.tx3,
  mt: "1px",
  fontFamily: FONT,
};

/* ────────────────── الشبكة الرئيسية ────────────────── */
export const gridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
  gap: "14px",
  alignItems: "start",
};
export const colSx: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: "12px" };

/* ────────────────── مصفوفة الصلاحيات ────────────────── */
export const permHeaderBadgeSx: SxProps<Theme> = {
  fontSize: "11px",
  bgcolor: HX.greenLight,
  color: "#065f46",
  px: "9px",
  py: "3px",
  borderRadius: "6px",
  fontWeight: 700,
  fontFamily: FONT,
};
export const permSectionSx: SxProps<Theme> = { borderBottom: `0.5px solid ${HX.border}`, "&:last-of-type": { borderBottom: "none" } };
export const permSecHeadSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  p: "10px 16px",
  bgcolor: HX.surface2,
  borderBottom: `0.5px solid ${HX.border}`,
};
export function permSecIcoSx(bg: string, color: string): SxProps<Theme> {
  return {
    width: 26,
    height: 26,
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    bgcolor: bg,
    color,
    "& svg": { fontSize: 13 },
  };
}
export const permSecNameSx: SxProps<Theme> = {
  fontSize: "12px",
  fontWeight: 700,
  color: HX.tx,
  flex: 1,
  fontFamily: FONT,
};
export function permSecCountSx(bg: string, color: string): SxProps<Theme> {
  return {
    fontSize: "11px",
    fontWeight: 700,
    px: "8px",
    py: "2px",
    borderRadius: "5px",
    fontFamily: FONT,
    bgcolor: bg,
    color,
  };
}
export const permItemsSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
};
export const permItemSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  p: "9px 16px",
  borderBottom: `0.5px solid ${HX.border}`,
};
export const permIcoSx: SxProps<Theme> = {
  width: 22,
  height: 22,
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  bgcolor: HX.greenLight,
  color: HX.green,
  "& svg": { fontSize: 11 },
};
export const permLabelSx: SxProps<Theme> = {
  fontSize: "12px",
  fontWeight: 500,
  color: HX.tx,
  flex: 1,
  fontFamily: FONT,
};
export function permStateSx(on: boolean): SxProps<Theme> {
  return {
    fontSize: "10px",
    fontWeight: 700,
    px: "7px",
    py: "2px",
    borderRadius: "4px",
    flexShrink: 0,
    fontFamily: FONT,
    bgcolor: on ? HX.greenLight : "rgba(100,100,100,.08)",
    color: on ? "#065f46" : HX.tx3,
  };
}

/* ────────────────── صفوف المعلومات (.ir) ────────────────── */
export const infoRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  py: "9px",
  borderBottom: `0.5px solid ${HX.border}`,
  "&:first-of-type": { pt: 0 },
  "&:last-of-type": { borderBottom: "none", pb: 0 },
};
export function infoIcoSx(bg: string, color: string): SxProps<Theme> {
  return {
    width: 28,
    height: 28,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    bgcolor: bg,
    color,
    "& svg": { fontSize: 13 },
  };
}
export const infoLabelSx: SxProps<Theme> = {
  fontSize: "11.5px",
  color: HX.tx3,
  fontWeight: 500,
  minWidth: 90,
  fontFamily: FONT,
};
export const infoValSx: SxProps<Theme> = {
  fontSize: "13px",
  fontWeight: 600,
  color: HX.tx,
  flex: 1,
  fontFamily: FONT,
};

/* ────────────────── ترويسة البنك الداكنة ────────────────── */
export const bankHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  p: "12px 14px",
  background: "linear-gradient(135deg,#0f1117,#1a1f2e)",
  borderRadius: "10px",
  mb: "12px",
};
export const bankHeaderIcoSx: SxProps<Theme> = {
  width: 36,
  height: 36,
  borderRadius: "8px",
  bgcolor: "rgba(255,255,255,.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#fff",
  "& svg": { fontSize: 16 },
};
export const monoValSx: SxProps<Theme> = {
  fontFamily: "monospace",
  fontSize: "12.5px",
  letterSpacing: "0.5px",
  color: HX.tx,
  flex: 1,
};
export function copyBtnSx(copied: boolean): SxProps<Theme> {
  return {
    width: 24,
    height: 24,
    borderRadius: "6px",
    border: `0.5px solid ${HX.border}`,
    bgcolor: copied ? HX.greenLight : HX.surface2,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: copied ? HX.green : HX.tx3,
    flexShrink: 0,
    transition: ".15s",
    "& svg": { fontSize: 13 },
    "&:hover": { borderColor: HX.accent, color: HX.accent },
  };
}

/* ────────────────── سجل النشاط (.tl-item) ────────────────── */
export const tlItemSx: SxProps<Theme> = {
  display: "flex",
  gap: "10px",
  py: "10px",
  borderBottom: `0.5px solid ${HX.border}`,
  "&:first-of-type": { pt: 0 },
  "&:last-of-type": { borderBottom: "none", pb: 0 },
};
export function tlDotSx(bg: string, color: string): SxProps<Theme> {
  return {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    bgcolor: bg,
    color,
    "& svg": { fontSize: 13 },
  };
}
export const tlActionSx: SxProps<Theme> = {
  fontSize: "12.5px",
  fontWeight: 700,
  color: HX.tx,
  fontFamily: FONT,
};
export const tlDetailSx: SxProps<Theme> = {
  fontSize: "11.5px",
  color: HX.tx2,
  mt: "2px",
  fontFamily: FONT,
};
export const tlTimeSx: SxProps<Theme> = {
  fontSize: "10.5px",
  color: HX.tx3,
  mt: "3px",
  fontFamily: FONT,
};

/* ────────────────── أزرار الشريط العلوي ────────────────── */
export type TopBtnVariant = "primary" | "ghost" | "danger";
export function topBtnSx(variant: TopBtnVariant): SxProps<Theme> {
  const base: SxProps<Theme> = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    borderRadius: "9px",
    px: "14px",
    height: 32,
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: FONT,
    cursor: "pointer",
    transition: ".15s",
    "& svg": { fontSize: 15 },
  };
  const variants: Record<TopBtnVariant, SxProps<Theme>> = {
    primary: { bgcolor: HX.accent, color: "#fff", border: "none", "&:hover": { bgcolor: "#5254e0" } },
    ghost: {
      bgcolor: HX.surface2,
      color: HX.tx2,
      border: `0.5px solid ${HX.border}`,
      "&:hover": { borderColor: HX.accent, color: HX.accent },
    },
    danger: {
      bgcolor: HX.redLight,
      color: HX.red,
      border: `0.5px solid rgba(239,68,68,.2)`,
      "&:hover": { bgcolor: HX.red, color: "#fff" },
    },
  };
  return { ...(base as object), ...(variants[variant] as object) };
}

/* ── مسار التنقل (breadcrumb) ── */
export const breadcrumbSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  color: HX.tx3,
  fontFamily: FONT,
};
export const breadcrumbLinkSx: SxProps<Theme> = {
  color: HX.tx2,
  cursor: "pointer",
  fontFamily: FONT,
  "&:hover": { color: HX.accent },
};
export const breadcrumbCurSx: SxProps<Theme> = {
  color: HX.tx,
  fontWeight: 700,
  fontFamily: FONT,
};
