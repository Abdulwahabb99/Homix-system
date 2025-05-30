import { Box, Grid, useMediaQuery } from "@mui/material";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDateRange } from "hooks/useDateRange";
import React, { useEffect, useState } from "react";
import SearchInput from "shared/components/SearchInput/SearchInput";
import StatsCard from "shared/components/StatsCard/StatsCard";
import MoneyRotateIcon from "shared/icons/MoneyRotateIcon";
import TopSellingProductsTable from "./components/TopSellingProducts/TopSellingProducts";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import BanknoteShieldIcon from "shared/icons/BanknoteShieldIcon";
import BankBuildingIcon from "shared/icons/BankBuildingIcon";

function dashboardV2() {
  const [financialreportData, setFinancialreportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:1092px)");
  const user = JSON.parse(localStorage.getItem("user"));

  const { startDate, endDate, handleDatesChange, handleReset } = useDateRange({
    defaultDays: 0,
    useEndOfDay: true,
  });

  const getFinancialreport = () => {
    setIsLoading(true);
    const url = `${process.env.REACT_APP_API_URL}/orders/financialReport?endDate=${endDate}&startDate=${startDate}`;
    // const url = `${process.env.REACT_APP_API_URL}/orders/financialReport`;
    axiosRequest
      .get(url)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }

        setFinancialreportData({
          ordersCount: data.data.ordersCount,
          totalCost: data.data.totalCost,
          totalProfit: data.data.totalProfit,
          totalRevenue: data.data.totalRevenue,
          totalCommission: data.data.totalCommission,
          totalToBeCollected: data.data.totalToBeCollected,
          totalDownPayment: data.data.totalDownPayment,
          deliveredOrders: data.data.DeliveredOrders,
          halfCompletedOrders: data.data.halfCompletedOrders,
        });
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getFinancialreport();
  }, [startDate, endDate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2} width={"100%"} mb={4}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <SearchInput
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            // onSearch={() => console.log("Searching for:", search)}
            />{" "}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={4}>
            <DateRangePickerWrapper
              startDate={startDate}
              endDate={endDate}
              allowPastDays={true}
              allowFutureDays={false}
              useDefaultPresets={true}
              handleDatesChange={handleDatesChange}
              isMeduim
            />{" "}
          </Grid>
        </Grid>

        <Grid container spacing={2} width={isSmallScreen ? "100%" : "70%"} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="عدد الطلبات"
              value={`${financialreportData?.ordersCount} طلب`}
              icon={<BanknoteShieldIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="إجمالي المبيعات"
              value={`${financialreportData?.totalRevenue.toFixed(0)} EGP`}
              icon={<BankBuildingIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              title="إجمالي التكلفة"
              value={`${financialreportData?.totalCost.toFixed(0)} EGP`}
              icon={<MoneyRotateIcon />}
            />
          </Grid>
        </Grid>

        {/* Grid =>>>>> */}

        <Grid container spacing={4} width={"100%"}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <TopSellingProductsTable />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <TopSellingProductsTable />
          </Grid>
        </Grid>
      </Box>{" "}
    </DashboardLayout>
  );
}

export default dashboardV2;
