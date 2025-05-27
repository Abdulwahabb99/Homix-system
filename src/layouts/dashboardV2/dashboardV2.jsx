import { Box, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React from "react";
import StatsCard from "shared/components/StatsCard/StatsCard";
import MoneyRotateIcon from "shared/icons/MoneyRotateIcon";

function dashboardV2() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2} width={"70%"}>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard title="عدد الطلبات" value="500 طلب" icon={<MoneyRotateIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard title="إجمالي المبيعات" value="1000 EGP" icon={<MoneyRotateIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard title="إجمالي التكلفة" value="1000 EGP" icon={<MoneyRotateIcon />} />
          </Grid>
        </Grid>
      </Box>{" "}
    </DashboardLayout>
  );
}

export default dashboardV2;
