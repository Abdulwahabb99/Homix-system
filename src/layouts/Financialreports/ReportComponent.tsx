/* eslint-disable react/prop-types */
import React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import StatsCard from "shared/components/StatsCard/StatsCard";
import { DASHBOARD_TILES_AND_TABLES_GRID_SX } from "shared/theme/homixDataGridSx";

const gridItem = { xs: 12, sm: 6, md: 4 };

function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return `${Number(n).toLocaleString("en-EG", { maximumFractionDigits: 0 })} EGP`;
}

function formatCount(n) {
  if (n == null || n === undefined) return "0";
  return `${Number(n).toLocaleString("en-EG")}`;
}

/** عنوان قسم بسيط — بدون زخرفة، يوحّد المسافات */
function TileSection({ title, children }) {
  return (
    <Box>
      <Typography
        variant="overline"
        component="h2"
        sx={{
          display: "block",
          mb: 1.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "text.secondary",
          fontSize: "0.72rem",
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={2} alignItems="stretch" sx={DASHBOARD_TILES_AND_TABLES_GRID_SX}>
        {children}
      </Grid>
    </Box>
  );
}

function ReportComponent({ financialreportData }) {
  const {
    totalCommission,
    totalRevenue,
    totalProfit,
    totalCost,
    totalToBeCollected,
    totalDownPayment,
    ordersCount,
    deliveredOrders,
    halfCompletedOrders,
  } = financialreportData;

  const hasDown = totalDownPayment != null;
  const hasCollect = totalToBeCollected != null;

  return (
    <Box sx={{ pt: 0.5 }}>
      <Stack spacing={3}>
        <TileSection title="الأساسيات">
          <Grid item {...gridItem}>
            <StatsCard title="عدد الطلبات" value={formatCount(ordersCount)} icon={<Inventory2OutlinedIcon />} />
          </Grid>
          <Grid item {...gridItem}>
            <StatsCard title="إجمالي المبيعات" value={formatMoney(totalRevenue)} icon={<PointOfSaleOutlinedIcon />} />
          </Grid>
          <Grid item {...gridItem}>
            <StatsCard title="إجمالي التكلفة" value={formatMoney(totalCost)} icon={<AccountBalanceWalletOutlinedIcon />} />
          </Grid>
          <Grid item {...gridItem}>
            <StatsCard title="صافي الربح" value={formatMoney(totalProfit)} icon={<TrendingUpOutlinedIcon />} />
          </Grid>
        </TileSection>

        <TileSection title="عمولات وتحصيل">
          <Grid item {...gridItem}>
            <StatsCard title="عمولة المنصة" value={formatMoney(totalCommission)} icon={<PercentOutlinedIcon />} />
          </Grid>
          {hasDown && (
            <Grid item {...gridItem}>
              <StatsCard title="جدية الشراء" value={formatMoney(totalDownPayment)} icon={<HandshakeOutlinedIcon />} />
            </Grid>
          )}
          {hasCollect && (
            <Grid item {...gridItem}>
              <StatsCard title="المستحقات (تحصيل)" value={formatMoney(totalToBeCollected)} icon={<PaymentsOutlinedIcon />} />
            </Grid>
          )}
        </TileSection>

        <TileSection title="التسليم">
          <Grid item {...gridItem}>
            <StatsCard
              title="مبيعات الطلبات المُسلّمة"
              value={formatMoney(deliveredOrders?.totalRevenue)}
              icon={<LocalShippingOutlinedIcon />}
            />
          </Grid>
        </TileSection>

        <TileSection title="نصف مكتملة">
          <Grid item {...gridItem}>
            <StatsCard
              title="عدد الطلبات"
              value={formatCount(halfCompletedOrders?.ordersCount)}
              icon={<HourglassTopOutlinedIcon />}
            />
          </Grid>
          <Grid item {...gridItem}>
            <StatsCard
              title="إجمالي المبيعات"
              value={formatMoney(halfCompletedOrders?.totalRevenue)}
              icon={<PendingActionsOutlinedIcon />}
            />
          </Grid>
        </TileSection>
      </Stack>
    </Box>
  );
}

export default ReportComponent;
