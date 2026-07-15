/**
 * أنماط (sx) مشتركة لصفحة الموردين — مطابقة لـ homix_vendors.html على رموز HX.
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { R } from "./constants";

export const FONT = "'Cairo', sans-serif";

/* ── بطاقة KPI ── */
export const kpiCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, p: "13px 15px",
  border: `0.5px solid ${HX.border}`, transition: ".2s", fontFamily: FONT,
  "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.06)", transform: "translateY(-1px)" },
};

/* ── شريط الفلاتر ── */
export const filterBarSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  p: "10px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontFamily: FONT,
};
export const searchInputSx: SxProps<Theme> = {
  fontSize: "12.5px", fontFamily: FONT, px: "10px", height: 32, width: 220,
  border: `0.5px solid ${HX.border}`, borderRadius: "8px", bgcolor: HX.surface,
  color: HX.tx, outline: "none", textAlign: "start", transition: ".15s",
  "&:focus": { borderColor: HX.accent }, "&::placeholder": { color: HX.tx3 },
};
export const selectSx: SxProps<Theme> = {
  fontSize: "12.5px", fontFamily: FONT, px: "10px", height: 32,
  border: `0.5px solid ${HX.border}`, borderRadius: "8px", bgcolor: HX.surface,
  color: HX.tx2, cursor: "pointer", outline: "none", transition: ".15s",
  "&:focus": { borderColor: HX.accent },
};
export const filterSepSx: SxProps<Theme> = { width: "0.5px", height: 22, bgcolor: HX.border, flexShrink: 0 };
export function filterBtnSx(primary?: boolean): SxProps<Theme> {
  return {
    px: "14px", height: 32, borderRadius: "8px", fontSize: "12px", fontWeight: 600,
    fontFamily: FONT, cursor: "pointer", transition: ".15s",
    border: `0.5px solid ${primary ? HX.accent : HX.border}`,
    bgcolor: primary ? HX.accent : HX.surface2, color: primary ? "#fff" : HX.tx2,
    "&:hover": primary ? {} : { borderColor: HX.accent, color: HX.accent },
  };
}

/* ── بطاقة الجدول ── */
export const tableCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`, overflow: "hidden", fontFamily: FONT,
};
export const tableHeadBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  p: "11px 14px", borderBottom: `0.5px solid ${HX.border}`,
};
export const tableSx: SxProps<Theme> = {
  width: "100%", borderCollapse: "collapse", minWidth: 980, fontFamily: FONT,
  "& th": {
    bgcolor: HX.surface2, p: "9px 12px", textAlign: "start", fontWeight: 700,
    color: HX.tx3, fontSize: "10.5px", borderBottom: `0.5px solid ${HX.border}`,
    whiteSpace: "nowrap", letterSpacing: ".3px",
  },
  "& td": { p: "10px 12px", borderBottom: `0.5px solid ${HX.border}`, color: HX.tx, whiteSpace: "nowrap", fontSize: "12.5px", verticalAlign: "middle" },
  "& tbody tr:last-child td": { borderBottom: "none" },
  "& tbody tr:hover td": { bgcolor: "#fafbff" },
};

/* ── خلية المورد ── */
export const vendorAvatarSx: SxProps<Theme> = {
  width: 34, height: 34, borderRadius: "10px", display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: FONT,
};

/* ── شارة مدة الشحن ── */
export type ShipTone = "fast" | "mid" | "slow";
export function shipBadgeSx(tone: ShipTone): SxProps<Theme> {
  const map = {
    fast: { bg: HX.greenLight, color: "#065f46" },
    mid: { bg: HX.amberLight, color: "#92400e" },
    slow: { bg: HX.redLight, color: "#991b1b" },
  }[tone];
  return {
    display: "inline-flex", alignItems: "center", gap: "4px", px: "10px", py: "3px",
    borderRadius: "8px", fontSize: "11.5px", fontWeight: 700, fontFamily: FONT, bgcolor: map.bg, color: map.color,
  };
}

/* ── شارة الحالة ── */
export function statusBadgeSx(active: boolean): SxProps<Theme> {
  return {
    display: "inline-flex", alignItems: "center", gap: "4px", px: "9px", py: "3px",
    borderRadius: "20px", fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap", fontFamily: FONT,
    bgcolor: active ? HX.greenLight : HX.surface3, color: active ? "#065f46" : "#374151",
    "&::before": { content: '""', width: 5, height: 5, borderRadius: "50%", flexShrink: 0, bgcolor: active ? HX.green : HX.tx3 },
  };
}

/* ── مفتاح التبديل ── */
export function toggleSx(active: boolean): SxProps<Theme> {
  return {
    width: 36, height: 20, borderRadius: "10px", cursor: "pointer", position: "relative",
    transition: ".2s", flexShrink: 0, border: "none", outline: "none", p: 0,
    bgcolor: active ? HX.green : HX.border2,
    "&::after": {
      content: '""', width: 14, height: 14, bgcolor: "#fff", borderRadius: "50%",
      position: "absolute", top: 3, insetInlineStart: active ? "3px" : "calc(100% - 17px)",
      transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
    },
  };
}

/* ── أزرار الإجراءات ── */
export type ActBtnVariant = "view" | "edit" | "delete";
export function actBtnSx(variant: ActBtnVariant): SxProps<Theme> {
  const map = {
    view: { bg: HX.accentLight, color: HX.accent, hover: HX.accent },
    edit: { bg: HX.blueLight, color: HX.blue, hover: HX.blue },
    delete: { bg: HX.redLight, color: HX.red, hover: HX.red },
  }[variant];
  return {
    width: 27, height: 27, borderRadius: "8px", border: "none", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", transition: ".15s",
    bgcolor: map.bg, color: map.color, "& svg": { fontSize: 14 },
    "&:hover": { bgcolor: map.hover, color: "#fff" },
  };
}

/* ── الترقيم ── */
export const paginationBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  p: "10px 14px", borderTop: `0.5px solid ${HX.border}`,
};
export function pageBtnSx(active: boolean, disabled?: boolean): SxProps<Theme> {
  return {
    minWidth: 28, height: 28, px: "6px", borderRadius: "7px", cursor: disabled ? "default" : "pointer",
    border: `0.5px solid ${active ? HX.accent : HX.border}`, fontFamily: FONT, fontSize: "12px", fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center", transition: ".15s",
    bgcolor: active ? HX.accent : HX.surface, color: active ? "#fff" : HX.tx2, opacity: disabled ? 0.45 : 1,
    "&:hover": active || disabled ? {} : { bgcolor: HX.surface2 },
  };
}

/* ── أزرار الشريط العلوي ── */
export const addBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "6px", px: "15px", height: 34,
  borderRadius: "9px", border: "none", bgcolor: HX.accent, color: "#fff", cursor: "pointer",
  fontSize: "13px", fontFamily: FONT, fontWeight: 700, transition: ".15s",
  "&:hover": { bgcolor: "#4f46e5" }, "& svg": { fontSize: 18 },
};
export const topGhostBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "6px", px: "14px", height: 34,
  borderRadius: "9px", border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2, cursor: "pointer",
  fontSize: "12px", fontFamily: FONT, fontWeight: 600, transition: ".15s",
  "&:hover": { borderColor: HX.accent, color: HX.accent }, "& svg": { fontSize: 15 },
};
