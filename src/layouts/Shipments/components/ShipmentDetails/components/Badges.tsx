import React from "react";
import { Box } from "@mui/material";
import { FONT, STATUS_COLORS } from "../constants";

const baseSx = {
  display: "inline-flex", alignItems: "center",
  px: "10px", py: "3px", borderRadius: "20px",
  fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap",
} as const;

/** Shipment status badge with a leading colored dot, colored by status id. */
export function StatusBadge({ status, label }: { status: number; label: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS[1];
  return (
    <Box component="span" sx={{ ...baseSx, gap: "4px", bgcolor: c.bg, color: c.color }}>
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0 }} />
      {label}
    </Box>
  );
}

/** Generic pill badge with explicit colors (payment / type / etc). */
export function PlainBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <Box component="span" sx={{ ...baseSx, bgcolor: bg, color }}>
      {label}
    </Box>
  );
}
