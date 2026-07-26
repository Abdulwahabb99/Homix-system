/**
 * أنماط (sx) مشتركة لصفحة الصنّاع — مطابقة لـ homix_factories_v3.html.
 *
 * تنبيه RTL: كل ما يمرّ عبر `sx` يعبر stylis-plugin-rtl فتُقلب الخصائص الفيزيائية
 * (`textAlign: right` → left، `marginRight` → marginLeft). لذلك تُستخدم هنا
 * الخصائص المنطقية فقط (`start`/`end`، `marginInline*`). أنماط الجداول تُمرَّر
 * كـ inline style على th/td لأنها لا تعبر emotion.
 */
import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { R, R_SM } from "./constants";

export const FONT = "'Cairo', sans-serif";

/* ── أزرار الشريط العلوي ── */
export const ghostBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "5px", height: 34, px: "13px",
  bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, borderRadius: R_SM,
  fontSize: "12px", fontWeight: 600, fontFamily: FONT, color: HX.tx2, cursor: "pointer",
  transition: ".15s", "&:hover": { borderColor: HX.accent, color: HX.accent },
  "& svg": { fontSize: 15 },
};

export const primaryBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "6px", height: 34, px: "16px",
  bgcolor: HX.accent, color: "#fff", border: "none", borderRadius: R_SM,
  fontSize: "12.5px", fontWeight: 700, fontFamily: FONT, cursor: "pointer",
  transition: ".15s", "&:hover": { bgcolor: "#5254e0", boxShadow: `0 4px 14px ${HX.accentBorder}` },
  "& svg": { fontSize: 15 },
};

/* ── بطاقة KPI ── */
export const kpiCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, p: "14px 16px",
  border: `0.5px solid ${HX.border}`, transition: ".2s", fontFamily: FONT,
  "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.06)", transform: "translateY(-1px)" },
};

/* ── شريط الفلاتر ── */
export const filterBarSx: SxProps<Theme> = {
  flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  p: "8px 12px", fontFamily: FONT,
};

