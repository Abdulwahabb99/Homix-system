import React from "react";
import {
  Checkbox,
  FormControl,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export interface MultiSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

export interface MultiSelectProps<T extends string | number = string | number> {
  value: T[];
  onChange: (value: T[]) => void;
  options: MultiSelectOption<T>[];
  /** text shown when nothing is selected (e.g. "الكل", "كل المصانع") */
  placeholder?: string;
  /** suffix after the count when more than one is selected (default: "محدد") */
  countSuffix?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  /** fired when the dropdown closes (e.g. to apply the current selection) */
  onClose?: () => void;
  /** override / extend the default Select styling */
  sx?: SxProps<Theme>;
}

const defaultSelectSx = {
  height: 34,
  borderRadius: "8px",
  fontSize: "12.5px",
  fontFamily: FONT,
  bgcolor: HX.surface,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: HX.accent,
    borderWidth: 1,
    boxShadow: `0 0 0 3px ${HX.accentLight}`,
  },
} as const;

const MENU_PROPS = {
  PaperProps: {
    sx: {
      borderRadius: "10px",
      mt: "5px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      "& .MuiMenuItem-root": { fontFamily: FONT, fontSize: "12.5px" },
    },
  },
};

/**
 * Shared multi-select dropdown: checkbox items, the menu stays open while picking
 * (closes only on outside click), and a compact "الكل / single label / N محدد"
 * trigger. Use everywhere a multi-value filter dropdown is needed instead of
 * re-implementing the Select + Checkbox + renderValue logic each time.
 */
export default function MultiSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "الكل",
  countSuffix = "محدد",
  disabled,
  fullWidth = true,
  onClose,
  sx,
}: MultiSelectProps<T>) {
  return (
    <FormControl fullWidth={fullWidth} size="small" disabled={disabled}>
      <Select
        multiple
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value as T[])}
        onClose={onClose}
        input={<OutlinedInput />}
        MenuProps={MENU_PROPS}
        sx={{ ...defaultSelectSx, ...(sx as object) }}
        renderValue={(selected) => {
          const sel = selected as T[];
          if (sel.length === 0) {
            return <span style={{ color: HX.tx3, fontFamily: FONT }}>{placeholder}</span>;
          }
          if (sel.length === 1) {
            const label = options.find((o) => o.value === sel[0])?.label ?? String(sel[0]);
            return <span style={{ fontFamily: FONT }}>{label}</span>;
          }
          return <span style={{ fontFamily: FONT }}>{sel.length} {countSuffix}</span>;
        }}
      >
        {options.map((o) => (
          <MenuItem key={String(o.value)} value={o.value as string | number} dense>
            <Checkbox size="small" checked={value.includes(o.value)} sx={{ py: 0, mr: 0.5 }} />
            <ListItemText
              primary={o.label}
              primaryTypographyProps={{ fontSize: "12.5px", fontFamily: FONT }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
