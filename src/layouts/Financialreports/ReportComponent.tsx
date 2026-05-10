/* eslint-disable react/prop-types */
import React from "react";
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PaidIcon from "@mui/icons-material/Paid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PendingIcon from "@mui/icons-material/Pending";
import { formatMoneyEgpInteger } from "shared/formatMoney";

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

  return (
    <MDBox py={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon="weekend"
              title="عدد الطلبات"
              count={ordersCount || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              icon="leaderboard"
              title="السعر الاجمالي"
              count={formatMoneyEgpInteger(totalRevenue)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="success"
              icon="store"
              title="اجمالي التكلفة"
              count={formatMoneyEgpInteger(totalCost)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="error"
              icon={<CheckCircleIcon />}
              title="السعر الاجمالي للطلبات التي تم تسليمها"
              count={formatMoneyEgpInteger(deliveredOrders?.totalRevenue)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon={<PaidIcon />}
              title="صافي الربح"
              count={formatMoneyEgpInteger(totalProfit)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="light"
              icon={<MonetizationOnIcon />}
              title="عمولة المنصة"
              count={formatMoneyEgpInteger(totalCommission)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="light"
              icon={<MonetizationOnIcon />}
              title="جدية الشراء"
              count={formatMoneyEgpInteger(totalDownPayment)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="light"
              icon={<MonetizationOnIcon />}
              title="اجمالي المبالغ المطلوب تحصيلها"
              count={formatMoneyEgpInteger(totalToBeCollected)}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon={<HourglassEmptyIcon />}
              title="عدد الطلبات النصف مكتملة"
              count={halfCompletedOrders?.ordersCount || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon={<PendingIcon />}
              title="اجمالي مبالغ الطلبات النصف مكتملة"
              count={formatMoneyEgpInteger(halfCompletedOrders?.totalRevenue)}
            />
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default ReportComponent;
