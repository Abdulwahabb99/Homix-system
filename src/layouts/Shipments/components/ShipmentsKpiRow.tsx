import React from "react";
import { Box, Grid } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

interface KpiCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  icon: React.ReactNode;
}

function KpiCard({ label, value, iconBg, iconColor, valueColor, icon }: KpiCardProps) {
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconBg,
            color: iconColor,
            "& svg": { width: 15, height: 15, stroke: "currentColor", fill: "none", strokeWidth: 2 },
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ fontSize: "22px", fontWeight: 800, lineHeight: 1, mb: "3px", color: valueColor ?? HX.tx, fontFamily: FONT }}>
        {value.toLocaleString("en-US")}
      </Box>
      <Box sx={{ fontSize: "11px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>{label}</Box>
    </Box>
  );
}

interface ShipmentsKpiRowProps {
  shipments: any[];
  isLoading?: boolean;
}

export default function ShipmentsKpiRow({ shipments, isLoading }: ShipmentsKpiRowProps) {
  if (isLoading) {
    return (
      <Grid container spacing="10px">
        {[...Array(5)].map((_, i) => (
          <Grid item xs={6} sm={4} md={4} lg={2.4} key={i}>
            <Box
              sx={{
                bgcolor: HX.surface,
                borderRadius: HX.r,
                p: "14px 16px",
                border: `0.5px solid ${HX.border}`,
                height: 88,
                opacity: 0.6,
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  const total = shipments.length;
  const delivered = shipments.filter((s) => s.shipmentStatus === 4).length;
  const ready = shipments.filter((s) => s.shipmentStatus === 3).length;
  const inWarehouse = shipments.filter((s) => s.shipmentStatus === 2).length;
  const pending = shipments.filter((s) => s.shipmentStatus === 1).length;

  return (
    <Grid container spacing="10px">
      <Grid item xs={6} sm={4} md={4} lg={2.4}>
        <KpiCard
          label="إجمالي الشحنات"
          value={total}
          iconBg={HX.accentLight}
          iconColor={HX.accent}
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
        />
      </Grid>
      <Grid item xs={6} sm={4} md={4} lg={2.4}>
        <KpiCard
          label="تم التسليم"
          value={delivered}
          iconBg={HX.greenLight}
          iconColor={HX.green}
          valueColor={HX.green}
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
      </Grid>
      <Grid item xs={6} sm={4} md={4} lg={2.4}>
        <KpiCard
          label="جاهز للتوصيل"
          value={ready}
          iconBg={HX.tealLight}
          iconColor={HX.teal}
          valueColor={HX.teal}
          icon={
            <svg viewBox="0 0 24 24">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          }
        />
      </Grid>
      <Grid item xs={6} sm={4} md={4} lg={2.4}>
        <KpiCard
          label="في المخزن"
          value={inWarehouse}
          iconBg={HX.blueLight}
          iconColor={HX.blue}
          valueColor={HX.blue}
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
      </Grid>
      <Grid item xs={6} sm={4} md={4} lg={2.4}>
        <KpiCard
          label="معلقة"
          value={pending}
          iconBg={HX.amberLight}
          iconColor={HX.amber}
          valueColor={HX.amber}
          icon={
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </Grid>
    </Grid>
  );
}
