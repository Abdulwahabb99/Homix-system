import React from "react";
import { Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export interface HomixSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** flex basis / width; defaults to a flexible field */
  width?: number | string;
  /** When set, typing never searches: Enter or the search button calls this. */
  onSubmit?: () => void;
  /** Shown as a clear (x) button while the field has text; resets the search. */
  onClear?: () => void;
}

/** Accent-bordered search field shared across filter bars. */
export default function HomixSearchInput({
  value, onChange, placeholder = "بحث...", width, onSubmit, onClear,
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
      {onSubmit ? (
        <Box
          component="button"
          type="button"
          aria-label="بحث"
          onClick={onSubmit}
          sx={{
            display: "flex", alignItems: "center", p: 0, border: "none", bgcolor: "transparent",
            cursor: "pointer", color: HX.tx3, flexShrink: 0, "&:hover": { color: HX.accent },
          }}
        >
          <SearchIcon sx={{ fontSize: 18 }} />
        </Box>
      ) : (
        <SearchIcon sx={{ fontSize: 16, color: HX.tx3, flexShrink: 0 }} />
      )}
      <Box
        component="input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={onSubmit ? (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        } : undefined}
        sx={{
          border: "none", outline: "none", flex: 1, minWidth: 0,
          fontSize: "12.5px", fontFamily: FONT, color: HX.tx, bgcolor: "transparent",
          "&::placeholder": { color: HX.tx3 },
        }}
      />
      {onClear && value ? (
        <Box
          component="button"
          type="button"
          aria-label="مسح البحث"
          onClick={onClear}
          sx={{
            display: "flex", alignItems: "center", p: 0, border: "none", bgcolor: "transparent",
            cursor: "pointer", color: HX.tx3, flexShrink: 0, "&:hover": { color: HX.tx },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </Box>
      ) : null}
    </Box>
  );
}
