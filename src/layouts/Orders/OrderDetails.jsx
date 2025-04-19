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
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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
import CloseIcon from "@mui/icons-material/Close";
import axiosRequest from "shared/functions/axiosRequest";

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [orderlines, setOrderlines] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const componentRef = useRef();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isAdmin = user.userType === "1";

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const changeOrderStatus = (status) => {
    axiosRequest
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

  const onEdit = (notes, cost, id, color, size, material, itemShipping, toBeCollected) => {
    axiosRequest
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

  const sendNewComment = () => {
    axiosRequest
      .post(`${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}/notes`, {
        text: commentText,
      })
      .then((res) => {
        NotificationMeassage("success", "تم اضافة التعليق");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [{ text: commentText, createdAt: new Date() }, ...prev]);
    setCommentText("");
    sendNewComment();
  };

  useEffect(() => {
    const getOrderDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosRequest.get(`${process.env.REACT_APP_API_URL}/orders/${id}`);
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
        setSelectedProduct(data.data.orderLines[0]);
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
                      {orderDetails && (
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
                  <Grid item xs={12} md={6} lg={6}>
                    <Card sx={{ padding: "17px", margin: "10px" }}>
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent={"center"}
                        flexDirection={"column"}
                        gap={1}
                        mt={1}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={selectedProduct?.product.image}
                              alt={selectedProduct.title}
                              width={40}
                              height={40}
                              style={{ borderRadius: 4 }}
                            />
                            <Typography
                              sx={{ fontSize: "15px", color: "#000", marginLeft: "10px" }}
                            >
                              {selectedProduct?.title}
                            </Typography>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", margin: "0 20px" }}>
                            <Typography
                              sx={{ fontSize: "15px", color: "#000", marginLeft: "10px" }}
                            >
                              {Number(selectedProduct?.product.variants[0].price).toFixed(0)} ج.م
                            </Typography>
                          </div>
                        </div>
                        <Chip
                          style={{ fontSize: "10px" }}
                          label={selectedProduct?.product.variants[0].title}
                          color="primary"
                          variant="filled"
                          size="small"
                          sx={{
                            backgroundColor: "#f0f0f0",
                            margin: "2px 2px 2px 0",
                            border: "1px solid #00000099",
                            color: "#000",
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={6} sx={{ margin: "5px 0" }}>
                    <Card sx={{ padding: "13px", margin: "10px" }}>
                      <TextField
                        fullWidth
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="اكتب تعليقك هنا..."
                        multiline
                        variant="outlined"
                      />

                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button
                          disabled={!commentText}
                          variant="text"
                          sx={{ color: "#007aff" }}
                          onClick={handleAddComment}
                        >
                          إضافة
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
                {comments.map((comment, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "#f9f9f9",
                      padding: "10px",
                      borderRadius: "8px",
                      mb: 1,
                      border: "1px solid #ddd",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px" }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>

                    {editingIndex === index ? (
                      <>
                        <TextField
                          fullWidth
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                          multiline
                          size="small"
                          sx={{ mt: 1 }}
                        />
                        <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              const updated = [...comments];
                              updated[index].text = editedCommentText;
                              setComments(updated);
                              setEditingIndex(null);
                            }}
                          >
                            حفظ
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            color="error"
                            onClick={() => setEditingIndex(null)}
                          >
                            إلغاء
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1" sx={{ fontSize: "16px", mt: 1 }}>
                            {comment.text}
                          </Typography>

                          <Button
                            size="small"
                            onClick={() => {
                              setEditingIndex(index);
                              setEditedCommentText(comment.text);
                            }}
                          >
                            تعديل
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
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
