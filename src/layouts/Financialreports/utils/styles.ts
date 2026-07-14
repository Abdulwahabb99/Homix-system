/**
 * أنماط (sx) مشتركة لصفحة التقارير المالية — مطابقة لـ homix_financial_reports.html.
 * تعتمد على رموز التصميم HX + زوايا R/R_SM. الخصائص المنطقية (inline-start/end)
 * مستخدمة لتفادي انقلاب RTL.
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { R, R_SM } from "./constants";

export const FONT = "'Cairo', sans-serif";

/** لون دلالي مشترك للمبالغ والقيم */
export type Tone = "default" | "green" | "red" | "amber" | "accent";
export function toneColor(tone: Tone = "default"): string {
  switch (tone) {
    case "green": return HX.green;
    case "red": return HX.red;
    case "amber": return HX.amber;
    case "accent": return HX.accent;
    default: return HX.tx;
  }
}

/* ── شريط الدورة (period-bar) ── */
export const periodBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  p: "14px 18px", fontFamily: FONT,
};
export function periodPillSx(active: boolean): SxProps<Theme> {
  return {
    px: "16px", py: "6px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
    fontFamily: FONT, cursor: "pointer", transition: ".15s", userSelect: "none",
    border: `0.5px solid ${active ? HX.accent : HX.border}`,
    color: active ? "#fff" : HX.tx2,
    bgcolor: active ? HX.accent : HX.surface2,
    "&:hover": active ? {} : { borderColor: HX.accent, color: HX.accent },
  };
}

/* ── بطاقة KPI ── */
export const kpiCardSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, p: "16px 18px",
  border: `0.5px solid ${HX.border}`, transition: ".2s", fontFamily: FONT,
  "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.06)", transform: "translateY(-1px)" },
};

/* ── حاوية التبويبات ── */
export const tabsWrapSx: SxProps<Theme> = {
  bgcolor: HX.surface, borderRadius: R, border: `0.5px solid ${HX.border}`,
  overflow: "hidden", fontFamily: FONT,
};
export const tabsHeadSx: SxProps<Theme> = {
  display: "flex", borderBottom: `0.5px solid ${HX.border}`, bgcolor: HX.surface2,
};
export function tabSx(active: boolean): SxProps<Theme> {
  return {
    flex: 1, px: "16px", py: "14px", fontSize: "13px", fontWeight: 600, fontFamily: FONT,
    cursor: "pointer", transition: ".15s", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px", whiteSpace: "nowrap",
    color: active ? HX.accent : HX.tx2,
    borderBottom: `2px solid ${active ? HX.accent : "transparent"}`,
    bgcolor: active ? HX.surface : "transparent",
    "&:hover": { color: HX.tx, bgcolor: active ? HX.surface : "rgba(0,0,0,.02)" },
  };
}
export function tabCountSx(active: boolean): SxProps<Theme> {
  return {
    fontSize: "10px", px: "7px", py: "2px", borderRadius: "8px", fontWeight: 700,
    bgcolor: active ? HX.accent : HX.accentLight, color: active ? "#fff" : HX.accent,
  };
}

/* ── ترويسة قائمة الصناع ── */
export function sellersHeaderSx(gridTemplate: string): SxProps<Theme> {
  return {
    display: "grid", gridTemplateColumns: gridTemplate, alignItems: "center", gap: "10px",
    p: "12px 18px", borderBottom: `0.5px solid ${HX.border}`, bgcolor: HX.surface2,
  };
}
export const headerCellSx: SxProps<Theme> = {
  fontSize: "11px", fontWeight: 700, color: HX.tx3,
  textTransform: "uppercase", letterSpacing: ".5px", fontFamily: FONT,
};

/* ── صف الصانع الرئيسي ── */
export function sellerRowSx(gridTemplate: string, expanded: boolean): SxProps<Theme> {
  return {
    display: "grid", gridTemplateColumns: gridTemplate, alignItems: "center", gap: "10px",
    p: "13px 18px", cursor: "pointer", transition: ".15s",
    bgcolor: expanded ? HX.accentLight : HX.surface,
    borderInlineStart: expanded ? `3px solid ${HX.accent}` : "3px solid transparent",
    "&:hover": { bgcolor: expanded ? HX.accentLight : "#fafbff" },
  };
}
export const sellerAvSx: SxProps<Theme> = {
  width: 34, height: 34, borderRadius: "50%", display: "flex",
  alignItems: "center", justifyContent: "center", fontSize: "13px",
  fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: FONT,
};
export function amountCellSx(tone: Tone = "default"): SxProps<Theme> {
  return { fontSize: "13px", fontWeight: 800, color: toneColor(tone), textAlign: "end", fontFamily: FONT };
}
export function expandIconSx(expanded: boolean): SxProps<Theme> {
  return {
    width: 26, height: 26, borderRadius: "7px", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0, marginInlineStart: "auto", transition: ".3s",
    border: `0.5px solid ${expanded ? HX.accentBorder : HX.border}`,
    bgcolor: expanded ? HX.accentLight : HX.surface2,
    color: expanded ? HX.accent : HX.tx3,
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  };
}

