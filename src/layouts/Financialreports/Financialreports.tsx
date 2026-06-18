import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { Box, Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ReportComponent from "./ReportComponent";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HomixKpiCardSkeleton } from "components/HomixKpiCard/HomixKpiCard";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 40, borderRadius: "10px", fontFamily: FONT, fontSize: "13px", bgcolor: HX.surface,
    "& fieldset": { borderColor: HX.border },
    "&:hover fieldset": { borderColor: HX.accent },
    "&.Mui-focused fieldset": { borderColor: HX.accent, borderWidth: "1px" },
  },
  "& .MuiInputBase-input": { color: HX.tx, fontFamily: FONT },
};

function Financialreports() {
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  const [startDate, setStartDate] = useState(formattedDate);
  const [endDate, setEndDate] = useState(formattedDate);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [financialreportData, setFinancialreportData] = useState(null);
  const isAdmin = user.userType === "1";

  const getVendors = () => {
    axiosRequest
      .get("/vendors")
      .then(({ data: { data } }) => {
        const newData = data.map((vendor) => ({ label: vendor.name, value: vendor.id }));
        setVendors([{ label: "هومكس", value: "0" }, ...newData]);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getFinancialreport = () => {
    setIsLoading(true);
    if (user.vendorId) {
      axiosRequest
        .get(
          `/orders/financialReport/?vendorId=${user.vendorId}&endDate=${endDate}&startDate=${startDate}`
        )
        .then(({ data }) => {
          setFinancialreportData({
            ordersCount: data.data.ordersCount,
            totalCost: data.data.totalCost,
            totalProfit: data.data.totalProfit,
            totalRevenue: data.data.totalRevenue,
            totalCommission: data.data.totalCommission,
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
    } else {
      const url = selectedVendor
        ? `/orders/financialReport/?vendorId=${selectedVendor}&endDate=${endDate}&startDate=${startDate}`
        : `/orders/financialReport/?endDate=${endDate}&startDate=${startDate}`;

      axiosRequest
        .get(url)
        .then(({ data }) => {
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
    }
  };

  useEffect(() => {
    getVendors();
    getFinancialreport();
  }, []);

  return (
    <DashboardLayout pageTitle="التقارير المالية" pageSubtitle="ملخص الإيرادات والتكاليف والأرباح خلال الفترة المحددة">
      <ToastContainer />

      <Box sx={{ fontFamily: FONT, mt: "16px" }}>
        {/* Filter bar */}
        <Box
          sx={{
            bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`,
            p: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 180px", minWidth: 160 }}>
            <Typography component="label" htmlFor="start-date" sx={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: HX.tx2 }}>
              تاريخ البدء
            </Typography>
            <TextField
              id="start-date" variant="outlined" type="date" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} fullWidth sx={fieldSx}
              InputProps={{ inputProps: { max: formattedDate } }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 180px", minWidth: 160 }}>
            <Typography component="label" htmlFor="end-date" sx={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: HX.tx2 }}>
              تاريخ الانتهاء
            </Typography>
            <TextField
              id="end-date" variant="outlined" type="date" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} fullWidth sx={fieldSx}
              InputProps={{ inputProps: { max: formattedDate } }}
            />
          </Box>

          {isAdmin && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 180px", minWidth: 160 }}>
              <Typography component="label" htmlFor="vendors" sx={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: HX.tx2 }}>
                المصنّعون
              </Typography>
              <Select
                id="vendors" value={selectedVendor} fullWidth displayEmpty
                onChange={(e) => setSelectedVendor(e.target.value)}
                sx={{
                  height: 40, borderRadius: "10px", fontFamily: FONT, fontSize: "13px", bgcolor: HX.surface,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
                  "& .MuiSelect-select": { fontFamily: FONT, fontSize: "13px" },
                }}
                MenuProps={{ PaperProps: { sx: { fontFamily: FONT } } }}
              >
                <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "13px" }}>الكل</MenuItem>
                {vendors.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontFamily: FONT, fontSize: "13px" }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          <Box
            component="button"
            type="button"
            onClick={getFinancialreport}
            sx={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              px: "22px", height: 40, borderRadius: "10px", border: "none",
              bgcolor: HX.accent, color: "#fff", cursor: "pointer",
              fontSize: "13px", fontFamily: FONT, fontWeight: 700, flexShrink: 0,
              transition: ".15s", "&:hover": { bgcolor: "#4f46e5" },
            }}
          >
            <FilterAltIcon sx={{ fontSize: 17 }} /> بحث
          </Box>
        </Box>

        {/* Report */}
        {isLoading ? (
          <Box sx={{ mt: "18px" }}>
            <Grid container spacing="10px">
              {[...Array(10)].map((_, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}>
                  <HomixKpiCardSkeleton />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : financialreportData ? (
          <ReportComponent financialreportData={financialreportData} />
        ) : (
          <Box sx={{ mt: "18px", py: 7, textAlign: "center", bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, fontFamily: FONT, fontSize: "13px", color: HX.tx3 }}>
            اختر الفترة الزمنية ثم اضغط «بحث» لعرض التقرير
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Financialreports;
