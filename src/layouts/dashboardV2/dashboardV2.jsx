import { Box, Grid } from "@mui/material";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDateRange } from "hooks/useDateRange";
import React from "react";
import SearchInput from "shared/components/SearchInput/SearchInput";
import StatsCard from "shared/components/StatsCard/StatsCard";
import MoneyRotateIcon from "shared/icons/MoneyRotateIcon";

function dashboardV2() {
  const { startDate, endDate, handleDatesChange, handleReset } = useDateRange({
    defaultDays: 0,
    useEndOfDay: true,
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2} width={"100%"} mb={4}>
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
          <Grid item xs={12} sm={12} md={12} lg={8}>
            <SearchInput
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            // onSearch={() => console.log("Searching for:", search)}
            />{" "}
          </Grid>
        </Grid>

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