/* ── لوحة التفاصيل ── */
export const detailWrapSx: SxProps<Theme> = {
  bgcolor: "#fafbff", borderTop: `0.5px solid ${HX.border}`, fontFamily: FONT,
};
export const detailHeaderBarSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  p: "12px 18px 8px", borderBottom: `0.5px solid ${HX.border}`,
};
export const detailTitleSx: SxProps<Theme> = {
  fontSize: "12.5px", fontWeight: 700, color: HX.accent, fontFamily: FONT,
};
export const dactBtnSx: SxProps<Theme> = {
  display: "inline-flex", alignItems: "center", gap: "5px", px: "12px", py: "5px",
  border: `0.5px solid ${HX.border}`, borderRadius: "7px", fontSize: "11.5px",
  fontWeight: 600, fontFamily: FONT, cursor: "pointer", bgcolor: HX.surface, color: HX.tx2,
  transition: ".15s", "&:hover": { borderColor: HX.accent, color: HX.accent },
  "& svg": { fontSize: 14 },
};

/* ── جدول التفاصيل ── */
export const detailTableSx: SxProps<Theme> = {
  width: "100%", borderCollapse: "collapse", fontFamily: FONT,
  "& th": {
    fontSize: "11px", fontWeight: 700, color: HX.tx3, textAlign: "start",
    p: "9px 14px", bgcolor: HX.surface2, borderBottom: `0.5px solid ${HX.border}`,
    whiteSpace: "nowrap", letterSpacing: ".3px",
  },
  "& td": {
    fontSize: "12.5px", p: "10px 14px", borderBottom: `0.5px solid ${HX.border}`,
    color: HX.tx, whiteSpace: "nowrap",
  },
  "& tbody tr:last-child td": { borderBottom: "none" },
  "& tbody tr:hover td": { bgcolor: "rgba(99,102,241,.03)" },
};

/* ── خلايا مميّزة داخل الجدول ── */
export const opIdSx: SxProps<Theme> = { color: HX.accent, fontWeight: 700 };
export const prodCodeSx: SxProps<Theme> = {
  fontFamily: "monospace", fontSize: "12px", bgcolor: HX.surface2,
  p: "2px 7px", borderRadius: "5px", color: HX.tx2,
};
export function payBadgeSx(pay: "cod" | "online"): SxProps<Theme> {
  const cod = pay === "cod";
  return {
    display: "inline-block", px: "9px", py: "2px", borderRadius: "20px",
    fontSize: "10.5px", fontWeight: 700, fontFamily: FONT,
    bgcolor: cod ? HX.amberLight : HX.greenLight,
    color: cod ? "#92400e" : "#065f46",
  };
}

/* ── تذييل الإجماليات (المخزن/البائع) ── */
export const detailFooterSx: SxProps<Theme> = {
  borderTop: `1.5px solid ${HX.border2}`, bgcolor: HX.surface,
};
export const detailTotalRowSx: SxProps<Theme> = {
  display: "flex", alignItems: "center", justifyContent: "flex-end",
  gap: "24px", p: "12px 18px", flexWrap: "wrap",
};
export const dtLabelSx: SxProps<Theme> = { fontSize: "11.5px", color: HX.tx2, fontWeight: 500, fontFamily: FONT };
export function dtValSx(tone: Tone = "default"): SxProps<Theme> {
  return { fontSize: "14px", fontWeight: 800, color: toneColor(tone), fontFamily: FONT };
}
export const dtSepSx: SxProps<Theme> = { width: "0.5px", height: 24, bgcolor: HX.border, flexShrink: 0 };

/* ── ملخّص الفاتورة الشاملة ── */
export const compSummarySx: SxProps<Theme> = {
  background: `linear-gradient(135deg, ${HX.accentLight}, rgba(99,102,241,.05))`,
  borderTop: `1px solid ${HX.accentBorder}`, p: "14px 18px",
  display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap",
};
export function csValSx(tone: Tone = "default"): SxProps<Theme> {
  return { fontSize: "18px", fontWeight: 900, color: toneColor(tone), fontFamily: FONT };
}
export const csLabelSx: SxProps<Theme> = { fontSize: "10.5px", color: HX.tx3, fontWeight: 500, fontFamily: FONT };
export const csDividerSx: SxProps<Theme> = { width: "0.5px", height: 36, bgcolor: HX.border2, flexShrink: 0 };
export const csNoteSx: SxProps<Theme> = {
  marginInlineStart: "auto", fontSize: "12px", color: HX.tx2, bgcolor: HX.surface,
  border: `0.5px solid ${HX.border}`, borderRadius: "8px", p: "6px 14px", fontFamily: FONT,
};
