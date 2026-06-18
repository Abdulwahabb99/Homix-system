import React from "react";
import { Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export interface HomixSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** flex basis / width; defaults to a flexible field */
  width?: number | string;
}

/** Accent-bordered search field shared across filter bars. */
export default function HomixSearchInput({
  value, onChange, placeholder = "بحث...", width,
}: HomixSearchInputProps) {
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: "6px",
        bgcolor: HX.surface, border: `1px solid ${HX.border}`, borderRadius: "10px",
        px: "11px", height: 40, minWidth: 0,
        width, flex: width ? "none" : "1 1 220px",
        "&:focus-within": { borderColor: HX.accent, boxShadow: `0 0 0 2px ${HX.accentLight}` },
      }}
    >
      <SearchIcon sx={{ fontSize: 16, color: HX.tx3, flexShrink: 0 }} />
      <Box
        component="input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
          border: "none", outline: "none", flex: 1, minWidth: 0,
          fontSize: "12.5px", fontFamily: FONT, color: HX.tx, bgcolor: "transparent",
          "&::placeholder": { color: HX.tx3 },
        }}
      />
    </Box>
  );
}
