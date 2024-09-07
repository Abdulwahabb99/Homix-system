import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ReportComponent from "./ReportComponent";
import { Box, Button, Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import axios from "axios";
import Spinner from "components/Spinner/Spinner";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

function Financialreports() {
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
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
  axios.interceptors.request.use(
    (config) => {
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  const getVendors = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/vendors`)
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
      axios
        .get(
          `${process.env.REACT_APP_API_URL}/orders/financialReport/?vendorId=${user.vendorId}&endDate=${endDate}&startDate=${startDate}`
        )
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
            deliveredOrders: data.data.DeliveredOrders,
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
        ? `${process.env.REACT_APP_API_URL}/orders/financialReport/?vendorId=${selectedVendor}&endDate=${endDate}&startDate=${startDate}`
        : `${process.env.REACT_APP_API_URL}/orders/financialReport/?endDate=${endDate}&startDate=${startDate}`;

      axios
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
            deliveredOrders: data.data.DeliveredOrders,
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
    <div style={{ margin: "20px 0" }}>
      <DashboardLayout>
        <DashboardNavbar />
        <ToastContainer />
        <Grid container spacing={2}>
          <Grid item xs={6} md={3} lg={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h6"
                component="label"
                htmlFor="start-date"
                sx={{ marginBottom: "8px" }}
              >
                تاريخ البدأ
              </Typography>

              <TextField
                id="start-date"
                variant="outlined"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item xs={6} md={3} lg={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h6"
                component="label"
                htmlFor="start-date"
                sx={{ marginBottom: "8px" }}
              >
                تاريخ الانتهاء{" "}
              </Typography>

              <TextField
                id="start-date"
                variant="outlined"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputProps={{
                  inputProps: {
                    max: formattedDate,
                  },
                }}
              />
            </Box>
          </Grid>
          {isAdmin && (
            <Grid item xs={6} md={3} lg={3}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  minWidth: "150px",
                }}
              >
                <Typography
                  variant="h6"
                  component="label"
                  htmlFor="vendors"
                  sx={{ marginBottom: "8px" }}
                >
                  المصنعين{" "}
                </Typography>
                <Select
                  labelId="vendors"
                  id="vendors"
                  value={selectedVendor}
                  label="حالة الطلب"
                  fullWidth
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  sx={{ height: 43 }}
                >
                  {vendors.map((option) => {
                    return (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
            </Grid>
          )}
          <Grid item xs={6} md={3} lg={3} justifyContent={"center"}>
            <Button
              variant="contained"
              color="primary"
              onClick={getFinancialreport}
              style={{ color: "#fff", marginTop: "2.1rem" }}
            >
              بحث
            </Button>
          </Grid>
        </Grid>

        {financialreportData && !isLoading ? (
          <ReportComponent financialreportData={financialreportData} />
        ) : (
          <Spinner />
        )}
      </DashboardLayout>
    </div>
  );
}

export default Financialreports;
