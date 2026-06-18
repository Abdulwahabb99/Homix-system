import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

export interface HomixKpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: number | string;
  valueColor?: string;
  label: string;
  description?: string;
}

/** Shared KPI/stat card: icon chip + value + label, with a subtle hover lift. */
export default function HomixKpiCard({
  icon, iconBg, iconColor, value, valueColor, label, description,
}: HomixKpiCardProps) {
  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        p: "14px 16px",
        border: `0.5px solid ${HX.border}`,
        transition: ".2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
      }}
    >
      <Box sx={{ mb: "10px" }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: iconBg, color: iconColor,
            "& svg": { width: 15, height: 15 },
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ fontSize: "22px", fontWeight: 800, lineHeight: 1, mb: "3px", color: valueColor ?? HX.tx, fontFamily: FONT }}>
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </Box>
      <Box sx={{ fontSize: "11px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>{label}</Box>
      {description && (
        <Box sx={{ fontSize: "10.5px", color: HX.tx3, fontFamily: FONT, mt: "3px" }}>{description}</Box>
      )}
    </Box>
  );
}

/** Matching skeleton placeholder for loading states. */
export function HomixKpiCardSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        p: "14px 16px",
        border: `0.5px solid ${HX.border}`,
        height: 90,
        "& > div": { borderRadius: "6px", bgcolor: HX.surface3, animation: "hx-pulse 1.4s ease-in-out infinite" },
        "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
      }}
    >
      <Box sx={{ width: 32, height: 32, borderRadius: "9px !important", mb: "10px" }} />
      <Box sx={{ width: "50%", height: 18, mb: "6px" }} />
      <Box sx={{ width: "70%", height: 11 }} />
    </Box>
  );
}
