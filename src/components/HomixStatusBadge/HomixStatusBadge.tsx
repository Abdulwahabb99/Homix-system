import React from "react";
import { Box } from "@mui/material";

const FONT = "'Cairo', sans-serif";

export interface HomixStatusBadgeProps {
  label: string;
  bg: string;
  color: string;
  /** dot color; pass to render a leading status dot */
  dot?: string;
}

/** Pill status badge with an optional leading dot. */
export default function HomixStatusBadge({ label, bg, color, dot }: HomixStatusBadgeProps) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: dot ? "5px" : 0,
        px: "10px", py: "3px", borderRadius: "20px",
        fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap",
        bgcolor: bg, color,
      }}
    >
      {dot && <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />}
      {label}
    </Box>
  );
}
