import axios from "axios";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Orders.module.css";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import MDTypography from "components/MDTypography";
import Spinner from "components/Spinner/Spinner";
import CustomerDetails from "./components/CustomerDetails";
import {
  Card,
  CardContent,
  CardMedia,
  FormControl,
  Grid,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import OrderProducts from "./OrderProducts";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import { Edit } from "@mui/icons-material";

const statusValues = {
  1: "معلق",
  2: "قيد التنفيذ",
  3: "رفض",
  4: "تم التنفيذ",
  5: "خارج للتوصيل",
  6: "تم التسليم",
  7: "مسترجع",
  8: "ملغي",
};
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
  const [slectedOrderLine, setSelectedOrderLine] = useState(null);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [orderlines, setOrderlines] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  console.log(orderDetails);

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

  const getProductStatus = (status) => {
    return statusValues[status];
  };
  const changeOrderStatus = (status) => {
    axios
      .put(`https://homix.onrender.com/orders/${orderDetails.id}`, {
        status: status,
      })
      .then((res) => {
        console.log(res);
        setOrderStatus(status);
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
      });
  };
  const onEdit = (status, notes, cost, id) => {
    axios
      .put(`https://homix.onrender.com/orderLines/${id}`, {
        notes: notes,
        status: status,
        cost: Number(cost),
      })
      .then((res) => {
        setOrderlines((prevDetails) => {
          return prevDetails?.map((item) =>
            item.id === id
              ? { ...item, status: status, notes: notes, unitCost: Number(cost) }
              : item
          );
        });
        setIsEditModalOpenned(false);
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
      });
  };

  useEffect(() => {
    const getOrderDetails = async () => {
      setIsLoading(true);
      try {
        const { data: data } = await axios.get(`https://homix.onrender.com/orders/${id}`);
        setOrderDetails(data.data);
        setOrderlines(data.data.orderLines);
        setOrderStatus(data.data.status);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getOrderDetails();
  }, []);
  useEffect(() => {
    return () => {
      user === null;
    };
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {isEditModalOpenned && slectedOrderLine && (
        <EditOrderProductsModal
          open={isEditModalOpenned}
          onClose={() => {
            setIsEditModalOpenned(false);
          }}
          onEdit={onEdit}
          data={slectedOrderLine}
        />
      )}
      {!isLoading ? (
        <>
          <div className={styles.orderDetailsHeader}>
            <IconButton color="#344767" onClick={() => navigate(-1)}>
              <ArrowNextIcon />
            </IconButton>
            <MDTypography variant="h5" fontWeight="medium">
              {orderDetails?.name}
            </MDTypography>
          </div>
          <MDBox py={3}>
            <MDBox>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
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
                    {user?.userType === "1" && (
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
                    )}{" "}
                  </Card>
                </Grid>
                {orderlines.map((product) => {
                  return (
                    <>
                      <Grid item xs={12} md={4} lg={4} key={product.id}>
                        <Card
                          sx={{
                            maxWidth: 345,
                            maxHeight: 550,
                            minHeight: 550,
                            "@media (max-width: 600px)": {
                              maxHeight: "none",
                              maxWidth: "none",
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={product.product?.image}
                            alt={product?.product.title}
                            sx={{ objectFit: "fill", maxHeight: "200px" }}
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                              {product?.product.title}
                            </Typography>
                            <Typography variant="h6" component="div">
                              السعر الاجمالي{" "}
                            </Typography>
                            <Typography variant="body2" color="black">
                              <span>
                                {Number(product?.price).toFixed(0)} ×
                                <span style={{ margin: "0 10px" }}>
                                  {Number(product?.price) * Number(product?.quantity)}
                                </span>
                                {product?.quantity}
                              </span>
                            </Typography>
                            <Typography gutterTop variant="h6" component="div">
                              اجمالي التكلفة{" "}
                            </Typography>
                            <Typography variant="body2" color="black">
                              <span>
                                {Number(product?.unitCost).toFixed(0)} ×
                                <span style={{ margin: "0 10px" }}>
                                  {(Number(product?.unitCost) * Number(product?.quantity)).toFixed(
                                    0
                                  )}
                                </span>
                                {product?.quantity}
                              </span>
                            </Typography>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Typography variant="body2" color="text.secondary">
                                {product.product.vendor?.name}
                              </Typography>
                              <div
                                onClick={() => {
                                  setSelectedOrderLine(product);
                                  setIsEditModalOpenned(true);
                                }}
                              >
                                <Icon sx={{ color: "#333", cursor: "pointer" }}>
                                  <Edit />
                                </Icon>
                              </div>
                            </div>
                            <Typography gutterBottom variant="h6" component="div">
                              الحالة :
                              <span
                                style={{ fontSize: "15px", fontWeight: "normal", margin: "0 5px" }}
                              >
                                {getProductStatus(product?.status)}
                              </span>
                            </Typography>
                            {product?.notes && (
                              <>
                                {" "}
                                <Typography variant="h6" component="div">
                                  الملاحظات
                                </Typography>
                                <Typography
                                  gutterBottom
                                  variant="caption"
                                  component="div"
                                  className={styles.notes}
                                >
                                  {product?.notes}
                                </Typography>
                              </>
                            )}{" "}
                          </CardContent>
                        </Card>
                      </Grid>
                    </>
                  );
                })}
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
