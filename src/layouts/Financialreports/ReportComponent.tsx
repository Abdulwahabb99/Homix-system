/* eslint-disable react/prop-types */
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaidIcon from "@mui/icons-material/Paid";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PendingIcon from "@mui/icons-material/Pending";
import HomixKpiCard from "components/HomixKpiCard/HomixKpiCard";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { formatMoneyEgpInteger } from "shared/formatMoney";

const FONT = "'Cairo', sans-serif";

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

  const money = formatMoneyEgpInteger;

  const primary = [
    { icon: <PaidIcon />,         iconBg: HX.greenLight,  iconColor: HX.green,  valueColor: HX.green, label: "صافي الربح",        value: money(totalProfit) },
    { icon: <LeaderboardIcon />,  iconBg: HX.blueLight,   iconColor: HX.blue,                          label: "السعر الإجمالي",    value: money(totalRevenue) },
    { icon: <StorefrontIcon />,   iconBg: HX.amberLight,  iconColor: HX.amber,                         label: "إجمالي التكلفة",    value: money(totalCost) },
    { icon: <MonetizationOnIcon />, iconBg: HX.purpleLight, iconColor: HX.purple,                      label: "عمولة المنصة",      value: money(totalCommission) },
  ];

  const secondary = [
    { icon: <ReceiptLongIcon />,  iconBg: HX.accentLight, iconColor: HX.accent, valueColor: HX.accent, label: "عدد الطلبات",       value: ordersCount || 0 },
    { icon: <CheckCircleIcon />,  iconBg: HX.greenLight,  iconColor: HX.green,                          label: "إجمالي الطلبات المسلّمة", value: money(deliveredOrders?.totalRevenue) },
    { icon: <SavingsIcon />,      iconBg: HX.tealLight,   iconColor: HX.teal,                           label: "جدية الشراء",       value: money(totalDownPayment) },
    { icon: <AccountBalanceWalletIcon />, iconBg: HX.blueLight, iconColor: HX.blue,                     label: "المطلوب تحصيله",    value: money(totalToBeCollected) },
    { icon: <HourglassEmptyIcon />, iconBg: HX.amberLight, iconColor: HX.amber,                         label: "الطلبات النصف مكتملة", value: halfCompletedOrders?.ordersCount || 0 },
    { icon: <PendingIcon />,      iconBg: HX.surface3,    iconColor: HX.tx2,                            label: "مبالغ الطلبات النصف مكتملة", value: money(halfCompletedOrders?.totalRevenue) },
  ];

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx2, mb: "10px", mt: "4px" }}>
      {children}
    </Typography>
  );

  return (
    <Box sx={{ mt: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <SectionTitle>الملخص المالي</SectionTitle>
      <Grid container spacing="10px">
        {primary.map((c) => (
          <Grid item xs={6} sm={6} md={3} key={c.label}>
            <HomixKpiCard {...c} />
          </Grid>
        ))}
      </Grid>

      <SectionTitle>تفاصيل إضافية</SectionTitle>
      <Grid container spacing="10px">
        {secondary.map((c) => (
          <Grid item xs={6} sm={4} md={2} key={c.label}>
            <HomixKpiCard {...c} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ReportComponent;
