import axios from "axios";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Orders.module.css";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import MDTypography from "components/MDTypography";
import Spinner from "components/Spinner/Spinner";
import CustomerDetails from "./components/CustomerDetails";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import OrderInfoCard from "./components/OrderInfoCard";
import PdfData from "./PdfData";
import { useReactToPrint } from "react-to-print";
import axiosRequest from "shared/functions/axiosRequest";
import BasicsInfoCard from "./components/BasicsInfoCard";
import { manufactureStatusOptions } from "shared/utils/constants";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PdfDataMobile from "./PdfDataMobile";

export const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "مؤكد", value: 3 },
  { label: "ملغي", value: 4 },
  { label: "قيد التصنيع ", value: 2 },
  { label: "تم التسليم", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "مستبدل ", value: 7 },
  { label: "في المخزن ", value: 8 },
];

const PAYMENT_STATUS = { 2: "مدفوع", 1: "دفع عند الاستلام" };

function OrderDetails() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [manufactureStatus, setManufactureStatus] = useState(null);
  const [slectedOrderLine, setSelectedOrderLine] = useState(null);
  const [orderTotalPrice, setOrderTotalPrice] = useState(null);
  const [orderTotalShipping, setOrderTotalShipping] = useState(null);
  const [orderTotalToBeCollected, setOrderTotalToBeCollected] = useState(null);
  const [orderTotalCost, setOrderTotalCost] = useState(null);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [orderlines, setOrderlines] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [administrator, setAdministrator] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFileUploadingloading, setIsFileUploadingloading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const componentRef = useRef();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isAdmin = user.userType === "1";
  const isVendor = user.userType === "2";

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const changeManufactureStatus = (status) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}`, {
        manufactureStatus: status,
      })
      .then(() => {
        NotificationMeassage("success", "تم التعديل بنجاح");
        setManufactureStatus(status);
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

  const updateComment = (noteId) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}/notes/${noteId}`, {
        text: editedCommentText,
      })
      .then((res) => {
        NotificationMeassage("success", "تم تعديل التعليق");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };
  const deleteComment = (noteId) => {
    axiosRequest
      .delete(`${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}/notes/${noteId}`)
      .then(() => {
        const updatedComments = comments.filter((comment) => comment.id !== noteId);
        setComments(updatedComments);

        NotificationMeassage("success", "تم حذف التعليق");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const handleAddComment = async () => {
    try {
      const { data } = await axiosRequest.post(
        `${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}/notes`,
        { text: commentText }
      );

      const newComment = {
        id: data.data.id,
        text: commentText,
        createdAt: new Date(),
        user: { firstName: user.firstName, lastName: user.lastName },
        attachments: selectedFiles,
        isEdited: true,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file.file);
        });
        await axios.post(
          `${process.env.REACT_APP_API_URL}/orders/${orderDetails.id}/notes/${newComment.id}/upload`,
          formData
        );
        setSelectedFiles([]);
        NotificationMeassage("success", "تم إضافة التعليق والمرفقات بنجاح");
      } else {
        NotificationMeassage("success", "تم إضافة التعليق");
      }
    } catch (error) {
      NotificationMeassage("error", "حدث خطأ أثناء إضافة التعليق أو رفع المرفقات");
    }
  };

  const getUser = () => {
    axiosRequest.get(`${process.env.REACT_APP_API_URL}/users`).then((res) => {
      const users = res.data.data;
      const user = users?.find((user) => user.id === orderDetails.userId);
      if (user) {
        setAdministrator(`${user.firstName} ${user.lastName}`);
      }
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previewFiles = files?.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedFiles(previewFiles);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };
  useEffect(() => {
    if (orderDetails) {
      getUser();
    }
  }, [orderDetails]);

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
        setManufactureStatus(data.data.manufactureStatus);
        const orderedComments = data.data?.notesList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComments(orderedComments);
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
          <PdfDataMobile ref={componentRef} orderDetails={orderDetails} />
          {/* <PdfData ref={componentRef} orderDetails={orderDetails} /> */}
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
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 5,
              }}
            >
              {orderDetails?.paymentStatus && (
                <div
                  style={{
                    background: "#4472C4",
                    color: "#fff",
                    padding: "7px 7px",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                >
                  {getPaymentValue(orderDetails?.paymentStatus)}
                </div>
              )}
              <div
                onClick={handlePrint}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#4472C4",
                    color: "#fff",
                    padding: "5px 5px",
                    borderRadius: "5px",
                  }}
                >
                  <Icon sx={{ margin: "0 5px" }}>
                    <PictureAsPdf />
                  </Icon>
                  <span style={{ fontSize: "16px" }}> الفاتوره</span>
                </Button>
              </div>
              {!isVendor && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/orders/edit/${id}`)}
                  sx={{
                    backgroundColor: "#4472C4",
                    color: "#fff",
                    padding: "5px 5px",
                    borderRadius: "5px",
                  }}
                >
                  <Icon sx={{ margin: "0 5px" }}>
                    <EditIcon />
                  </Icon>
                </Button>
              )}
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
                          shippedFromInventory={orderDetails.shippedFromInventory}
                        />
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <Card sx={{ height: "100%" }}>
                      {orderDetails && (
                        <BasicsInfoCard
                          orderDetails={{ ...orderDetails, administrator }}
                          orderTotalCost={orderTotalCost}
                          orderTotalPrice={orderTotalPrice}
                          orderTotalShipping={orderTotalShipping}
                          orderTotalToBeCollected={orderTotalToBeCollected}
                        />
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                    <Card sx={{ height: "100%" }}>
                      {orderDetails && (
                        <OrderInfoCard
                          orderDetails={{ ...orderDetails, administrator }}
                          orderTotalCost={orderTotalCost}
                          orderTotalPrice={orderTotalPrice}
                          orderTotalShipping={orderTotalShipping}
                          orderTotalToBeCollected={orderTotalToBeCollected}
                        />
                      )}
                      <FormControl style={{ margin: "0 10px 10px 10px", width: "60%" }}>
                        <InputLabel id="manufactureStatus">حالة التصنيع</InputLabel>
                        <Select
                          labelId="manufactureStatus"
                          id="manufactureStatus-select"
                          value={manufactureStatus}
                          label="حالة التصنيع"
                          onChange={(e) => changeManufactureStatus(e.target.value)}
                          sx={{ height: 35, background: "#eee" }}
                        >
                          {manufactureStatusOptions.map((option) => {
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
                  {orderlines.map((order) => {
                    return (
                      <Grid item xs={12} md={6} lg={6} key={order.id}>
                        <Card sx={{ padding: "20px", margin: "0px" }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                              padding: "10px 0",
                            }}
                          >
                            <img
                              src={order?.product.image}
                              alt={order.title}
                              width={300}
                              height={300}
                              style={{ borderRadius: 6 }}
                            />
                            <Typography sx={{ fontSize: "15px", color: "#000", marginTop: "10px" }}>
                              {order?.title}
                            </Typography>
                            <Typography sx={{ fontSize: "14px", color: "#000", marginTop: "4px" }}>
                              {Number(order?.product.variants[0].price).toFixed(0)} ج.م
                            </Typography>
                            <Chip
                              style={{ fontSize: "12px", marginTop: "6px" }}
                              label={order?.product?.title}
                              color="primary"
                              variant="filled"
                              size="small"
                              sx={{
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #000",
                                color: "#000",
                                whiteSpace: "normal",
                                lineHeight: "20px",
                                height: "auto",
                                paddingY: "2px",
                                "& .MuiChip-label": {
                                  whiteSpace: "normal",
                                  textAlign: "left",
                                },
                              }}
                            />
                            {order?.product?.type?.name && (
                              <Chip
                                style={{ fontSize: "12px", marginTop: "6px" }}
                                label={order?.product?.type?.name}
                                color="primary"
                                variant="filled"
                                size="small"
                                sx={{
                                  backgroundColor: "#f0f0f0",
                                  border: "1px solid #000",
                                  color: "#000",
                                  whiteSpace: "normal",
                                  lineHeight: "20px",
                                  height: "auto",
                                  paddingY: "2px",
                                  "& .MuiChip-label": {
                                    whiteSpace: "normal",
                                    textAlign: "left",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                  <Grid item xs={12} md={12} lg={12} sx={{ margin: "5px 0" }}>
                    <Card sx={{ padding: "10px 13px", margin: "10px" }}>
                      <Box component="form" display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="اكتب تعليقك هنا..."
                          multiline
                          rows={2}
                          variant="outlined"
                          sx={{
                            flexGrow: 1,
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "#999",
                              },
                              "&:hover fieldset": {
                                borderColor: "#115293",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#0d47a1",
                              },
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: "#999",
                              opacity: 1,
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {selectedFiles?.length > 0 ? (
                                  selectedFiles?.map((file, index) => (
                                    <Chip
                                      key={index}
                                      label={
                                        file.file.name?.length > 20
                                          ? file.file.name.slice(0, 10) +
                                            "..." +
                                            file.file.name.slice(-7)
                                          : file?.file.name
                                      }
                                      size="small"
                                      onDelete={() => handleRemoveFile(index)}
                                      variant="outlined"
                                      sx={{
                                        maxWidth: "120px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontSize: "12px",
                                        margin: "0 5px",
                                      }}
                                    />
                                  ))
                                ) : (
                                  <label htmlFor="comment-attachment">
                                    <input
                                      id="comment-attachment"
                                      type="file"
                                      hidden
                                      onChange={(e) => handleFileChange(e)}
                                      accept="image/png, image/jpeg, image/jpg"
                                      // , application/pdf
                                    />
                                    <IconButton component="span">
                                      <AttachFileIcon />
                                    </IconButton>
                                  </label>
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          disabled={!commentText && !selectedFiles?.length}
                          variant="contained"
                          sx={{ backgroundColor: "#007aff", color: "#fff" }}
                          onClick={handleAddComment}
                        >
                          إضافة
                        </Button>
                      </Box>
                    </Card>
                  </Grid>{" "}
                </Grid>
                {comments.map((comment, index) => {
                  const commentMaker = `${comment.user?.firstName} ${comment.user?.lastName}`;
                  const imageUrl = comment?.attachments?.[0]?.url
                    ? comment.isEdited
                      ? comment.attachments[0].url
                      : `${process.env.REACT_APP_API_URL}/${comment.attachments[0].url}`
                    : null;

                  return (
                    <Card
                      key={index}
                      sx={{ mb: 2, p: 2, backgroundColor: "#fdfdfd", border: "1px solid #ddd" }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                          <Chip
                            label={commentMaker}
                            size="small"
                            sx={{
                              backgroundColor: "#e0e0e0",
                              color: "#000",
                              fontSize: "11px",
                              borderRadius: "4px",
                              height: "24px",
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingIndex(index);
                              setEditedCommentText(comment.text);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {imageUrl && (
                        <Box mt={1}>
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            // style={{ width: "100%", display: "flex", justifyContent: "center" }}
                          >
                            <img
                              src={imageUrl}
                              alt="comment_attachment"
                              style={{
                                maxHeight: "250px",
                                borderRadius: "6px",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </a>
                        </Box>
                      )}

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
                              variant="contained"
                              size="small"
                              onClick={() => {
                                const updated = [...comments];
                                updated[index].text = editedCommentText;
                                setComments(updated);
                                setEditingIndex(null);
                                updateComment(comment.id);
                              }}
                              sx={{ color: "#fff" }}
                            >
                              حفظ
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => setEditingIndex(null)}
                            >
                              إلغاء
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body1" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                          {comment.text}
                        </Typography>
                      )}
                    </Card>
                  );
                })}
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
