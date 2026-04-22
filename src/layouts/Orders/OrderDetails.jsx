import axios from "axios";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import CustomerDetails from "./components/CustomerDetails";
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import OrderInfoCard from "./components/OrderInfoCard";
import { useReactToPrint } from "react-to-print";
import axiosRequest from "shared/functions/axiosRequest";
import BasicsInfoCard from "./components/BasicsInfoCard";
import { manufactureStatusOptions } from "shared/utils/constants";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PdfDataMobile from "./PdfDataMobile";
import OrderDetailsSkeleton from "./components/OrderDetailsSkeleton";

const PRIMARY = "primary.main";

const homixCardSx = {
  height: "100%",
  borderRadius: 2.5,
  border: "1px solid",
  borderColor: "divider",
  borderInlineStart: (t) => `3px solid ${t.palette.primary.main}`,
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
  overflow: "hidden",
};

const financeCardSx = {
  ...homixCardSx,
  borderInlineStart: (t) => `3px solid ${t.palette.success.main}`,
};

function SectionHeader({ children, count }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 2,
        mt: 0,
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{ width: 3, minHeight: 24, borderRadius: 0.5, bgcolor: "primary.main", flexShrink: 0 }}
      />
      <Typography
        variant="subtitle1"
        fontWeight={800}
        color="text.primary"
        component="h2"
        fontSize="1.05rem"
      >
        {children}
      </Typography>
      {count != null && (
        <Chip
          label={count}
          size="small"
          sx={{
            height: 24,
            fontWeight: 700,
            fontSize: "0.7rem",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            color: "primary.dark",
          }}
        />
      )}
    </Box>
  );
}

