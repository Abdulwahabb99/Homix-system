/**
 * تذييل «الفاتورة الشاملة» — ملخّص متدرّج اللون بقيم عمودية + تنويه.
 */
import React from "react";
import { Box } from "@mui/material";
import { compSummarySx, csValSx, csLabelSx, csDividerSx, csNoteSx, Tone } from "../utils/styles";

export interface SummaryItem {
  value: string;
  label: string;
  tone?: Tone;
}

export default function ComprehensiveSummary({ items, note }: { items: SummaryItem[]; note?: string }) {
  return (
    <Box sx={compSummarySx}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          {i > 0 && <Box sx={csDividerSx} />}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <Box component="span" sx={csValSx(it.tone)}>{it.value}</Box>
            <Box component="span" sx={csLabelSx}>{it.label}</Box>
          </Box>
        </React.Fragment>
      ))}
      {note && <Box sx={csNoteSx}>{note}</Box>}
    </Box>
  );
}
