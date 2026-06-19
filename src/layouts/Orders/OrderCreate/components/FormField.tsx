import React from "react";
import { Box, Typography } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";
import type { SelectOption } from "../constants";

const controlSx = {
  width: "100%", height: 36, px: "12px",
  border: `0.5px solid ${HX.border}`, borderRadius: "9px",
  fontFamily: FONT, fontSize: "13px", color: HX.tx, bgcolor: HX.surface, outline: "none",
  transition: ".15s",
  "&:focus": { borderColor: HX.accent, boxShadow: "0 0 0 3px rgba(99,102,241,0.08)" },
  "&::placeholder": { color: HX.tx3 },
} as const;

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Typography component="label" sx={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color: HX.tx2, display: "flex", alignItems: "center", gap: "4px" }}>
      {children}
      {required && <Box component="span" sx={{ color: HX.red }}>*</Box>}
    </Typography>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </Box>
  );
}

export function TextInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <Box
      component="input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      sx={{ ...controlSx, textAlign: "right" }}
    />
  );
}

export function SelectInput({
  value, onChange, options,
}: {
  value: number | string; onChange: (v: number) => void; options: SelectOption[];
}) {
  return (
    <Box
      component="select"
      value={String(value)}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(Number(e.target.value))}
      sx={{ ...controlSx, cursor: "pointer" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Box>
  );
}