SectionHeader.propTypes = {
  children: PropTypes.node,
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const getManufactureFormControlSx = (theme) => ({
  width: "100%",
  mt: 2,
  mx: 0,
  px: 2,
  pb: 2,
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: PRIMARY,
    "&.Mui-focused": { color: PRIMARY },
    "&.MuiInputLabel-shrink": { color: PRIMARY },
    // يبقي عنوان حالة التصنيع داخل الإطار في RTL (ما يطلعش بره يمين/شمال)
    left: "auto",
    right: "auto",
    insetInlineStart: theme.spacing(1.75),
    insetInlineEnd: theme.spacing(1.75),
    maxWidth: `calc(100% - ${theme.spacing(3.5)})`,
    transformOrigin: theme.direction === "rtl" ? "top right" : "top left",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    transformOrigin: theme.direction === "rtl" ? "top right" : "top left",
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    backgroundColor: "background.paper",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.28)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.45)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2, borderColor: PRIMARY },
  },
  "& .MuiSelect-select": { py: 1.75, px: 1.5, fontSize: "0.875rem" },
});

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
        const list = data.data?.notesList ?? [];
        const orderedComments = list
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComments(orderedComments);
      } catch (error) {
        console.error("Error fetching order:", error);
        NotificationMeassage("error", "حدث خطأ أثناء تحميل الطلب");
      } finally {
        setIsLoading(false);
      }
    };

    getOrderDetails();
  }, [id, navigate]);

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
        <Box
          sx={{
            maxWidth: 1680,
            mx: "auto",
            width: "100%",
            px: { xs: 2, sm: 3 },
            py: 2.5,
            minHeight: "50vh",
          }}
        >
          {isLoading ? (
            <OrderDetailsSkeleton />
          ) : !orderDetails ? null : (
            <>
              <Box
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  background: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "linear-gradient(135deg, rgba(6, 49, 70, 0.06) 0%, rgba(255,255,255,0.95) 48%, rgba(255,255,255,1) 100%)",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: { xs: 2, sm: 1.5 },
                    width: "100%",
                    minWidth: 0,
                    overflow: "visible",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                      flex: { sm: 1 },
                    }}
                  >
                    <IconButton
                      onClick={() => navigate(-1)}
                      aria-label="رجوع"
                      size="small"
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        color: "primary.main",
                        flexShrink: 0,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ArrowBackIosNewIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} />
                    </IconButton>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        fontSize="0.75rem"
                      >
                        تفاصيل الطلب
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="text.primary"
                        fontSize="1.15rem"
                        sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {orderDetails?.name || orderDetails?.code || "—"}
                      </Typography>
                      {orderDetails?.code && orderDetails?.name && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontSize="0.8125rem"
                          sx={{ mt: 0.25 }}
                        >
                          رقم العملية: {orderDetails.code}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    useFlexGap
                    spacing={1}
                    alignItems="center"
                    sx={{
                      flexShrink: 0,
                      gap: 1,
                      width: { xs: "100%", sm: "auto" },
                      maxWidth: "100%",
                      justifyContent: { xs: "flex-start", sm: "flex-end" },
                      alignSelf: { sm: "center" },
                    }}
                  >
                    {orderDetails?.paymentStatus && (
                      <Chip
                        label={getPaymentValue(orderDetails?.paymentStatus)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                          height: 32,
                          flexShrink: 0,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: (t) => alpha(t.palette.primary.main, 0.28),
                        }}
                      />
                    )}
                    <Button
                      type="button"
                      variant="outlined"
                      color="primary"
                      startIcon={<PictureAsPdf fontSize="small" />}
                      onClick={handlePrint}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderColor: "primary.main",
                        color: "primary.main",
                        flexShrink: 0,
                        minWidth: "max-content",
                        whiteSpace: "nowrap",
                        bgcolor: "background.paper",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      الفاتورة
                    </Button>
                    {!isVendor && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/orders/edit/${id}`)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          boxShadow: "none",
                          flexShrink: 0,
                          minWidth: "max-content",
                        }}
                      >
                        تعديل
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Box>

              <SectionHeader>ملخّص الطلب</SectionHeader>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
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
                        orderDetails?.customer.phoneNumber ? orderDetails.customer.phoneNumber : ""
                      }
                      shippedFromInventory={orderDetails.shippedFromInventory}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  {orderDetails && (
                    <BasicsInfoCard
                      orderDetails={{ ...orderDetails, administrator }}
                      orderTotalCost={orderTotalCost}
                      orderTotalPrice={orderTotalPrice}
                      orderTotalShipping={orderTotalShipping}
                      orderTotalToBeCollected={orderTotalToBeCollected}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <Card
                    sx={{
                      ...financeCardSx,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {orderDetails && (
                      <OrderInfoCard
                        orderDetails={{ ...orderDetails, administrator }}
                        orderTotalCost={orderTotalCost}
                        orderTotalPrice={orderTotalPrice}
                        orderTotalShipping={orderTotalShipping}
                        orderTotalToBeCollected={orderTotalToBeCollected}
                      />
                    )}
                    <FormControl fullWidth variant="outlined" sx={getManufactureFormControlSx}>
                      <InputLabel id="manufactureStatus">حالة التصنيع</InputLabel>
                      <Select
                        labelId="manufactureStatus"
                        id="manufactureStatus-select"
                        value={manufactureStatus}
                        label="حالة التصنيع"
                        onChange={(e) => changeManufactureStatus(e.target.value)}
                        color="primary"
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
                <Grid item xs={12} sx={{ mt: { xs: 0.5, md: 0 } }}>
                  <Box sx={{ pt: 1 }}>
                    <SectionHeader count={orderlines.length}>المنتجات</SectionHeader>
                  </Box>
                </Grid>
                {orderlines.map((order, lineIndex) => {
                  const ordervariant = order?.product?.variants?.find(
                    (variant) => variant.shopifyId === order?.variant_id
                  );
                  const lineChipSx = {
                    mt: 0.75,
                    fontSize: "0.75rem",
                    whiteSpace: "normal",
                    lineHeight: 1.35,
                    height: "auto",
                    py: 0.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                    border: "1px solid",
                    borderColor: "rgba(6, 49, 70, 0.22)",
                    color: "text.primary",
                    "& .MuiChip-label": { whiteSpace: "normal" },
                  };

                  return (
                    <Grid item xs={12} sm={6} md={4} key={order.id}>
                      <Card
                        sx={{
                          ...homixCardSx,
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography variant="caption" fontWeight={800} color="primary.main">
                            منتج
                          </Typography>
                          <Chip
                            label={`#${lineIndex + 1}`}
                            size="small"
                            sx={{ height: 24, fontWeight: 800, fontSize: "0.7rem" }}
                          />
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            flex: 1,
                          }}
                        >
                          <Box
                            component="img"
                            src={order?.product?.image}
                            alt={order?.title}
                            sx={{
                              width: "100%",
                              maxWidth: 280,
                              height: "auto",
                              maxHeight: 300,
                              objectFit: "cover",
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              color: "primary.main",
                              mt: 1.5,
                            }}
                          >
                            {order?.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {order?.product?.variants?.[0]
                              ? `${Number(order.product.variants[0].price).toFixed(0)} ج.م`
                              : "—"}
                          </Typography>
                          {ordervariant?.title !== "Default Title" && (
                            <Chip label={ordervariant?.title} size="small" sx={lineChipSx} />
                          )}
                          {order?.product?.type?.name && (
                            <Chip label={order?.product?.type?.name} size="small" sx={lineChipSx} />
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
                <Grid item xs={12}>
                  <Box sx={{ pt: 2 }}>
                    <SectionHeader>تعليق جديد</SectionHeader>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ ...homixCardSx, p: 2 }}>
                    <Box
                      component="form"
                      display="flex"
                      alignItems="flex-end"
                      flexWrap="wrap"
                      gap={1.5}
                    >
                      <TextField
                        fullWidth
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="اكتب تعليقك هنا..."
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                        color="primary"
                        sx={{
                          flex: "1 1 240px",
                          minWidth: 0,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                              borderWidth: 2,
                            },
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
                                      file.file?.name?.length > 20
                                        ? file.file?.name.slice(0, 10) +
                                          "..." +
                                          file.file?.name.slice(-7)
                                        : file?.file?.name
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
                        color="primary"
                        onClick={handleAddComment}
                        sx={{ fontWeight: 600, minWidth: 96, flexShrink: 0 }}
                      >
                        إضافة
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, mb: 2 }}>
                <SectionHeader>سجل التعليقات</SectionHeader>
              </Box>

              <Stack spacing={2} sx={{ mt: 0 }}>
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
                      elevation={0}
                      sx={{
                        ...homixCardSx,
                        p: 2.5,
                        borderInlineStart: (t) => `3px solid ${t.palette.info.main}`,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                          <Chip
                            label={commentMaker}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: 24,
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              color: "primary.dark",
                            }}
                          />
                        </Box>
                        <Box display="flex" gap={0.75}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingIndex(index);
                              setEditedCommentText(comment.text);
                            }}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.paper",
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteComment(comment.id)}
                            sx={{
                              border: "1px solid",
                              borderColor: (t) => alpha(t.palette.error.main, 0.35),
                              bgcolor: (t) => alpha(t.palette.error.main, 0.04),
                            }}
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
                            color="primary"
                            sx={{ mt: 1 }}
                          />
                          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => {
                                const updated = [...comments];
                                updated[index].text = editedCommentText;
                                setComments(updated);
                                setEditingIndex(null);
                                updateComment(comment.id);
                              }}
                            >
                              حفظ
                            </Button>
                            <Button
                              variant="outlined"
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
              </Stack>
            </>
          )}
        </Box>
      </DashboardLayout>
    </>
  );
}

export default OrderDetails;
