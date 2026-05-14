import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
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
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import { OrderStatusChip, DeliveryStatusChip } from "./components/OrderStatusChips";
import { SelectComponent } from "components/ui";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import OrderInfoCard from "./components/OrderInfoCard";
import axiosRequest from "shared/functions/axiosRequest";
import BasicsInfoCard from "./components/BasicsInfoCard";
import { manufactureStatusOptions } from "shared/utils/constants";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import PdfDataMobile from "./PdfDataMobile";
import { downloadOrderInvoicePdf } from "./utils/invoicePdf";
import OrderDetailsSkeleton from "./components/OrderDetailsSkeleton";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";

const PRIMARY = "primary.main";

const homixCardSx = {
  height: "100%",
  borderRadius: 2.5,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
  overflow: "hidden",
};

const financeCardSx = {
  ...homixCardSx,
};

/** نص وصف المنتج من بيانات البند؛ يُرجع سلسلة فارغة إن لم يوجد وصف (لا يُعرض الصندوق). */
function getOrderLineProductDescriptionPlainText(line) {
  const p = line?.product;
  if (!p) return "";
  const raw = p.description ?? p.bodyHtml ?? p.body_html;
  if (raw == null) return "";
  const s = String(raw);
  if (!s.trim()) return "";
  return s
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function SectionHeader({ children, count }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 1.75,
        mt: 0,
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{ width: 3, minHeight: 24, borderRadius: 0.5, bgcolor: "primary.main", flexShrink: 0 }}
      />
      <Typography
        variant="subtitle2"
        fontWeight={800}
        color="text.primary"
        component="h2"
        sx={{ fontSize: "1.01rem" }}
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
            fontSize: "0.76rem",
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
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [administrator, setAdministrator] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFileUploadingloading, setIsFileUploadingloading] = useState(false);
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement | null>(null);
  const isVendor = user.userType === "2";

  const handleDownloadInvoice = async () => {
    if (!componentRef.current) {
      NotificationMeassage("error", "تعذر تجهيز الفاتورة");
      return;
    }
    setInvoicePdfLoading(true);
    try {
      const namePart =
        [orderDetails?.name, orderDetails?.code].filter(Boolean).join(" ") ||
        String(orderDetails?.id ?? id ?? "order");
      await downloadOrderInvoicePdf(componentRef.current, `فاتورة-${namePart}`);
      NotificationMeassage("success", "تم تحميل الفاتورة");
    } catch (e) {
      console.error(e);
      NotificationMeassage("error", "تعذر تصدير الفاتورة");
    } finally {
      setInvoicePdfLoading(false);
    }
  };

  const changeManufactureStatus = (status) => {
    if (status == null) return;
    axiosRequest
      .put(`/orders/${orderDetails.id}`, {
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
      .put(`/orderLines/${id}`, {
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
      .put(`/orders/${orderDetails.id}/notes/${noteId}`, {
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
      .delete(`/orders/${orderDetails.id}/notes/${noteId}`)
      .then(() => {
        const updatedComments = comments.filter((comment) => comment.id !== noteId);
        setComments(updatedComments);
        setPendingDeleteNoteId(null);
        NotificationMeassage("success", "تم حذف التعليق");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const handleAddComment = async () => {
    try {
      const { data } = await axiosRequest.post(`/orders/${orderDetails.id}/notes`, {
        text: commentText,
      });

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
        await axiosRequest.post(
          `/orders/${orderDetails.id}/notes/${newComment.id}/upload`,
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
    axiosRequest.get(`/users`).then((res) => {
      const users = res.data.data;
      const user = users?.find((user) => user.id === orderDetails.userId);
      if (user) {
        setAdministrator(`${user.firstName} ${user.lastName}`);
      }
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []) as File[];
    const previewFiles = files.map((file) => ({
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
        const { data } = await axiosRequest.get(`/orders/${id}`);
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
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setComments(orderedComments);
      } catch (error) {
        console.error("Error fetching order:", error);
        NotificationMeassage("error", "حدث خطأ أثناء تحميل الطلب");
      } finally {
        setIsLoading(false);
      }
    };

    getOrderDetails();
  }, [id]);

  return (
    <>
      {orderDetails?.id && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: 800,
            maxWidth: "100vw",
            zIndex: -1,
            pointerEvents: "none",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <PdfDataMobile ref={componentRef} orderDetails={orderDetails} />
        </div>
      )}
      <DashboardLayout>
        <ToastContainer />
        <ConfirmDeleteModal
          open={pendingDeleteNoteId != null}
          onClose={() => setPendingDeleteNoteId(null)}
          handleConfirmDelete={() => {
            if (pendingDeleteNoteId != null) deleteComment(pendingDeleteNoteId);
          }}
          title="التعليق"
          message="سيتم حذف التعليق نهائياً. هل تريد المتابعة؟"
          tone="danger"
          confirmButtonText="حذف"
          cancelButtonText="رجوع"
        />
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
                        sx={{ fontSize: "0.77rem" }}
                      >
                        تفاصيل الطلب
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ fontSize: "1.12rem", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {orderDetails?.name || orderDetails?.code || "—"}
                      </Typography>
                      {orderDetails?.code && orderDetails?.name && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.25, fontSize: "0.84rem" }}
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
                          fontSize: "0.84rem",
                          height: 32,
                          flexShrink: 0,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: (t) => alpha(t.palette.primary.main, 0.28),
                        }}
                      />
                    )}
                    {orderDetails?.status != null && (
                      <OrderStatusChip status={orderDetails.status} size="small" />
                    )}
                    {orderDetails?.deliveryStatus != null && (
                      <DeliveryStatusChip
                        deliveryStatus={orderDetails.deliveryStatus}
                        size="small"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outlined"
                      color="primary"
                      startIcon={<PictureAsPdf fontSize="small" />}
                      onClick={handleDownloadInvoice}
                      disabled={invoicePdfLoading}
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
                      {invoicePdfLoading ? "جارٍ التحميل…" : "الفاتورة"}
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
                <Box
                  sx={{
                    mt: 2.25,
                    pt: 2.25,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    flexWrap: "wrap",
                    gap: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {[
                    {
                      icon: (
                        <PaymentsOutlinedIcon
                          sx={{ fontSize: 20, opacity: 0.85, color: PRIMARY }}
                        />
                      ),
                      label: "سعر البيع",
                      value:
                        orderTotalPrice != null
                          ? `${Number(orderTotalPrice).toLocaleString("ar-EG")} ج.م`
                          : "—",
                    },
                    {
                      icon: (
                        <ChatBubbleOutlineIcon
                          sx={{ fontSize: 20, opacity: 0.85, color: PRIMARY }}
                        />
                      ),
                      label: "تعليقات",
                      value: String(comments.length),
                    },
                    manufactureStatus != null
                      ? {
                          icon: (
                            <SettingsSuggestIcon
                              sx={{ fontSize: 20, opacity: 0.85, color: PRIMARY }}
                            />
                          ),
                          label: "التصنيع",
                          value:
                            manufactureStatusOptions.find((o) => o.value === manufactureStatus)
                              ?.label ?? "—",
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          flex: { sm: "1 1 140px" },
                          minWidth: { sm: 0, xs: "100%" },
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: (t) =>
                            t.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(6, 49, 70, 0.04)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box minWidth={0} sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontSize: "0.72rem", fontWeight: 600 }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            color="text.primary"
                            sx={{ fontSize: "0.9rem", lineHeight: 1.3 }}
                            noWrap
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>

              {/*
                ترتيب عالمي شائع: بنود/منتجات الطلب (ما تم شراؤه) → بيانات العميل/الشحن
                → ملخص الحالة والمالية. المنتجات + العميل نصف-صف (6+6) من md.
              */}
              <Grid container spacing={2.5}>
                <Grid item xs={12} sx={{ mt: { xs: 0, md: 0 } }}>
                  <Box sx={{ pt: 0.5 }}>
                    <SectionHeader>المنتج</SectionHeader>
                  </Box>
                </Grid>
                {orderlines.map((order, lineIndex) => {
                  const lineProductDescription = getOrderLineProductDescriptionPlainText(order);
                  const ordervariant = order?.product?.variants?.find(
                    (variant) => variant.shopifyId === order?.variant_id
                  );
                  const lineChipSx = {
                    mt: 0.75,
                    fontSize: "0.82rem",
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
                    <Grid
                      item
                      xs={12}
                      key={order.id}
                      sx={{ maxWidth: { md: 720 }, width: "100%", mx: "auto" }}
                    >
                      <Card
                        sx={{
                          ...homixCardSx,
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          position: "relative",
                          transition:
                            "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                          borderColor: "divider",
                          "&:hover": {
                            boxShadow:
                              "0 8px 28px rgba(6, 49, 70, 0.12), 0 1px 2px rgba(15, 23, 42, 0.06)",
                            transform: "translateY(-2px)",
                            borderColor: (t) => alpha(t.palette.primary.main, 0.25),
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            background: (t) =>
                              `linear-gradient(90deg, ${alpha(
                                t.palette.primary.main,
                                0.85
                              )} 0%, ${alpha(t.palette.info.main, 0.5)} 100%)`,
                          },
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
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            color="primary.main"
                            sx={{ fontSize: "0.77rem" }}
                          >
                            منتج
                          </Typography>
                          <Chip
                            label={`#${lineIndex + 1}`}
                            size="small"
                            sx={{ height: 24, fontWeight: 800, fontSize: "0.76rem" }}
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, fontSize: "0.88rem" }}
                          >
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
                          {lineProductDescription ? (
                            <Box
                              sx={{
                                mt: 1.5,
                                pt: 1.5,
                                width: "100%",
                                textAlign: "start",
                                borderTop: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mb: 0.5, fontWeight: 600 }}
                              >
                                وصف المنتج
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                  fontSize: "0.86rem",
                                  lineHeight: 1.55,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {lineProductDescription}
                              </Typography>
                            </Box>
                          ) : null}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
                {(orderDetails?.customer || orderDetails?.shippedFromInventory) && (
                  <Grid item xs={12} md={6}>
                    <CustomerDetails
                      customerName={
                        orderDetails?.customer
                          ? `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`
                          : ""
                      }
                      email={orderDetails?.customer?.email}
                      address={
                        orderDetails?.customer?.address
                          ? orderDetails.customer.address
                          : orderDetails?.customer?.address2
                      }
                      phoneNumber={
                        orderDetails?.customer?.phoneNumber ? orderDetails.customer.phoneNumber : ""
                      }
                      shippedFromInventory={orderDetails.shippedFromInventory}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ pt: { xs: 0.5, md: 1 } }}>
                    <SectionHeader>ملخّص الطلب</SectionHeader>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  {orderDetails && (
                    <BasicsInfoCard orderDetails={{ ...orderDetails, administrator }} />
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
                        isShimpentDetails={false}
                      />
                    )}
                    <SelectComponent
                      id="order-manufacture-status"
                      label="حالة التصنيع"
                      options={manufactureStatusOptions}
                      value={manufactureStatus}
                      onChange={changeManufactureStatus}
                      withSectionBorder
                      formControlSx={{
                        "& .MuiInputLabel-root": { fontSize: "0.89rem" },
                        "& .MuiOutlinedInput-root": { minHeight: 52 },
                        "& .MuiSelect-select": {
                          fontSize: "0.88rem",
                          py: 1.55,
                          px: 1.5,
                          textAlign: "start",
                        },
                      }}
                    />
                  </Card>
                </Grid>

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

              {comments.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 5,
                    px: 2,
                    mb: 2,
                    borderRadius: 2.5,
                    border: "1px dashed",
                    borderColor: "divider",
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(6, 49, 70, 0.03)",
                  }}
                >
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 44, color: "text.disabled", opacity: 0.6, mb: 1 }}
                  />
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                    لا يوجد تعليقات بعد
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    أضف أول تعليق أعلاه لمتابعة الطلب مع الفريق
                  </Typography>
                </Box>
              )}

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
                        position: "relative",
                        pl: 2.75,
                        borderLeft: "3px solid",
                        borderLeftColor: (t) => alpha(t.palette.primary.main, 0.55),
                        bgcolor: (t) =>
                          index % 2 === 0
                            ? "background.paper"
                            : alpha(
                                t.palette.primary.main,
                                t.palette.mode === "dark" ? 0.04 : 0.02
                              ),
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.82rem" }}
                          >
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                          <Chip
                            label={commentMaker}
                            size="small"
                            sx={{
                              fontSize: "0.76rem",
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
                            onClick={() => setPendingDeleteNoteId(comment.id)}
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
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            whiteSpace: "pre-wrap",
                            fontSize: "0.95rem",
                            lineHeight: 1.55,
                          }}
                        >
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
