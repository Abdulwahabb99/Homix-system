import axios from "axios";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Orders.module.css";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
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
  useMediaQuery,
} from "@mui/material";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import { Edit } from "@mui/icons-material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import OrderInfoCard from "./components/OrderInfoCard";
import PdfData from "./PdfData";
import { useReactToPrint } from "react-to-print";

const itemStatusOptions = [
  { label: "غير مؤكد", value: 1 },
  { label: "مؤكد", value: 2 },
  { label: "ملغي", value: 3 },
];
const lineStatusOptions = [
  { label: "قيد التصنيع​", value: 1 },
  { label: "مرفوض ", value: 2 },
  { label: "جاهز للشحن​", value: 3 },
  { label: "جاري التوصيل", value: 4 },
  { label: "تم التوصيل​", value: 5 },
];

const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "قيد التنفيذ", value: 2 },
  { label: "نصف مكتمل", value: 3 },
  { label: "جاري التوصيل ", value: 4 },
  { label: "تم التوصيل", value: 5 },
  { label: "ملغي ", value: 6 },
  { label: "استبدال ", value: 7 },
];

const PAYMENT_STATUS = { 1: "مدفوع", 2: "دفع عند الاستلام" };

function OrderDetails() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [slectedOrderLine, setSelectedOrderLine] = useState(null);
  const [orderTotalPrice, setOrderTotalPrice] = useState(null);
  const [orderTotalShipping, setOrderTotalShipping] = useState(null);
  const [orderTotalToBeCollected, setOrderTotalToBeCollected] = useState(null);
  const [orderTotalCost, setOrderTotalCost] = useState(null);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [orderlines, setOrderlines] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const componentRef = useRef();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const changeOrderStatus = (status) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}`, {
        status: status,
      })
      .then(() => {
        NotificationMeassage("success", "تم التعديل بنجاح");
        setOrderStatus(status);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };
  const handleChangeLinesStatus = (value, id) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/orderLines/${id}`, {
        status: value,
      })
      .then(() => {
        setOrderlines((prevDetails) => {
          return prevDetails?.map((item) => (item.id === id ? { ...item, status: value } : item));
        });
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch((error) => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const handleChangeItemStatus = (value, id) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/orderLines/${id}`, {
        itemStatus: value,
      })
      .then(() => {
        setOrderlines((prevDetails) => {
          return prevDetails?.map((item) =>
            item.id === id ? { ...item, itemStatus: value } : item
          );
        });
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch((error) => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const onEdit = (notes, cost, id, color, size, material, itemShipping, toBeCollected) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/orderLines/${id}`, {
        notes: notes,
        color: color,
        size: size,
        material: material,
        itemShipping: itemShipping,
        cost: Number(cost),
        toBeCollected: Number(toBeCollected),
      })
      .then((res) => {
        setOrderlines((prevDetails) => {
          return prevDetails?.map((item) =>
            item.id === id
              ? {
                  ...item,
                  color: color,
                  size: size,
                  material: material,
                  notes: notes,
                  itemShipping: itemShipping,
                  unitCost: Number(cost),
                  toBeCollected: toBeCollected,
                }
              : item
          );
        });
        NotificationMeassage("success", "تم التعديل بنجاح");
        setTimeout(() => {
          window.location.reload();
          setIsEditModalOpenned(false);
        }, 1000);
      })
      .catch((error) => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };
  const getPaymentValue = (status) => {
    const resultValue = PAYMENT_STATUS[status];
    return resultValue;
  };
  useEffect(() => {
    const getOrderDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/orders/${id}`);
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }
        let orderPrice = 0;
        let ordercost = 0;
        let itemShipping = 0;
        let toBeCollected = 0;
        data.data.orderLines.forEach((item) => {
          orderPrice += Number(item.price) * Number(item.quantity);
          ordercost += Number(item.unitCost) * Number(item.quantity);
          itemShipping += Number(item.itemShipping);
          toBeCollected += Number(item.toBeCollected);
        });
        setOrderTotalPrice(orderPrice);
        setOrderTotalCost(ordercost);
        setOrderTotalShipping(itemShipping);
        setOrderTotalToBeCollected(toBeCollected);
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

  return (
    <>
      {orderDetails?.id && (
        <div style={{ display: "none" }}>
          <PdfData ref={componentRef} orderDetails={orderDetails} />
        </div>
      )}
      <DashboardLayout>
        <DashboardNavbar />
        <ToastContainer />
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <IconButton color="#344767" onClick={() => navigate("/orders")}>
                  <ArrowNextIcon />
                </IconButton>
                <MDTypography variant="h5" fontWeight="medium">
                  {orderDetails?.name}
                </MDTypography>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {orderDetails?.paymentStatus && (
                  <div
                    style={{
                      background: "#4472C4",
                      color: "#fff",
                      padding: "5px 5px",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                  >
                    {getPaymentValue(orderDetails?.paymentStatus)}
                  </div>
                )}
                {!isSmallScreen && isAdmin && (
                  <div
                    onClick={handlePrint}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Icon>
                      <PictureAsPdf />
                    </Icon>
                  </div>
                )}
              </div>
            </div>
            <MDBox py={3}>
              <MDBox>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6} lg={6}>
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
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <Card sx={{ height: "100%" }}>
                      {Object.keys(orderDetails).length && orderTotalPrice && orderTotalCost && (
                        <OrderInfoCard
                          orderDetails={orderDetails}
                          orderTotalCost={orderTotalCost}
                          orderTotalPrice={orderTotalPrice}
                          orderTotalShipping={orderTotalShipping}
                          orderTotalToBeCollected={orderTotalToBeCollected}
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
                  {orderlines?.map((product) => {
                    return (
                      <>
                        <Grid item xs={12} md={4} lg={4} key={product.id}>
                          <Card
                            sx={{
                              maxWidth: 345,
                              maxHeight: 800,
                              minHeight: 800,
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
                              <Typography variant="h6" component="div">
                                اجمالي التكلفة{" "}
                              </Typography>
                              <Typography variant="body2" color="black">
                                <span>
                                  {Number(product?.unitCost).toFixed(0)} ×
                                  <span style={{ margin: "0 10px" }}>
                                    {(
                                      Number(product?.unitCost) * Number(product?.quantity)
                                    ).toFixed(0)}
                                  </span>
                                  {product?.quantity}
                                </span>
                              </Typography>
                              <Typography variant="h6" component="div">
                                اللون{" "}
                              </Typography>
                              <Typography variant="body2" color="black">
                                {product?.color}
                              </Typography>
                              <Typography variant="h6" component="div">
                                المقاس{" "}
                              </Typography>
                              <Typography variant="body2" color="black">
                                {product?.size || ""}
                              </Typography>
                              <Typography variant="h6" component="div">
                                الخامات{" "}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "14px", fontWeight: "300" }}
                                color="black"
                              >
                                {product?.material || ""}
                              </Typography>
                              <FormControl style={{ margin: "12px 0 0 0", width: "100%" }}>
                                <InputLabel id="lineStatus">حالة التصنيع</InputLabel>
                                <Select
                                  labelId="lineStatus"
                                  id="lineStatus-select"
                                  value={product.status}
                                  label="حالة التصنيع"
                                  onChange={(e) =>
                                    handleChangeLinesStatus(e.target.value, product.id)
                                  }
                                  sx={{ height: 35, background: "#eee" }}
                                >
                                  {lineStatusOptions.map((option) => {
                                    return (
                                      <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                              <FormControl style={{ margin: "15px 0", width: "100%" }}>
                                <InputLabel id="itemStatus">حالة الطلب</InputLabel>
                                <Select
                                  labelId="itemStatus"
                                  id="itemStatus-select"
                                  value={product.itemStatus}
                                  label="حالة الطلب"
                                  onChange={(e) =>
                                    handleChangeItemStatus(e.target.value, product.id)
                                  }
                                  sx={{ height: 35, background: "#eee" }}
                                  disabled={user?.userType !== "1"}
                                >
                                  {itemStatusOptions.map((option) => {
                                    return (
                                      <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                              {product?.notes && (
                                <>
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
    </>
  );
}

export default OrderDetails;
