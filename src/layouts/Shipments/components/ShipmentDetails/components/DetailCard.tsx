import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

export interface DetailCardProps {
  title: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
  noPad?: boolean;
  children: React.ReactNode;
}

/** Standard bordered card with an icon + title header used across the detail page. */
export default function DetailCard({ title, icon, extra, noPad, children }: DetailCardProps) {
  return (
    <Box sx={{ bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "12px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>
          <Box sx={{ display: "flex", color: HX.tx2, "& svg": { fontSize: 16 } }}>{icon}</Box>
          {title}
        </Box>
        {extra}
      </Box>
      <Box sx={{ p: noPad ? 0 : "16px" }}>{children}</Box>
    </Box>
  );
}
