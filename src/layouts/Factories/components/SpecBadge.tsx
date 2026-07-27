/**
 * شارة تخصّص المصنع — اللون مُشتق من اسم التخصّص (التخصصات ديناميكية من الـ meta).
 */
import React from "react";
import { Box } from "@mui/material";
import { specPalette } from "../utils/calc";
import { specBadgeSx } from "../utils/styles";

export default function SpecBadge({ spec }: { spec: string }) {
  if (!spec) return <>—</>;
  const palette = specPalette(spec);
  return (
    <Box component="span" sx={{ ...specBadgeSx, bgcolor: palette.bg, color: palette.text }}>
      {spec}
    </Box>
  );
}
