import React from "react";
import { Box, Typography } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../constants";

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Section shell: colored icon + title/subtitle header + optional "مطلوب" badge. */
export default function SectionCard({
  title, subtitle, icon, iconBg, iconColor, required, children,
}: SectionCardProps) {
  return (
    <Box sx={{ bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", p: "13px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ width: 32, height: 32, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, bgcolor: iconBg, color: iconColor, "& svg": { fontSize: 17 } }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, mt: "1px" }}>{subtitle}</Typography>}
        </Box>
        {required && (
          <Box component="span" sx={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: HX.red, bgcolor: HX.redLight, px: "7px", py: "2px", borderRadius: "5px" }}>
            مطلوب
          </Box>
        )}
      </Box>
      <Box sx={{ p: "18px" }}>{children}</Box>
    </Box>
  );
}
