import React from "react";
import { Box, Grid } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentSummaryCard } from "query/shipmentsList";

const FONT = "'Cairo', sans-serif";

/* Icon + color per known card key — falls back to accent style for unknowns */
const KEY_STYLES: Record<string, { iconBg: string; iconColor: string; valueColor?: string; icon: React.ReactNode }> = {
  totalShipments: {
    iconBg: HX.accentLight, iconColor: HX.accent,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  delivered: {
    iconBg: HX.greenLight, iconColor: HX.green, valueColor: HX.green,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  readyForDelivery: {
    iconBg: HX.tealLight, iconColor: HX.teal, valueColor: HX.teal,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  inWarehouse: {
    iconBg: HX.blueLight, iconColor: HX.blue, valueColor: HX.blue,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  pending: {
    iconBg: HX.amberLight, iconColor: HX.amber, valueColor: HX.amber,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  cancelled: {
    iconBg: HX.redLight, iconColor: HX.red, valueColor: HX.red,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  returned: {
    iconBg: HX.purpleLight, iconColor: HX.purple, valueColor: HX.purple,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.1" />
      </svg>
    ),
  },
};

const FALLBACK_STYLES = [
  { iconBg: HX.accentLight, iconColor: HX.accent },
  { iconBg: HX.greenLight,  iconColor: HX.green,  valueColor: HX.green },
  { iconBg: HX.tealLight,   iconColor: HX.teal,   valueColor: HX.teal },
  { iconBg: HX.blueLight,   iconColor: HX.blue,   valueColor: HX.blue },
  { iconBg: HX.amberLight,  iconColor: HX.amber,  valueColor: HX.amber },
  { iconBg: HX.purpleLight, iconColor: HX.purple, valueColor: HX.purple },
];

const FALLBACK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

function KpiCard({
  iconBg, iconColor, icon, value, valueColor, label,
}: {
  iconBg: string; iconColor: string; icon: React.ReactNode;
  value: number | string; valueColor?: string; label: string;
}) {
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
    </Box>
  );
}

function SkeletonCard() {
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

interface ShipmentsKpiRowProps {
  cards?: ShipmentSummaryCard[];
  isLoading?: boolean;
}

export default function ShipmentsKpiRow({ cards, isLoading }: ShipmentsKpiRowProps) {
  if (isLoading) {
    return (
      <Grid container spacing="10px">
        {[...Array(5)].map((_, i) => (
          <Grid item xs={6} sm={4} md={4} lg={2.4} key={i}>
            <SkeletonCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!cards || cards.length === 0) return null;

  return (
    <Grid container spacing="10px">
      {cards.map((card, i) => {
        const style = KEY_STYLES[card.key] ?? {
          ...FALLBACK_STYLES[i % FALLBACK_STYLES.length],
          icon: FALLBACK_ICON,
        };
        return (
          <Grid item xs={6} sm={4} md={4} lg={2.4} key={card.key}>
            <KpiCard
              iconBg={style.iconBg}
              iconColor={style.iconColor}
              icon={style.icon}
              valueColor={style.valueColor}
              value={card.value}
              label={card.label}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