/** حقل نص/قائمة داخل شريط الفلاتر — ارتفاع 32px كما في التصميم */
export const filterFieldSx: SxProps<Theme> = {
  fontFamily: FONT, fontSize: "12px",
  "& .MuiOutlinedInput-root": {
    height: 32, borderRadius: "8px", bgcolor: HX.surface,
    fontSize: "12px", fontFamily: FONT,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-input": { fontSize: "12px", fontFamily: FONT, color: HX.tx, py: 0 },
  "& .MuiSelect-select.MuiSelect-select": {
    minHeight: "unset", height: "100%", boxSizing: "border-box",
    display: "flex", alignItems: "center", py: 0,
  },
};

export const filterSepSx: SxProps<Theme> = {
  width: "0.5px", height: 24, bgcolor: HX.border, flexShrink: 0,
};

export function filterBtnSx(primary: boolean): SxProps<Theme> {
  return {
    px: "14px", height: 32, borderRadius: "8px", fontSize: "12px", fontWeight: 600,
    fontFamily: FONT, cursor: "pointer", transition: ".15s", whiteSpace: "nowrap",
    border: `0.5px solid ${primary ? HX.accent : HX.border}`,
    bgcolor: primary ? HX.accent : HX.surface2,
    color: primary ? "#fff" : HX.tx2,
    "&:hover": primary ? {} : { borderColor: HX.accent, color: HX.accent },
  };
}

/* ── مبدّل العرض (جدول / بطاقات) ── */
export const viewToggleSx: SxProps<Theme> = {
  display: "flex", bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`,
  borderRadius: R_SM, overflow: "hidden", flexShrink: 0,
};

export function viewToggleBtnSx(active: boolean): SxProps<Theme> {
  return {
    display: "inline-flex", alignItems: "center", gap: "5px", px: "14px", py: "7px",
    border: "none", cursor: "pointer", transition: ".15s", whiteSpace: "nowrap",
    fontSize: "12px", fontWeight: 600, fontFamily: FONT,
    bgcolor: active ? HX.surface : "transparent",
    color: active ? HX.accent : HX.tx3,
    boxShadow: active ? "0 1px 4px rgba(0,0,0,.06)" : "none",
    "&:hover": active ? {} : { color: HX.tx },
    "& svg": { fontSize: 14 },
  };
}

/* ── بطاقة الجدول ── */
export const tableCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  overflow: "hidden", fontFamily: FONT,
};

export const tableHeadBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: "10px", p: "12px 16px", borderBottom: `0.5px solid ${HX.border}`,
};

/* ── خلايا الجدول (inline style — لا تعبر stylis) ── */
export const TH: CSSProperties = {
  background: HX.surface2, padding: "9px 12px", textAlign: "right",
  fontWeight: 700, color: HX.tx3, fontSize: "10.5px", fontFamily: FONT,
  borderBottom: `0.5px solid ${HX.border}`, whiteSpace: "nowrap",
  letterSpacing: ".3px", userSelect: "none",
};

export const TD: CSSProperties = {
  padding: "10px 12px", borderBottom: `0.5px solid ${HX.border}`,
  color: HX.tx, whiteSpace: "nowrap", fontSize: "12.5px",
  fontFamily: FONT, verticalAlign: "middle",
};

/* ── شارات ── */
export const specBadgeSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", px: "10px", py: "3px",
  borderRadius: "6px", fontSize: "11px", fontWeight: 700,
  fontFamily: FONT, whiteSpace: "nowrap",
};

export function statusBadgeSx(online: boolean): SxProps<Theme> {
  return {
    display: "inline-flex", alignItems: "center", gap: "3px", px: "10px", py: "3px",
    borderRadius: "20px", fontSize: "10.5px", fontWeight: 700, fontFamily: FONT,
    whiteSpace: "nowrap",
    bgcolor: online ? HX.greenLight : "rgba(100,100,100,.1)",
    color: online ? "#065f46" : "#374151",
    "&::before": {
      content: '""', width: "5px", height: "5px", borderRadius: "50%",
      flexShrink: 0, bgcolor: online ? HX.green : "#9ca3af",
    },
  };
}

/* ── صورة الحرف (avatar) ── */
export function avatarSx(size: number, radius: string, fontSize: string): SxProps<Theme> {
  return {
    width: size, height: size, borderRadius: radius, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    fontSize, fontWeight: 800, color: "#fff", fontFamily: FONT,
  };
}

/* ── رابط الويب سايت ── */
export const linkCellSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "5px", color: HX.accent,
  fontSize: "11.5px", fontFamily: FONT, cursor: "pointer", maxWidth: 140,
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  "&:hover": { textDecoration: "underline" },
  "& svg": { fontSize: 12, flexShrink: 0 },
};

/* ── أزرار الإجراءات في الجدول ── */
export type ActionTone = "view" | "edit" | "delete";

export function actionBtnSx(tone: ActionTone): SxProps<Theme> {
  const map = {
    view: { bg: HX.accentLight, color: HX.accent, hover: HX.accent },
    edit: { bg: HX.blueLight, color: HX.blue, hover: HX.blue },
    delete: { bg: HX.redLight, color: HX.red, hover: HX.red },
  }[tone];
  return {
    width: 28, height: 28, borderRadius: "8px", border: "none", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: ".15s", bgcolor: map.bg, color: map.color,
    "&:hover": { bgcolor: map.hover, color: "#fff" },
    "& svg": { fontSize: 13 },
  };
}

/* ── الترقيم ── */
export const paginationBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: "10px", p: "10px 16px", borderTop: `0.5px solid ${HX.border}`, flexWrap: "wrap",
};

export function pageBtnSx(active: boolean, disabled?: boolean): SxProps<Theme> {
  return {
    width: 28, height: 28, borderRadius: "7px", cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: 500, fontFamily: FONT, transition: ".15s",
    border: `0.5px solid ${active ? HX.accent : HX.border}`,
    bgcolor: active ? HX.accent : HX.surface,
    color: active ? "#fff" : HX.tx2,
    opacity: disabled ? 0.45 : 1,
    "&:hover": active || disabled ? {} : { bgcolor: HX.surface2 },
  };
}

/* ── بطاقة مصنع (عرض البطاقات) ── */
export const cardsGridSx: SxProps<Theme> = {
  display: "grid", gap: "14px",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
};

export const factoryCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: R,
  overflow: "hidden", transition: ".25s", fontFamily: FONT,
  "&:hover": {
    boxShadow: "0 8px 28px rgba(0,0,0,.08)",
    transform: "translateY(-3px)",
    borderColor: HX.accent,
  },
};

export const cardTopSx: SxProps<Theme> = {
  display: "flex", gap: "12px", alignItems: "flex-start",
  p: "18px", borderBottom: `0.5px solid ${HX.border}`,
};

export const cardRowSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: "10px", py: "6px", borderBottom: `0.5px solid ${HX.border}`,
  "&:first-of-type": { pt: 0 },
  "&:last-of-type": { borderBottom: "none", pb: 0 },
};

export const cardFootSx: SxProps<Theme> = {
  display: "flex", gap: "6px", p: "10px 18px", borderTop: `0.5px solid ${HX.border}`,
};

export function cardBtnSx(tone: ActionTone): SxProps<Theme> {
  const map = {
    view: { bg: HX.accentLight, color: HX.accent, hover: HX.accent },
    edit: { bg: HX.blueLight, color: HX.blue, hover: HX.blue },
    delete: { bg: HX.redLight, color: HX.red, hover: HX.red },
  }[tone];
  return {
    flex: 1, p: "7px", borderRadius: "8px", border: "none", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
    fontSize: "11.5px", fontWeight: 700, fontFamily: FONT, transition: ".15s",
    bgcolor: map.bg, color: map.color,
    "&:hover": { bgcolor: map.hover, color: "#fff" },
    "& svg": { fontSize: 13 },
  };
}

/* ── النموذج (modal) ── */
export const modalPaperSx: SxProps<Theme> = {
  borderRadius: "16px", bgcolor: HX.surface, fontFamily: FONT,
  width: 580, maxWidth: "94vw",
};

export const modalHeadSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
  p: "18px 22px", borderBottom: `0.5px solid ${HX.border}`,
  position: "sticky", top: 0, bgcolor: HX.surface, zIndex: 1,
};

export const modalFootSx: SxProps<Theme> = {
  display: "flex", justifyContent: "flex-end", gap: "8px",
  p: "14px 22px", borderTop: `0.5px solid ${HX.border}`,
  position: "sticky", bottom: 0, bgcolor: HX.surface, zIndex: 1,
};

export const sectionTitleSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700,
  color: HX.tx, pb: "10px", mb: "10px", borderBottom: `0.5px solid ${HX.border}`,
  fontFamily: FONT, "& svg": { fontSize: 14, color: HX.accent },
};

export function formRowSx(single?: boolean): SxProps<Theme> {
  return {
    display: "grid", gap: "14px", mb: "14px",
    gridTemplateColumns: single ? "1fr" : { xs: "1fr", sm: "1fr 1fr" },
  };
}

export const fieldLabelSx: SxProps<Theme> = {
  display: "block", fontSize: "11.5px", fontWeight: 700,
  color: HX.tx2, mb: "5px", fontFamily: FONT,
};

/** حقل النموذج — ارتفاع 36px كما في التصميم */
export const modalFieldSx: SxProps<Theme> = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    height: 36, borderRadius: R_SM, bgcolor: HX.surface,
    fontSize: "13px", fontFamily: FONT,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-input": { fontSize: "13px", fontFamily: FONT, color: HX.tx, py: 0 },
  "& .MuiSelect-select.MuiSelect-select": {
    minHeight: "unset", height: "100%", boxSizing: "border-box",
    display: "flex", alignItems: "center", py: 0,
  },
};

export const modalDividerSx: SxProps<Theme> = {
  border: "none", borderTop: `0.5px solid ${HX.border}`, my: "14px",
};

/* ── المرفقات ── */
export const attUploadTriggerSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "4px", px: "8px", py: "3px",
  borderRadius: "6px", cursor: "pointer", transition: ".15s",
  fontSize: "11px", fontWeight: 700, fontFamily: FONT,
  bgcolor: HX.accentLight, color: HX.accent, border: `0.5px solid ${HX.accentBorder}`,
  "&:hover": { bgcolor: HX.accent, color: "#fff" },
  "& svg": { fontSize: 12 },
};

export function attDropZoneSx(dragOver: boolean): SxProps<Theme> {
  return {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
    border: `1.5px dashed ${dragOver ? HX.accent : HX.border2}`, borderRadius: R_SM,
    p: "12px", mt: "6px", cursor: "pointer", transition: ".15s",
    fontSize: "11.5px", fontFamily: FONT,
    bgcolor: dragOver ? HX.accentLight : HX.surface2,
    color: dragOver ? HX.accent : HX.tx3,
    "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight, color: HX.accent },
    "& svg": { fontSize: 16 },
  };
}

export const attItemSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "8px", p: "8px 10px",
  bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: "8px",
  transition: ".15s", "&:hover": { borderColor: HX.accent },
};

export const attDeleteBtnSx: SxProps<Theme> = {
  width: 24, height: 24, borderRadius: "6px", flexShrink: 0, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx3,
  transition: ".15s",
  "&:hover": { bgcolor: HX.redLight, borderColor: HX.red, color: HX.red },
  "& svg": { fontSize: 12 },
};

/* ── حالة فارغة ── */
export const emptyStateSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "center",
  p: "48px 18px", fontSize: "13px", fontFamily: FONT, color: HX.tx3,
};
