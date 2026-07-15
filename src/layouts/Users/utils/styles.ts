/**
 * أنماط (sx) مشتركة لصفحة المستخدمين — مطابقة لـ homix_users.html على رموز HX.
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { R } from "./constants";

export const FONT = "'Cairo', sans-serif";

/* ── بطاقة KPI (.kc) ── */
export const kpiCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, p: "13px 15px",
  border: `0.5px solid ${HX.border}`, transition: ".2s", fontFamily: FONT,
  "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.06)", transform: "translateY(-1px)" },
};

/* ── شريط الفلاتر (.fbar) ── */
export const filterBarSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  p: "10px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontFamily: FONT,
};
export const searchInputSx: SxProps<Theme> = {
  fontSize: "12.5px", fontFamily: FONT, px: "10px", height: 32, width: 220,
  border: `0.5px solid ${HX.border}`, borderRadius: "8px", bgcolor: HX.surface,
  color: HX.tx, outline: "none", textAlign: "start", transition: ".15s",
  "&:focus": { borderColor: HX.accent },
  "&::placeholder": { color: HX.tx3 },
};
export const filterSepSx: SxProps<Theme> = { width: "0.5px", height: 22, bgcolor: HX.border, flexShrink: 0 };

/* ── تبويب الدور (.rtab) ── */
export function roleTabSx(active: boolean): SxProps<Theme> {
  return {
    px: "14px", py: "5px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
    fontFamily: FONT, cursor: "pointer", transition: ".15s", userSelect: "none", whiteSpace: "nowrap",
    border: active ? `0.5px solid ${HX.accentBorder}` : "0.5px solid transparent",
    bgcolor: active ? HX.accentLight : HX.surface2,
    color: active ? HX.accent : HX.tx2,
    "&:hover": active ? {} : { color: HX.accent },
  };
}

/* ── بطاقة الجدول (.tcard) ── */
export const tableCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`, overflow: "hidden", fontFamily: FONT,
};
export const tableHeadBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`,
};
export const exportBtnSx: SxProps<Theme> = {
  px: "12px", height: 28, border: `0.5px solid ${HX.border}`, borderRadius: "7px",
  fontSize: "11.5px", fontWeight: 600, fontFamily: FONT, cursor: "pointer",
  bgcolor: HX.surface2, color: HX.tx2, transition: ".15s",
  "&:hover": { borderColor: HX.accent, color: HX.accent },
};

/* ── الجدول ── */
export const tableSx: SxProps<Theme> = {
  width: "100%", borderCollapse: "collapse", fontFamily: FONT,
  "& th": {
    bgcolor: HX.surface2, p: "9px 12px", textAlign: "start", fontWeight: 700,
    color: HX.tx3, fontSize: "10.5px", borderBottom: `0.5px solid ${HX.border}`,
    whiteSpace: "nowrap", letterSpacing: ".3px",
  },
  "& td": { p: "10px 12px", borderBottom: `0.5px solid ${HX.border}`, verticalAlign: "middle" },
  "& tbody tr:last-child td": { borderBottom: "none" },
  "& tbody tr:hover td": { bgcolor: "#fafbff" },
};

/* ── خلية المستخدم ── */
export const userAvatarSx: SxProps<Theme> = {
  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: FONT,
};

/* ── شارة الدور (.role-bdg) ── */
export function roleBadgeSx(bg: string, color: string): SxProps<Theme> {
  return {
    display: "inline-flex", alignItems: "center", gap: "4px", px: "11px", py: "4px",
    borderRadius: "7px", fontSize: "11.5px", fontWeight: 700, whiteSpace: "nowrap",
    fontFamily: FONT, bgcolor: bg, color,
  };
}

/* ── أزرار الإجراءات (.abt) ── */
export type ActBtnVariant = "edit" | "delete";
export function actBtnSx(variant: ActBtnVariant): SxProps<Theme> {
  const map = {
    edit:   { bg: HX.blueLight, color: HX.blue, hover: HX.blue },
    delete: { bg: HX.redLight,  color: HX.red,  hover: HX.red },
  }[variant];
  return {
    width: 28, height: 28, borderRadius: "8px", border: "none", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", transition: ".15s",
    bgcolor: map.bg, color: map.color, "& svg": { fontSize: 15 },
    "&:hover": { bgcolor: map.hover, color: "#fff" },
  };
}

/* ── الترقيم (.pg) ── */
export const paginationBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  p: "10px 14px", borderTop: `0.5px solid ${HX.border}`,
};
export function pageBtnSx(active: boolean, disabled?: boolean): SxProps<Theme> {
  return {
    minWidth: 28, height: 28, px: "6px", borderRadius: "7px", cursor: disabled ? "default" : "pointer",
    border: `0.5px solid ${active ? HX.accent : HX.border}`, fontFamily: FONT, fontSize: "12px", fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center", transition: ".15s",
    bgcolor: active ? HX.accent : HX.surface, color: active ? "#fff" : HX.tx2,
    opacity: disabled ? 0.45 : 1,
    "&:hover": active || disabled ? {} : { bgcolor: HX.surface2 },
  };
}

/* ── زر إضافة في الشريط العلوي ── */
export const addBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "6px", px: "15px", height: 36,
  borderRadius: "9px", border: "none", bgcolor: HX.accent, color: "#fff", cursor: "pointer",
  fontSize: "13px", fontFamily: FONT, fontWeight: 700, transition: ".15s",
  "&:hover": { bgcolor: "#4f46e5" }, "& svg": { fontSize: 18 },
};
