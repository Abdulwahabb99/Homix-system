import React from "react";
import { MenuItem, TextField } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";
import type { SelectOption } from "../constants";

/**
 * Mirrors the field look used across the system (see ShipmentEdit): rounded 10px,
 * 12px text, HX.border outline that turns accent on hover/focus, fixed 44px height
 * for single-line fields, floating label with an open notch.
 */
export const inputSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: FONT,
    fontSize: "12px",
    bgcolor: HX.surface,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-input": { fontSize: "12px", fontFamily: FONT, color: "#000" },
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": { height: "44px" },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    height: "100%",
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
  },
  "& .MuiSelect-select.MuiSelect-select": {
    minHeight: "unset",
    height: "100%",
    boxSizing: "border-box",
    paddingTop: 0,
    paddingBottom: 0,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputLabel-root": {
    fontFamily: FONT,
    fontSize: "12px",
    color: "#000",
    "&.MuiInputLabel-shrink": { fontSize: "11px" },
    "&.Mui-focused": { color: HX.accent },
  },
  "& .MuiMenuItem-root": { fontFamily: FONT },
} as const;

export const fieldBaseProps = {
  fullWidth: true,
  size: "small" as const,
  sx: inputSx,
  InputLabelProps: { shrink: true },
} as const;

export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputProps?: Record<string, unknown>;
}

export function TextInput({ label, value, onChange, type = "text", required, placeholder, inputProps }: TextInputProps) {
  return (
    <TextField
      {...fieldBaseProps}
      label={label}
      required={required}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={inputProps}
    />
  );
}

export interface SelectInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
}

export function SelectInput({ label, value, onChange, options, required, disabled }: SelectInputProps) {
  return (
    <TextField
      {...fieldBaseProps}
      select
      label={label}
      required={required}
      disabled={disabled}
      value={value === "" ? "" : Number(value)}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value} sx={{ fontFamily: FONT }}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
