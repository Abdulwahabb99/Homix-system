import React from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

export interface InfoRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  valueSx?: SxProps<Theme>;
}

/** A label/value row with a colored leading icon, used in info cards. */
export default function InfoRow({ icon, iconBg, iconColor, label, value, valueSx }: InfoRowProps) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: "10px", py: "9px",
      borderBottom: `0.5px solid ${HX.border}`,
      "&:first-of-type": { pt: 0 }, "&:last-of-type": { borderBottom: "none", pb: 0 },
    }}>
      <Box sx={{ width: 30, height: 30, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, bgcolor: iconBg, color: iconColor, "& svg": { fontSize: 15 } }}>
        {icon}
      </Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, fontWeight: 500, minWidth: 110 }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: HX.tx, flex: 1, ...valueSx }}>{value}</Typography>
    </Box>
  );
}
