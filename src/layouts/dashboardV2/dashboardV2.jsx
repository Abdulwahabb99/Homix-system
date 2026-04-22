import { Box, Grid, Stack, Typography } from "@mui/material";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDateRange } from "hooks/useDateRange";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchInput from "shared/components/SearchInput/SearchInput";
import StatsCard from "shared/components/StatsCard/StatsCard";
import MoneyRotateIcon from "shared/icons/MoneyRotateIcon";
import TopSellingProductsTable from "./components/TopSellingProducts/TopSellingProducts";
import { DASHBOARD_TILES_AND_TABLES_GRID_SX } from "./components/dashboardDataGridSx";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import BanknoteShieldIcon from "shared/icons/BanknoteShieldIcon";
import BankBuildingIcon from "shared/icons/BankBuildingIcon";
import MostVendorsSelling from "./components/MostVendorsSelling/MostVendorsSelling";
import DashboardV2Skeleton from "./components/DashboardV2Skeleton";
import moment from "moment";
import SearchModal from "./components/SearchModal/SearchModal";

function dashboardV2() {
  const navigate = useNavigate();
  const [financialreportData, setFinancialreportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const searchParam = new URLSearchParams(window.location.search);
  const startDateParam = searchParam.get("startDate");
  const endDateParam = searchParam.get("endDate");
  const isVendor = user.userType === "2";

  const { startDate, endDate, handleDatesChange, handleReset } = useDateRange({
    defaultDays: 0,
    useEndOfDay: true,
  });

  const getFinancialreport = () => {
    setIsLoading(true);
    const url = `${process.env.REACT_APP_API_URL}/orders/financialReport?endDate=${
      endDateParam ? endDate : moment.utc().endOf("day")
    }&startDate=${startDateParam ? startDate : moment.utc().startOf("day")}`;

    axiosRequest
      .get(url)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }

        setFinancialreportData(data.data);
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
      {isSearchModalOpen && (
        <SearchModal
          open={isSearchModalOpen}
          onClose={() => {
            setIsSearchModalOpen(false);
          }}
        />
      )}
      {isLoading ? (
        <DashboardV2Skeleton />
      ) : (
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pt: 2.5,
            pb: 5,
            maxWidth: 1680,
            mx: "auto",
            width: "100%",
            minHeight: "60vh",
          }}
        >
          <Stack spacing={0.5} mb={3}>
            <Typography variant="h5" fontWeight={700} color="text.primary" letterSpacing="0.02em">
              لوحة المعلومات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              نظرة على الأداء المالي، وأكثر المنتجات والموردين مبيعًا
            </Typography>
          </Stack>

          <Box
            mb={3}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 20px rgba(15, 23, 42, 0.06)",
            }}
          >
            <Grid container spacing={1.5} alignItems="center" columnSpacing={2}>
              <Grid item xs={12} md={6} lg={6}>
                <SearchInput onClick={() => setIsSearchModalOpen(true)} />
              </Grid>
              <Grid item xs={12} md={6} lg={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 40,
                    "& .custom-date-picker, & .DateRangePicker, & .DateRangePickerInput": {
                      width: "100% !important",
                    },
                  }}
                >
                  <DateRangePickerWrapper
                    startDate={startDateParam ? startDate : moment.utc().startOf("day")}
                    endDate={endDateParam ? endDate : moment.utc().endOf("day")}
                    allowPastDays={true}
                    allowFutureDays={false}
                    useDefaultPresets={true}
                    handleDatesChange={handleDatesChange}
                    isMeduim
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2} mb={3} sx={DASHBOARD_TILES_AND_TABLES_GRID_SX}>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="عدد الطلبات"
                value={`${financialreportData?.ordersCount ?? 0} طلب`}
                icon={<BanknoteShieldIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="إجمالي المبيعات"
                value={`${(financialreportData?.totalRevenue ?? 0).toFixed(0)} EGP`}
                icon={<BankBuildingIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatsCard
                title="إجمالي التكلفة"
                value={`${(financialreportData?.totalCost ?? 0).toFixed(0)} EGP`}
                icon={<MoneyRotateIcon />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} alignItems="stretch" sx={DASHBOARD_TILES_AND_TABLES_GRID_SX}>
            <Grid item xs={12} lg={isVendor ? 12 : 6}>
              {financialreportData?.topTenProducts && (
                <TopSellingProductsTable rowData={financialreportData?.topTenProducts} />
              )}
            </Grid>
            {!isVendor && (
              <Grid item xs={12} lg={6}>
                {financialreportData?.topTenVendors && (
                  <MostVendorsSelling rowData={financialreportData?.topTenVendors} />
                )}
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </DashboardLayout>
  );
}

export default dashboardV2;
