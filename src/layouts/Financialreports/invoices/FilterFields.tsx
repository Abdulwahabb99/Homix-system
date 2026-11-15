/**
 * حقول فلاتر موحّدة لواجهة الفواتير: تسمية فوق الحقل، ارتفاع 38px، وقائمة اختيار بسهم ظاهر
 * (ثيم Material Dashboard يخفي سهم MuiSelect فنعيد ضبطه محلياً كما في AccountsPanel / الغرامات).
 */
import React, { useEffect, useState } from "react";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../utils/styles";

export const FILTER_H = 38;

export function FilterField({ label, grow = "1 1 170px", maxWidth = 280, children }: {
  label: string; grow?: string; maxWidth?: number; children: React.ReactNode;
}) {
  return (
    <Box sx={{ flex: grow, minWidth: 0, maxWidth: { xs: "none", sm: maxWidth } }}>
      <Typography component="label" sx={{ display: "block", mb: "4px", color: HX.tx2, fontFamily: FONT, fontSize: "11px", fontWeight: 600 }}>{label}</Typography>
      {children}
    </Box>
  );
}

export const selectSx = {
  width: "100%", height: FILTER_H, bgcolor: HX.surface, borderRadius: "10px", fontFamily: FONT, fontSize: "12px",
  "& .MuiSelect-select.MuiSelect-select": {
    display: "flex", alignItems: "center", height: `${FILTER_H}px`, minHeight: 0, boxSizing: "border-box",
    padding: "0 11px !important", paddingInlineEnd: "32px !important", fontFamily: FONT, fontSize: "12px",
  },
  "& .MuiSelect-icon": { display: "block", color: HX.tx3 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent, borderWidth: 1 },
} as const;

export const textInputSx = {
  width: "100%", height: FILTER_H, px: "11px", boxSizing: "border-box", border: `1px solid ${HX.border}`, borderRadius: "10px", bgcolor: HX.surface,
  color: HX.tx, fontFamily: FONT, fontSize: "12px", "&:focus": { outline: "none", borderColor: HX.accent },
} as const;

/** حقل نصي يرسل قيمته للأب بعد 300ms من التوقف عن الكتابة */
export function DebouncedTextField({ label, value, onChange, placeholder, delay = 300 }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; delay?: number;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (draft === value) return undefined;
    const timer = window.setTimeout(() => onChange(draft), delay);
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange, delay]);
  return (
    <FilterField label={label}>
      <Box component="input" aria-label={label} placeholder={placeholder} value={draft}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)} sx={textInputSx} />
    </FilterField>
  );
}

export function VendorSelect({ value, onChange, options }: {
  value: string; onChange: (value: string) => void; options: Array<{ id: number; name: string }>;
}) {
  return (
    <FilterField label="البائع" maxWidth={300}>
      <Select value={value} displayEmpty onChange={(e) => onChange(String(e.target.value))} sx={selectSx} inputProps={{ "aria-label": "البائع" }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320, direction: "rtl" } } }}
        renderValue={(selected) => (selected === "" ? "الكل" : options.find((option) => String(option.id) === selected)?.name ?? "الكل")}>
        <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>الكل</MenuItem>
        {options.map((option) => <MenuItem key={option.id} value={String(option.id)} sx={{ fontFamily: FONT, fontSize: "12px" }}>{option.name}</MenuItem>)}
      </Select>
    </FilterField>
  );
}
