/**
 * تذييل إجماليات لوحة التفاصيل (تسويات المخزن/البائع) — صف قيم مع فواصل رأسية.
 */
import React from "react";
import { Box } from "@mui/material";
import { detailFooterSx, detailTotalRowSx, dtLabelSx, dtValSx, dtSepSx, Tone } from "../utils/styles";

export interface TotalItem {
  label: string;
  value: string;
  tone?: Tone;
}

export default function DetailTotalsRow({ items }: { items: TotalItem[] }) {
  return (
    <Box sx={detailFooterSx}>
      <Box sx={detailTotalRowSx}>
        {items.map((it, i) => (
          <React.Fragment key={it.label}>
            {i > 0 && <Box sx={dtSepSx} />}
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Box component="span" sx={dtLabelSx}>{it.label}</Box>
              <Box component="span" sx={dtValSx(it.tone)}>{it.value}</Box>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
