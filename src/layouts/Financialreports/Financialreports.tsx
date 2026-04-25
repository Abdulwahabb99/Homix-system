// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { useDateRange } from "hooks/useDateRange";
import moment from "moment";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { alpha } from "@mui/material/styles";
import ReportComponent from "./ReportComponent";
import FinancialReportSkeleton from "./FinancialReportSkeleton";

/** نفس `homix-drp--medium` في DateRangePickerWrapper (`--dp-input-h: 42px`) */
const FILTER_CONTROL_H = 42;

function toApiDateString(d) {
  if (!d) return null;
  const m = moment.isMoment(d) ? d : moment.utc(d, "DD-MM-YYYY", true);
  if (!m.isValid()) return null;
  return m.format("YYYY-MM-DD");
}

function Financialreports() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { startDate, endDate, handleDatesChange } = useDateRange({
    defaultDays: 0,
    useEndOfDay: true,
  });

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState({ label: "جميع المصانع", value: "" });
  const [financialreportData, setFinancialreportData] = useState(null);
  const isAdmin = user?.userType === "1";
  const isVendor = user?.userType === "2";
  const initDatesRef = useRef(false);

  const vendorOptions = useMemo(() => {
    const fromApi = (vendors || []).map((v) => ({ label: v.label, value: v.value }));
    return [{ label: "جميع المصانع", value: "" }, ...fromApi];
  }, [vendors]);

  const getVendors = useCallback(() => {
    if (!isAdmin) return;
    axiosRequest
      .get("/vendors")
      .then(({ data: { data } }) => {
        const newData = (data || []).map((vendor) => ({ label: vendor.name, value: String(vendor.id) }));
        setVendors([{ label: "هومكس", value: "0" }, ...newData]);
      })
      .catch(() => {
        NotificationMeassage("error", "تعذّر تحميل المصنعين");
      });
  }, [isAdmin]);

  const getFinancialreport = useCallback(() => {
    const startStr = toApiDateString(startDate) || moment.utc().startOf("day").format("YYYY-MM-DD");
    const endStr = toApiDateString(endDate) || moment.utc().endOf("day").format("YYYY-MM-DD");

    setIsLoading(true);
    if (isVendor && user?.vendorId) {
      const url = `/orders/financialReport/?vendorId=${user.vendorId}&endDate=${endStr}&startDate=${startStr}`;
      axiosRequest
        .get(url)
        .then(({ data }) => {
          if (data.force_logout) {
            localStorage.removeItem("user");
            navigate("/authentication/sign-in");
            return;
          }
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
        .finally(() => setIsLoading(false));
      return;
    }

    const vendorId =
      selectedVendor && selectedVendor.value !== "" && selectedVendor.value != null
        ? String(selectedVendor.value)
        : null;
    const path = vendorId
      ? `/orders/financialReport/?vendorId=${encodeURIComponent(vendorId)}&endDate=${endStr}&startDate=${startStr}`
      : `/orders/financialReport/?endDate=${endStr}&startDate=${startStr}`;

    axiosRequest
      .get(path)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
          return;
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
      .finally(() => setIsLoading(false));
  }, [startDate, endDate, selectedVendor, isVendor, user?.vendorId, navigate]);

  useEffect(() => {
    getVendors();
  }, [getVendors]);

  useEffect(() => {
    if (initDatesRef.current) return;
    if (startDate && endDate) {
      initDatesRef.current = true;
      return;
    }
    initDatesRef.current = true;
    handleDatesChange(moment.utc().startOf("day"), moment.utc().endOf("day"));
  }, [startDate, endDate, handleDatesChange]);

  useEffect(() => {
    if (!toApiDateString(startDate) || !toApiDateString(endDate)) return;
    getFinancialreport();
  }, [startDate, endDate, selectedVendor, getFinancialreport]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          maxWidth: 1680,
          mx: "auto",
          width: "100%",
          minHeight: "60vh",
        }}
      >
        <Stack spacing={0.5} mb={2}>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: "1.2rem" }}>
            التقارير المالية
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            اختر الفترة{isAdmin ? " والمصنّع" : ""} ثم اضغط تحديث
          </Typography>
        </Stack>

        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} lg={isAdmin ? 5 : 6}>
              <Box
                sx={{
                  minHeight: FILTER_CONTROL_H,
                  "& .custom-date-picker, & .DateRangePicker, & .DateRangePickerInput": {
                    width: "100% !important",
                  },
                }}
              >
                <DateRangePickerWrapper
                  startDate={startDate}
                  endDate={endDate}
                  allowPastDays
                  allowFutureDays={false}
                  useDefaultPresets
                  isMeduim
                  handleDatesChange={handleDatesChange}
                />
              </Box>
            </Grid>
            {isAdmin && (
              <Grid item xs={12} lg={4}>
                <Autocomplete
                  size="small"
                  options={vendorOptions}
                  value={selectedVendor}
                  onChange={(_, v) => setSelectedVendor(v || { label: "جميع المصانع", value: "" })}
                  getOptionLabel={(o) => o?.label || ""}
                  isOptionEqualToValue={(a, b) => a?.value === b?.value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="المصنّع"
                      placeholder="الكل"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      minHeight: FILTER_CONTROL_H,
                      height: FILTER_CONTROL_H,
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} lg={isAdmin ? 3 : 6}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "stretch", sm: "flex-end" }} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon sx={{ fontSize: 20 }} />}
                  onClick={getFinancialreport}
                  disabled={isLoading}
                  sx={{ px: 2, py: 1, fontWeight: 600, textTransform: "none", borderRadius: 1.5, flex: { xs: 1, sm: "none" } }}
                >
                  تحديث
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleDatesChange(moment.utc().startOf("day"), moment.utc().endOf("day"));
                    setSelectedVendor({ label: "جميع المصانع", value: "" });
                  }}
                  sx={(t) => ({
                    borderRadius: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    flex: { xs: 1, sm: "none" },
                    color: t.palette.text.primary,
                    borderColor: alpha(t.palette.text.primary, t.palette.mode === "dark" ? 0.35 : 0.22),
                    bgcolor: t.palette.background.paper,
                    "&:hover": {
                      borderColor: t.palette.text.secondary,
                      bgcolor: t.palette.action.hover,
                    },
                  })}
                >
                  إعادة الضبط
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <FinancialReportSkeleton isAdmin={isAdmin} />
        ) : (
          financialreportData && <ReportComponent financialreportData={financialreportData} />
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Financialreports;
