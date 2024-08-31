/* eslint-disable react/prop-types */
import React from "react";
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PaidIcon from "@mui/icons-material/Paid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function ReportComponent({
  financialreportData: {
    totalCommission,
    totalRevenue,
    totalProfit,
    totalCost,
    ordersCount,
    deliveredOrders,
  },
}) {
  return (
    <MDBox py={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon="weekend"
              title="عدد الطلبات"
              count={ordersCount || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              icon="leaderboard"
              title="السعر الاجمالي"
              count={totalRevenue.toFixed(0) || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="success"
              icon="store"
              title="اجمالي التكلفة"
              count={totalCost.toFixed(0) || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="error"
              icon={<CheckCircleIcon />}
              title="السعر الاجمالي للطلبات التي تم تسليمها"
              count={deliveredOrders?.totalRevenue.toFixed(0) || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon={<PaidIcon />}
              title="صافي الربح"
              count={totalProfit.toFixed(0) || 0}
            />
          </MDBox>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="light"
              icon={<MonetizationOnIcon />}
              title="عمولة المنصة"
              count={totalCommission.toFixed(0) || 0}
            />
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default ReportComponent;
