import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { OrderSummaryCardDto } from "query/ordersSummary.api";
import { OrdersHomixKpiRowSkeleton } from "layouts/Orders/components/OrdersHomixSkeletons";

const KPI_ICON_STYLES: { iconBg: string; iconColor: string; iconPath: React.ReactNode; valueColor?: string }[] =
  [
    {
      iconBg: HX.accentLight,
      iconColor: HX.accent,
      iconPath: (
        <svg viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
      ),
    },
    {
      iconBg: HX.amberLight,
      iconColor: HX.amber,
      valueColor: HX.amber,
      iconPath: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      iconBg: HX.purpleLight,
      iconColor: HX.purple,
      valueColor: HX.purple,
      iconPath: (
        <svg viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      iconBg: HX.greenLight,
      iconColor: HX.green,
      valueColor: HX.green,
      iconPath: (
        <svg viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      iconBg: HX.redLight,
      iconColor: HX.red,
      valueColor: HX.red,
      iconPath: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      iconBg: HX.roseLight,
      iconColor: HX.rose,
      valueColor: HX.rose,
      iconPath: (
        <svg viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      ),
    },
  ];

function formatKpiValue(value: number | string): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return String(value ?? "—");
}

function KpiCard({
  iconBg,
  iconColor,
  iconPath,
  value,
  valueColor,
  label,
}: {
  iconBg: string;
  iconColor: string;
  iconPath: React.ReactNode;
  value: string;
  valueColor?: string;
  label: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        p: "12px 14px",
        border: `0.5px solid ${HX.border}`,
        cursor: "default",
        transition: ".2s",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "8px" }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: iconBg,
            color: iconColor,
            "& svg": { width: 13, height: 13, stroke: "currentColor", fill: "none", strokeWidth: 2 },
          }}
        >
          {iconPath}
        </Box>
      </Box>
      <Typography sx={{ fontSize: "20px", fontWeight: 800, lineHeight: 1, mb: "2px", color: valueColor ?? HX.tx }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "11px", color: HX.tx2, fontWeight: 500 }}>{label}</Typography>
    </Box>
  );
}

interface OrdersHomixKpiRowProps {
  /** بطاقات من `/orders/summary` */
  summaryCards?: OrderSummaryCardDto[];
  /** أول تحميل بدون بيانات */
  isSummaryLoading?: boolean;
}

export default function OrdersHomixKpiRow({ summaryCards, isSummaryLoading }: OrdersHomixKpiRowProps) {
  if (isSummaryLoading) {
    return <OrdersHomixKpiRowSkeleton />;
  }

  const cards = summaryCards ?? [];

  if (cards.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: HX.surface,
          borderRadius: HX.r,
          p: 2,
          border: `0.5px solid ${HX.border}`,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "12px", color: HX.tx2, fontWeight: 500 }}>
          لا توجد بطاقات ملخص من الخادم حالياً.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing="10px">
      {cards.map((card, i) => {
        const style = KPI_ICON_STYLES[i % KPI_ICON_STYLES.length];
        return (
          <Grid item xs={6} sm={4} md={4} lg={4} xl={2} key={`${card.key}-${i}`}>
            <KpiCard
              iconBg={style.iconBg}
              iconColor={style.iconColor}
              iconPath={style.iconPath}
              valueColor={style.valueColor}
              value={formatKpiValue(card.value)}
              label={card.label}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
