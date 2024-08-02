import axios from "axios";
import MDBox from "components/MDBox";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Orders.module.css";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import MDTypography from "components/MDTypography";
import Spinner from "components/Spinner/Spinner";
import CustomerDetails from "./components/CustomerDetails";
import { Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select } from "@mui/material";

const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "قيد التنفيذ", value: 2 },
  { label: "رفض", value: 3 },
  { label: "تم التنفيذ", value: 4 },
  { label: "خارج للتوصيل", value: 5 },
  { label: "تم التسليم", value: 6 },
  { label: "مسترجع", value: 7 },
  { label: "ملغي", value: 8 },
];

function OrderDetails() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
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
  const changeOrderStatus = (value) => {
    setOrderStatus(value);
  };
  useEffect(() => {
    const getOrderDetails = async () => {
      setIsLoading(true);
      try {
        const { data: data } = await axios.get(`https://homix.onrender.com/orders/${id}`);
        setOrderDetails(data.data);
        setOrderStatus(data.data.status);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getOrderDetails();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {!isLoading ? (
        <>
          <div className={styles.orderDetailsHeader}>
            <IconButton className={styles.backbtn} color="#344767" onClick={() => navigate(-1)}>
              <ArrowNextIcon />
            </IconButton>
            <MDTypography variant="h5" fontWeight="medium">
              {orderDetails?.name}
            </MDTypography>
          </div>
          <MDBox py={3}>
            <MDBox>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                  <Card sx={{ height: "100%" }}>
                    {orderDetails?.customer && (
                      <CustomerDetails
                        customerName={`${orderDetails?.customer.firstName} ${orderDetails.customer.lastName}`}
                        email={orderDetails?.customer.email}
                        address={
                          orderDetails?.customer.address
                            ? orderDetails.customer.address
                            : orderDetails.customer.address2
                        }
                        phoneNumber={
                          orderDetails?.customer.phoneNumber
                            ? orderDetails.customer.phoneNumber
                            : ""
                        }
                      />
                    )}
                    <FormControl style={{ margin: "0 10px 10px 10px", width: "60%" }}>
                      <InputLabel id="orderStatus">حالة الطلب</InputLabel>
                      <Select
                        labelId="orderStatus"
                        id="orderStatus-select"
                        value={orderStatus}
                        label="حالة الطلب"
                        onChange={(e) => changeOrderStatus(e.target.value)}
                        sx={{ height: 35, background: "#eee" }}
                      >
                        {statusoptions.map((option) => {
                          return (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8} lg={8}>
                  <OrdersOverview />
                </Grid>
              </Grid>
            </MDBox>
          </MDBox>
        </>
      ) : (
        <Spinner />
      )}
    </DashboardLayout>
  );
}

export default OrderDetails;
