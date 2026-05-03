/**
 * ثوابت ودوال التنسيق الخاصة بصفحة التذاكر
 * مطابقة لستايل tickets.html (btn-p, btn-g, finput, fsel)
 */

export const BRAND = "#6366f1";

// ─── أزرار ────────────────────────────────────────────────────────────────────

/** زر أساسي (btn-p) */
export const BTN_P = {
  height: "32px",
  px: "14px",
  py: 0,
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "none",
  bgcolor: BRAND,
  color: "#fff",
  border: "none",
  boxShadow: "none",
  minWidth: 0,
  "&:hover": { bgcolor: "#5254e0", boxShadow: "none" },
} as const;

/** زر ثانوي/ghost (btn-g) */
export const BTN_G = {
  height: "32px",
  px: "12px",
  py: 0,
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "none",
  bgcolor: "#f9fafb",
  color: "#6b7280",
  border: "0.5px solid rgba(0,0,0,0.09)",
  boxShadow: "none",
  minWidth: 0,
  "&:hover": {
    borderColor: BRAND,
    color: BRAND,
    bgcolor: "#f9fafb",
    boxShadow: "none",
  },
} as const;

// ─── Filter Bar ───────────────────────────────────────────────────────────────

/** sx لـ input الفلتر (finput) */
export function FINPUT_SX(width: number) {
  return {
    width,
    "& .MuiInputBase-root": {
      height: 32,
      borderRadius: "8px",
      bgcolor: "#fff",
      fontFamily: "'Cairo',sans-serif",
      fontSize: "12px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.09)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.18) !important",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${BRAND} !important`,
    },
    "& .MuiInputBase-input": {
      padding: "0 10px",
      fontSize: "12px",
      color: "#111827",
      fontFamily: "'Cairo',sans-serif",
      "&::placeholder": { color: "#9ca3af", opacity: 1 },
    },
    "& .MuiInputAdornment-root": { marginLeft: 0 },
    "& legend": { display: "none" },
    "& fieldset": { top: 0 },
  } as const;
}

/** sx لـ select الفلتر (fsel) */
export function FSEL_SX(minWidth: number) {
  return {
    minWidth,
    height: 32,
    borderRadius: "8px",
    bgcolor: "#fff",
    fontFamily: "'Cairo',sans-serif",
    fontSize: "12px",
    color: "#6b7280",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.09)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: "0.5px solid rgba(0,0,0,0.18) !important",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${BRAND} !important`,
    },
    "& .MuiSelect-select": {
      padding: "0 10px !important",
      height: "32px !important",
      display: "flex",
      alignItems: "center",
      fontSize: "12px",
      fontFamily: "'Cairo',sans-serif",
    },
  } as const;
}

/** sx لعناصر القائمة المنسدلة */
export const FMENU_SX = {
  fontSize: "12px",
  fontFamily: "'Cairo',sans-serif",
  color: "#374151",
  minHeight: 36,
} as const;

/** sx للحاوية الخارجية لـ filter bar (fbar) */
export const FBAR_SX = {
  bgcolor: "#fff",
  borderRadius: "14px",
  border: "0.5px solid rgba(0,0,0,0.09)",
  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
  p: "10px 14px",
  display: "flex",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
} as const;

/** sx للفاصل العمودي بين مجموعات الفلاتر */
export const FSEP_SX = {
  width: "0.5px",
  height: 24,
  bgcolor: "rgba(0,0,0,0.09)",
  flexShrink: 0,
} as const;
