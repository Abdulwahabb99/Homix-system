import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import { OrderStatusChip } from "./components/OrderStatusChips";
import { SelectComponent } from "components/ui";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import axiosRequest from "shared/functions/axiosRequest";
import { getDeliveryStatusValue, getStatusValue, manufactureStatusOptions } from "shared/utils/constants";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PdfDataMobile from "./PdfDataMobile";
import { downloadOrderInvoicePdf } from "./utils/invoicePdf";
import OrderDetailsSkeleton from "./components/OrderDetailsSkeleton";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";

/** ألوان تصميم homix_order_detail (1).html */
const OD = {
  bg: "#f4f5f9",
  sur: "#ffffff",
  sur2: "#f9fafb",
  sur3: "#f1f3f8",
  brd: "rgba(0,0,0,0.07)",
  brd2: "rgba(0,0,0,0.12)",
  tx: "#111827",
  tx2: "#6b7280",
  tx3: "#9ca3af",
  accent: "#6366f1",
  accentHover: "#5254e0",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  gl: "rgba(16,185,129,0.1)",
  al: "rgba(99,102,241,0.1)",
  ab: "rgba(99,102,241,0.25)",
  aml: "rgba(245,158,11,0.1)",
  bl: "rgba(59,130,246,0.1)",
  radius: 14,
};

function getOrderFlowSteps(orderDetails, manufactureStatus) {
  const st = Number(orderDetails?.status ?? 0);
  const mfg = manufactureStatus == null ? null : Number(manufactureStatus);
  const labels = ["الطلب", "المخزن", "التصنيع", "الشحن", "التسليم"];

  if (st === 5) {
    return labels.map((label) => ({ label, state: "done" as const }));
  }

  let activeIdx = 1;
  if (st === 1) activeIdx = 1;
  else if (st === 8) activeIdx = 2;
  else if (st === 2 || mfg === 2) activeIdx = 2;
  else if (mfg === 3) activeIdx = 3;
  else if (mfg != null && mfg >= 4) activeIdx = 4;
  else if (st >= 3) activeIdx = 2;

  return labels.map((label, i) => {
    if (i === 0) return { label, state: "done" as const };
    if (i < activeIdx) return { label, state: "done" as const };
    if (i === activeIdx) return { label, state: "active" as const };
    return { label, state: "pending" as const };
  });
}

function formatOrderDetailDate(iso) {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

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

/**
 * يدعم شكل الاستجابة الجديد (order + items + financial + customer + notes)
 * والشكل القديم (orderLines وحقول مسطّحة على نفس الكائن).
 */
function normalizeOrderDetailPayload(apiResponse) {
  const root = apiResponse?.data ?? apiResponse;
  if (!root || typeof root !== "object") return null;

  const hasNewFormat =
    root.order != null && Array.isArray(root.items) && root.orderLines == null;

  if (!hasNewFormat) {
    const legacy = { ...root };
    if (legacy.customer?.name != null && legacy.customer.firstName == null) {
      const seg = String(legacy.customer.name).trim().split(/\s+/).filter(Boolean);
      legacy.customer = {
        ...legacy.customer,
        firstName: seg[0] ?? "",
        lastName: seg.slice(1).join(" "),
      };
    }
    if (!Array.isArray(legacy.orderLines)) legacy.orderLines = [];
    legacy.createdAt = legacy.createdAt ?? legacy.orderDate;
    legacy.deliveryStatus = legacy.deliveryStatus ?? legacy.manufactureStatus;
    return legacy;
  }

  const order = root.order;
  const financial = root.financial ?? {};
  const items = Array.isArray(root.items) ? root.items : [];
  const customerRaw = root.customer;

  const sellTotal = Number(financial.totalPrice ?? order.totalPrice ?? 0);
  const totalQty = items.reduce((sum, it) => sum + Number(it.quantity ?? 1), 0) || 1;

  const orderLines = items.map((it) => {
    const qty = Number(it.quantity ?? 1);
    const explicitSell = Number(it.unitPrice ?? it.price ?? it.sellingPrice ?? 0);
    const unitSell = explicitSell > 0 ? explicitSell : sellTotal / totalQty;
    const uc = Number(it.unitCost ?? 0);
    return {
      ...it,
      title: it.productName ?? it.title,
      price: unitSell,
      quantity: qty,
      unitCost: uc,
      cost: uc,
      sku: it.sku,
      product: {
        image: it.image ?? it.product?.image,
        variants: [{ price: unitSell, title: it.size || "Default Title" }],
        type: { name: it.typeName ?? it.product?.type?.name },
        description: it.product?.description,
        bodyHtml: it.product?.bodyHtml ?? it.product?.body_html,
      },
    };
  });

  const orderPrice = orderLines.reduce((s, l) => s + Number(l.price) * Number(l.quantity), 0);
  const orderCost = orderLines.reduce((s, l) => s + Number(l.unitCost) * Number(l.quantity), 0);

  const customer = customerRaw
    ? {
        ...customerRaw,
        firstName:
          customerRaw.firstName ??
          (typeof customerRaw.name === "string"
            ? customerRaw.name.trim().split(/\s+/).filter(Boolean)[0] ?? ""
            : ""),
        lastName:
          customerRaw.lastName ??
          (typeof customerRaw.name === "string"
            ? customerRaw.name.trim().split(/\s+/).filter(Boolean).slice(1).join(" ")
            : ""),
      }
    : null;

  const notesRaw = root.notes ?? root.notesList ?? [];
  const notesList = Array.isArray(notesRaw) ? notesRaw : [];

  const merged = {
    ...order,
    name: order.orderNumber != null ? `#${order.orderNumber}` : order.code ?? order.name,
    code: order.code ?? order.operationNumber,
    createdAt: order.orderDate ?? order.createdAt,
    customer,
    orderLines,
    notesList,
    financial,
    subTotalPrice: Number(financial.totalPrice ?? order.totalPrice ?? orderPrice),
    shippingFees: Number(financial.shippingFees ?? 0),
    totalDiscounts: Number(financial.discount ?? 0),
    totalPrice: Number(financial.totalPrice ?? order.totalPrice ?? orderPrice),
    totalCost: Number(financial.totalCost ?? order.totalCost ?? orderCost),
    downPayment: Number(financial.downPayment ?? 0),
    toBeCollected: Number(financial.amountToCollect ?? 0),
    commission: Number(financial.commission ?? 0),
    shippedFromInventory: order.deliveryBy === 1 || order.deliveryBy === "1",
    userId: order.userId,
    userName: order.userName,
    assigneeName: root.assigneeName ?? "",
    timeline: root.timeline ?? [],
  };

  return merged;
}

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
    if (!orderDetails?.userId) return;
    axiosRequest.get(`/users`).then((res) => {
      const users = res.data.data;
      const found = users?.find((u) => u.id === orderDetails.userId);
      if (found) {
        setAdministrator(`${found.firstName} ${found.lastName}`);
      }
    });
  }, [orderDetails?.userId]);

  useEffect(() => {
    const getOrderDetails = async () => {
      setIsLoading(true);
      try {
        const { data: res } = await axiosRequest.get(`/orders/${id}`);
        const normalized = normalizeOrderDetailPayload(res);
        if (!normalized?.id) {
          setOrderDetails(null);
          setOrderlines([]);
          setComments([]);
          setAdministrator("");
          NotificationMeassage("error", "تعذر قراءة بيانات الطلب");
          return;
        }

        let orderPrice = 0;
        let ordercost = 0;
        let itemShipping = 0;
        let toBeCollected = 0;
        (normalized.orderLines ?? []).forEach((item) => {
          orderPrice += Number(item.price) * Number(item.quantity);
          ordercost += Number(item.unitCost) * Number(item.quantity);
          itemShipping += Number(item.itemShipping);
          toBeCollected += Number(item.toBeCollected);
        });

        setOrderTotalPrice(normalized.subTotalPrice ?? orderPrice);
        setOrderTotalCost(normalized.totalCost ?? ordercost);
        setOrderTotalShipping(normalized.shippingFees ?? itemShipping);
        setOrderTotalToBeCollected(normalized.toBeCollected ?? toBeCollected);
        setOrderDetails(normalized);
        setOrderlines(normalized.orderLines ?? []);
        setManufactureStatus(normalized.manufactureStatus ?? null);

        const adminFromApi =
          [normalized.assigneeName, normalized.userName].find(
            (s) => typeof s === "string" && s.trim() !== ""
          ) ?? "";
        setAdministrator(typeof adminFromApi === "string" ? adminFromApi.trim() : "");

        const list = normalized.notesList ?? [];
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
      <DashboardLayout
        header={
          orderDetails && !isLoading ? (
            <HomixPageHeader
              actions={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  {!isVendor && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                      onClick={() => navigate(`/orders/edit/${id}`)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        height: 34,
                        px: 2,
                        borderRadius: "9px",
                        color: OD.tx2,
                        border: `0.5px solid ${OD.brd}`,
                        bgcolor: OD.sur2,
                        "&:hover": { borderColor: OD.accent, color: OD.accent, bgcolor: OD.sur },
                      }}
                    >
                      تعديل
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PictureAsPdf sx={{ fontSize: 15 }} />}
                    onClick={handleDownloadInvoice}
                    disabled={invoicePdfLoading}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      height: 34,
                      px: 2,
                      borderRadius: "9px",
                      color: "#92400e",
                      border: "0.5px solid rgba(245,158,11,0.2)",
                      bgcolor: OD.aml,
                      "&:hover": { bgcolor: OD.amber, color: "#fff", borderColor: OD.amber },
                    }}
                  >
                    {invoicePdfLoading ? "جارٍ التحميل…" : "الفاتورة"}
                  </Button>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                      height: 34,
                      px: 2,
                      borderRadius: "9px",
                      bgcolor: OD.accent,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <AttachMoneyOutlinedIcon sx={{ fontSize: 17 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      {getPaymentValue(orderDetails?.paymentStatus) || "—"}
                    </Typography>
                  </Stack>
                </Stack>
              }
            />
          ) : undefined
        }
      >
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
        <Box sx={{ width: "100%" }}>
          {isLoading ? (
            <OrderDetailsSkeleton />
          ) : !orderDetails ? null : (
            <>
              <Box sx={{ width: "100%", bgcolor: OD.bg, minHeight: "50vh" }}>
                {/* ——— order strip ——— */}
                <Box
                  sx={(theme) => ({
                    bgcolor: OD.sur,
                    borderBottom: `0.5px solid ${OD.brd}`,
                    py: 1.5,
                    px: 3,
                    mx: -3,
                    width: `calc(100% + ${theme.spacing(6)})`,
                    maxWidth: "none",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  })}
                >
                  <Box>
                    <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, mb: 0.25 }}>
                      رقم الطلب
                    </Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: OD.tx }}>
                      #<Box component="span" sx={{ color: OD.accent }}>{(orderDetails?.name || orderDetails?.orderNumber || orderDetails?.code || "—").replace(/^#/, "")}</Box>
                    </Typography>
                  </Box>
                  <Stack spacing={0.5}>
                    <Box
                      sx={{
                        fontSize: "0.69rem",
                        color: OD.tx3,
                        bgcolor: OD.sur2,
                        border: `0.5px solid ${OD.brd}`,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "20px",
                        fontWeight: 500,
                        width: "fit-content",
                      }}
                    >
                      ID: {orderDetails.id}
                    </Box>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {orderDetails?.status != null && <OrderStatusChip status={orderDetails.status} size="small" />}
                      {orderDetails?.paymentStatus != null ? (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              bgcolor: Number(orderDetails.paymentStatus) === 2 ? OD.green : OD.amber,
                            }}
                          />
                          <Typography
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              px: 1.25,
                              py: 0.5,
                              borderRadius: "20px",
                              fontSize: "0.69rem",
                              fontWeight: 700,
                              bgcolor: Number(orderDetails.paymentStatus) === 2 ? OD.gl : OD.aml,
                              color: Number(orderDetails.paymentStatus) === 2 ? "#065f46" : "#92400e",
                            }}
                          >
                            {getPaymentValue(orderDetails.paymentStatus) || "—"}
                          </Typography>
                        </Stack>
                      ) : null}
                    </Stack>
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    useFlexGap
                    sx={{
                      ml: "auto",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      rowGap: 1,
                      columnGap: 1.25,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                        overflowX: "auto",
                        pb: 0.25,
                        flexWrap: { xs: "nowrap", md: "wrap" },
                      }}
                    >
                      {(() => {
                        const flowSteps = getOrderFlowSteps(orderDetails, manufactureStatus);
                        return flowSteps.map((step, si) => (
                          <React.Fragment key={step.label}>
                            <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 36 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "2px solid",
                                  ...(step.state === "done"
                                    ? {
                                        bgcolor: OD.gl,
                                        color: OD.green,
                                        borderColor: OD.green,
                                      }
                                    : step.state === "active"
                                      ? {
                                          bgcolor: OD.al,
                                          color: OD.accent,
                                          borderColor: OD.accent,
                                        }
                                      : {
                                          bgcolor: OD.sur2,
                                          color: OD.tx3,
                                          borderColor: OD.brd,
                                        }),
                                }}
                              >
                                {step.state === "done" ? (
                                  <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                                ) : step.state === "active" ? (
                                  <ScheduleIcon sx={{ fontSize: 14 }} />
                                ) : (
                                  <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} />
                                )}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: "0.625rem",
                                  fontWeight: step.state === "active" ? 700 : 600,
                                  color:
                                    step.state === "done"
                                      ? OD.green
                                      : step.state === "active"
                                        ? OD.accent
                                        : OD.tx3,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {step.label}
                              </Typography>
                            </Stack>
                            {si < flowSteps.length - 1 ? (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 2,
                                  alignSelf: "center",
                                  mb: 2.25,
                                  borderRadius: 1,
                                  ...(() => {
                                    const a = flowSteps[si].state;
                                    const b = flowSteps[si + 1].state;
                                    if (a === "done" && b === "done")
                                      return { background: OD.green };
                                    if (a === "done" && b === "active")
                                      return { background: `linear-gradient(90deg,${OD.green},${OD.accent})` };
                                    if (a === "active")
                                      return { background: `linear-gradient(90deg,${OD.green},${OD.accent})` };
                                    if (a === "done" && b === "pending") return { background: OD.brd };
                                    return { bgcolor: OD.brd };
                                  })(),
                                }}
                              />
                            ) : null}
                          </React.Fragment>
                        ));
                      })()}
                    </Box>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.72rem",
                        color: OD.tx3,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        alignSelf: "center",
                      }}
                    >
                      📅 {formatOrderDetailDate(orderDetails.createdAt ?? orderDetails.orderDate)}
                    </Typography>
                  </Stack>
                </Box>

                {/* ——— scrollable content ——— */}
                <Box sx={{ py: 2.25, width: "100%" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
                      gap: 1.75,
                      alignItems: "start",
                    }}
                  >
                    {/* ——— left column ——— */}
                    <Stack spacing={1.5}>
                      {orderlines.map((order, lineIndex) => {
                        const lineProductDescription =
                          getOrderLineProductDescriptionPlainText(order);
                        const ordervariant = order?.product?.variants?.find(
                          (variant) => variant.shopifyId === order?.variant_id
                        );
                        const unitPrice = order?.product?.variants?.[0]?.price;
                        const tagParts = [
                          order.size && `📐 ${order.size}`,
                          order.color && `🎨 ${order.color}`,
                          order.material && order.material,
                          order?.product?.type?.name,
                          order.sku && `SKU ${order.sku}`,
                        ].filter(Boolean);

                        return (
                          <Box
                            key={order.id}
                            sx={{
                              bgcolor: OD.sur,
                              borderRadius: `${OD.radius}px`,
                              border: `0.5px solid ${OD.brd}`,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 2,
                                py: 1.6,
                                borderBottom: `0.5px solid ${OD.brd}`,
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                                <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>
                                  تفاصيل المنتج
                                </Typography>
                              </Stack>
                              {orderDetails?.status === 8 ? (
                                <Chip
                                  label="في المخزن"
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: "0.625rem",
                                    fontWeight: 700,
                                    bgcolor: OD.gl,
                                    color: "#065f46",
                                  }}
                                />
                              ) : null}
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75} alignItems="flex-start">
                                <Box
                                  component="img"
                                  src={order?.product?.image}
                                  alt={order?.title || ""}
                                  sx={{
                                    width: 120,
                                    height: 110,
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                    border: `0.5px solid ${OD.brd}`,
                                    bgcolor: OD.sur2,
                                    flexShrink: 0,
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: OD.tx, mb: 0.75, lineHeight: 1.4 }}>
                                    {order?.title}
                                  </Typography>
                                  <Typography sx={{ fontSize: "1.125rem", fontWeight: 900, color: OD.accent, mb: 1 }}>
                                    {unitPrice != null ? Number(unitPrice).toLocaleString("ar-EG") : "—"}{" "}
                                    <Box component="span" sx={{ fontSize: "0.75rem", fontWeight: 500, color: OD.tx3 }}>
                                      ج.م
                                    </Box>
                                  </Typography>
                                  {tagParts.length > 0 ? (
                                    <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                      {tagParts.map((t) => (
                                        <Box
                                          key={t}
                                          component="span"
                                          sx={{
                                            fontSize: "0.66rem",
                                            bgcolor: OD.sur2,
                                            border: `0.5px solid ${OD.brd}`,
                                            px: 1.25,
                                            py: 0.375,
                                            borderRadius: "6px",
                                            color: OD.tx2,
                                          }}
                                        >
                                          {t}
                                        </Box>
                                      ))}
                                    </Stack>
                                  ) : null}
                                  {ordervariant?.title && ordervariant?.title !== "Default Title" ? (
                                    <Chip label={ordervariant.title} size="small" sx={{ mr: 0.5, mb: 0.5, height: 24, fontSize: "0.65rem" }} />
                                  ) : null}
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{
                                      mt: 1.25,
                                      pt: 1.25,
                                      borderTop: `0.5px solid ${OD.brd}`,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg,#8c7355,#5a4530)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.69rem",
                                        fontWeight: 800,
                                        color: "#fff",
                                      }}
                                    >
                                      {(order.vendorName || orderDetails.vendorName || order?.product?.type?.name || "ب")
                                        .charAt(0)}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: OD.tx }}>
                                        {order.vendorName || orderDetails.vendorName || order?.product?.type?.name || "—"}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>
                                        البائع
                                      </Typography>
                                    </Box>
                                    {order.sku ? (
                                      <Chip
                                        label={`كود: ${order.sku}`}
                                        size="small"
                                        sx={{
                                          height: 24,
                                          fontSize: "0.625rem",
                                          fontWeight: 700,
                                          bgcolor: OD.al,
                                          color: OD.accent,
                                        }}
                                      />
                                    ) : null}
                                  </Stack>
                                  {lineProductDescription ? (
                                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `0.5px solid ${OD.brd}` }} textAlign="right">
                                      <Typography
                                        sx={{ fontSize: "0.69rem", color: OD.tx3, mb: 0.5, fontWeight: 600 }}
                                      >
                                        وصف المنتج
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.81rem", color: OD.tx, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                                        {lineProductDescription}
                                      </Typography>
                                    </Box>
                                  ) : null}
                                </Box>
                              </Stack>
                            </Box>
                          </Box>
                        );
                      })}

                      {/* حالة الطلب */}
                      <Box
                        sx={{
                          bgcolor: OD.sur,
                          borderRadius: `${OD.radius}px`,
                          border: `0.5px solid ${OD.brd}`,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.6,
                            borderBottom: `0.5px solid ${OD.brd}`,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ScheduleIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                            <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>
                              حالة الطلب
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                              gap: 1.75,
                            }}
                          >
                            {[
                              {
                                label: "حالة الطلب",
                                value: getStatusValue(orderDetails.status) ?? orderDetails.statusLabel ?? "—",
                              },
                              {
                                label: "حالة التسليم",
                                value: getDeliveryStatusValue(orderDetails.deliveryStatus) ?? "—",
                              },
                              {
                                label: "المسؤول",
                                value: administrator || "لا يوجد",
                              },
                              {
                                label: "مكان التسليم",
                                value: orderDetails.shippedFromInventory ? "مخازن هومكس" : "عنوان العميل",
                              },
                            ].map((row) => (
                              <Box key={row.label}>
                                <Typography sx={{ fontSize: "0.69rem", fontWeight: 700, color: OD.tx3, mb: 0.75 }}>
                                  {row.label}
                                </Typography>
                                <Box
                                  sx={{
                                    width: "100%",
                                    minHeight: 34,
                                    px: 1.5,
                                    py: 0.75,
                                    border: `0.5px solid ${OD.brd}`,
                                    borderRadius: "9px",
                                    bgcolor: OD.sur,
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: OD.tx,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {row.value}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <SelectComponent
                              id="order-manufacture-status"
                              label="حالة التصنيع (تشغيل الفعلي)"
                              options={manufactureStatusOptions}
                              value={manufactureStatus}
                              onChange={changeManufactureStatus}
                              withSectionBorder={false}
                              formControlSx={{
                                "& .MuiInputLabel-root": { fontSize: "0.78rem", color: OD.tx3 },
                                "& .MuiOutlinedInput-root": {
                                  minHeight: 40,
                                  borderRadius: "9px",
                                  bgcolor: OD.sur,
                                  fontSize: "0.78rem",
                                  "& fieldset": { borderColor: OD.brd },
                                  "&:hover fieldset": { borderColor: OD.accent },
                                },
                                "& .MuiSelect-select": {
                                  py: 1,
                                  px: 1.5,
                                  textAlign: "start",
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* ملاحظات */}
                      <Box
                        sx={{
                          bgcolor: OD.sur,
                          borderRadius: `${OD.radius}px`,
                          border: `0.5px solid ${OD.brd}`,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2,
                            py: 1.6,
                            borderBottom: `0.5px solid ${OD.brd}`,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                            <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>
                              الملاحظات والتواصل
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: "0.69rem", color: OD.tx3 }}>
                            {comments.length} رسائل
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            maxHeight: 220,
                            overflowY: "auto",
                            px: 2,
                            py: 1.5,
                            "&::-webkit-scrollbar": { width: 4 },
                            "&::-webkit-scrollbar-thumb": { bgcolor: OD.brd, borderRadius: 4 },
                          }}
                        >
                          {comments.length === 0 ? (
                            <Typography align="center" sx={{ py: 3, color: OD.tx3, fontSize: "0.78rem" }}>
                              لا توجد ملاحظات بعد
                            </Typography>
                          ) : (
                            <Stack spacing={1.25}>
                              {comments.map((comment, index) => {
                                const commentMaker = `${comment.user?.firstName ?? ""} ${comment.user?.lastName ?? ""}`.trim() || "—";
                                const initials = commentMaker
                                  .split(/\s+/)
                                  .filter(Boolean)
                                  .map((p) => p.charAt(0))
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase() || "?";
                                const imageUrl = comment?.attachments?.[0]?.url
                                  ? comment.isEdited
                                    ? comment.attachments[0].url
                                    : `${process.env.REACT_APP_API_URL}/${comment.attachments[0].url}`
                                  : null;
                                const grad =
                                  index % 2 === 0
                                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                                    : "linear-gradient(135deg,#f59e0b,#d97706)";

                                return (
                                  <Stack key={comment.id ?? index} direction="row" spacing={1.125} alignItems="flex-start">
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: grad,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.625rem",
                                        fontWeight: 800,
                                        color: "#fff",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {initials}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Box
                                        sx={{
                                          bgcolor: OD.sur2,
                                          border: `0.5px solid ${OD.brd}`,
                                          px: 1.5,
                                          py: 1,
                                          borderRadius: "0 10px 10px 10px",
                                          fontSize: "0.75rem",
                                          lineHeight: 1.6,
                                          color: OD.tx,
                                        }}
                                      >
                                        {editingIndex === index ? (
                                          <>
                                            <TextField
                                              fullWidth
                                              value={editedCommentText}
                                              onChange={(e) => setEditedCommentText(e.target.value)}
                                              multiline
                                              size="small"
                                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: "0.75rem" } }}
                                            />
                                            <Stack direction="row" spacing={0.75} justifyContent="flex-end" mt={1}>
                                              <Button size="small" onClick={() => setEditingIndex(null)} sx={{ textTransform: "none", fontSize: "0.7rem" }}>
                                                إلغاء
                                              </Button>
                                              <Button
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                onClick={() => {
                                                  const updated = [...comments];
                                                  updated[index].text = editedCommentText;
                                                  setComments(updated);
                                                  setEditingIndex(null);
                                                  updateComment(comment.id);
                                                }}
                                                sx={{ textTransform: "none", fontSize: "0.7rem", bgcolor: OD.accent, "&:hover": { bgcolor: OD.accentHover } }}
                                              >
                                                حفظ
                                              </Button>
                                            </Stack>
                                          </>
                                        ) : (
                                          comment.text
                                        )}
                                      </Box>
                                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }} flexWrap="wrap" gap={0.5}>
                                        <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>
                                          {commentMaker} · {new Date(comment.createdAt).toLocaleString("ar-EG")}
                                        </Typography>
                                        <Stack direction="row" spacing={0.25}>
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              setEditingIndex(index);
                                              setEditedCommentText(comment.text);
                                            }}
                                            sx={{ p: 0.35, color: OD.accent }}
                                          >
                                            <EditIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={() => setPendingDeleteNoteId(comment.id)}
                                            sx={{ p: 0.35, color: OD.red }}
                                          >
                                            <DeleteIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                        </Stack>
                                      </Stack>
                                      {imageUrl && editingIndex !== index ? (
                                        <Box mt={0.75}>
                                          <a href={imageUrl} target="_blank" rel="noreferrer">
                                            <Box
                                              component="img"
                                              src={imageUrl}
                                              alt=""
                                              sx={{ maxHeight: 200, borderRadius: "8px", maxWidth: "100%" }}
                                            />
                                          </a>
                                        </Box>
                                      ) : null}
                                    </Box>
                                  </Stack>
                                );
                              })}
                            </Stack>
                          )}
                        </Box>
                        <Box
                          sx={{
                            borderTop: `0.5px solid ${OD.brd}`,
                            px: 2,
                            py: 1.5,
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <label htmlFor="comment-attachment">
                            <input
                              id="comment-attachment"
                              type="file"
                              hidden
                              onChange={(e) => handleFileChange(e)}
                              accept="image/png, image/jpeg, image/jpg"
                            />
                            <IconButton
                              component="span"
                              size="small"
                              sx={{
                                width: 36,
                                height: 36,
                                border: `0.5px solid ${OD.brd}`,
                                borderRadius: "9px",
                                color: OD.tx3,
                                "&:hover": { borderColor: OD.accent, color: OD.accent },
                              }}
                            >
                              <AttachFileIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </label>
                          <TextField
                            fullWidth
                            size="small"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="اكتب ملاحظاتك هنا..."
                            sx={{
                              flex: 1,
                              minWidth: 120,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "9px",
                                fontSize: "0.81rem",
                                bgcolor: OD.sur,
                                "& fieldset": { borderColor: OD.brd },
                                "&:hover fieldset": { borderColor: OD.accent },
                              },
                            }}
                            InputProps={{
                              endAdornment:
                                selectedFiles?.length > 0 ? (
                                  <InputAdornment position="end">
                                    {selectedFiles?.map((file, fi) => (
                                      <Chip
                                        key={fi}
                                        label={file.file?.name?.length > 20 ? `${file.file?.name.slice(0, 10)}…` : file?.file?.name}
                                        size="small"
                                        onDelete={() => handleRemoveFile(fi)}
                      sx={{ maxWidth: 100, fontSize: "0.65rem", height: 22 }}
                                      />
                                    ))}
                                  </InputAdornment>
                                ) : null,
                            }}
                          />
                          <Button
                            variant="contained"
                            disableElevation
                            disabled={!commentText && !selectedFiles?.length}
                            onClick={handleAddComment}
                            sx={{
                              px: 2.25,
                              height: 36,
                              borderRadius: "9px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              bgcolor: OD.accent,
                              whiteSpace: "nowrap",
                              "&:hover": { bgcolor: OD.accentHover },
                            }}
                          >
                            إرسال
                          </Button>
                        </Box>
                      </Box>
                    </Stack>

                    {/* ——— right column ——— */}
                    <Stack spacing={1.5}>
                      {(orderDetails?.customer || orderDetails?.shippedFromInventory) && (
                        <Box
                          sx={{
                            bgcolor: OD.sur,
                            borderRadius: `${OD.radius}px`,
                            border: `0.5px solid ${OD.brd}`,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 2,
                              py: 1.6,
                              borderBottom: `0.5px solid ${OD.brd}`,
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PersonOutlineIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                              <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>
                                بيانات العميل
                              </Typography>
                            </Stack>
                            {!isVendor ? (
                              <Button
                                size="small"
                                onClick={() => navigate(`/orders/edit/${id}`)}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.69rem",
                                  height: 28,
                                  px: 1.25,
                                  color: OD.accent,
                                  border: "1px solid rgba(99,102,241,0.5)",
                                  borderRadius: "9px",
                                  bgcolor: OD.sur,
                                  "&:hover": { borderColor: OD.accent, bgcolor: OD.al },
                                }}
                              >
                                تعديل
                              </Button>
                            ) : null}
                          </Box>
                          <Box sx={{ px: 2, py: 1.5 }}>
                            {orderDetails?.customer ? (
                              <>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.75 }}>
                                  <Box
                                    sx={{
                                      width: 44,
                                      height: 44,
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "1rem",
                                      fontWeight: 900,
                                      color: "#fff",
                                    }}
                                  >
                                    {(orderDetails.customer.name ||
                                      `${orderDetails.customer.firstName ?? ""} ${orderDetails.customer.lastName ?? ""}`
                                    )
                                      .trim()
                                      .charAt(0) || "؟"}
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: OD.tx }}>
                                      {(
                                        orderDetails.customer.name ??
                                        `${orderDetails.customer.firstName ?? ""} ${orderDetails.customer.lastName ?? ""}`
                                      ).trim()}
                                    </Typography>
                                    {orderDetails.daysSinceOrder != null ? (
                                      <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, mt: 0.25 }}>
                                        منذ {orderDetails.daysSinceOrder} يوم
                                      </Typography>
                                    ) : null}
                                  </Box>
                                </Stack>
                                <Stack spacing={0}>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.125, borderBottom: `0.5px solid ${OD.brd}` }}>
                                    <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: OD.bl, color: OD.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <EmailOutlinedIcon sx={{ fontSize: 15 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 500, minWidth: 56 }}>البريد</Typography>
                                    <Typography sx={{ fontSize: "0.69rem", fontWeight: 600, color: OD.tx, flex: 1, wordBreak: "break-all", dir: "ltr", textAlign: "right" }}>
                                      {orderDetails.customer.email || "—"}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.125, borderBottom: `0.5px solid ${OD.brd}` }}>
                                    <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: OD.gl, color: OD.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <PhoneOutlinedIcon sx={{ fontSize: 15 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 500, minWidth: 56 }}>الهاتف</Typography>
                                    <Typography sx={{ fontSize: "0.81rem", fontWeight: 600, color: OD.tx, flex: 1, dir: "ltr", textAlign: "right" }}>
                                      {orderDetails.customer.phoneNumber || "—"}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ py: 1.125 }}>
                                    <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: OD.aml, color: OD.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 500, minWidth: 56, pt: 0.5 }}>العنوان</Typography>
                                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: OD.tx, flex: 1 }}>
                                      {orderDetails.shippedFromInventory
                                        ? "الشحن من مخازن هومكس"
                                        : orderDetails.customer.address || orderDetails.customer.address2 || "—"}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </>
                            ) : (
                              <Typography sx={{ color: OD.tx3, fontSize: "0.78rem" }}>شحن من المخزن — لا بيانات عميل على الطلب</Typography>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* مالية */}
                      <Box
                        sx={{
                          bgcolor: OD.sur,
                          borderRadius: `${OD.radius}px`,
                          border: `0.5px solid ${OD.brd}`,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.6,
                            borderBottom: `0.5px solid ${OD.brd}`,
                          }}
                        >
                          <PaymentsOutlinedIcon sx={{ fontSize: 18, color: OD.tx2, ml: 1 }} />
                          <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>
                            التفاصيل المالية
                          </Typography>
                        </Box>
                        <Box sx={{ p: 0 }}>
                          {(() => {
                            const sell = Number(orderDetails.subTotalPrice ?? orderTotalPrice ?? 0);
                            const costLine = Number(orderDetails.orderLines?.[0]?.cost ?? orderDetails.totalCost ?? 0);
                            const totalCostNum = Number(orderDetails.totalCost ?? orderTotalCost ?? 0);
                            const margin = sell - totalCostNum;
                            const ship = Number(orderDetails.shippingFees ?? orderTotalShipping ?? 0);
                            const disc = Number(orderDetails.totalDiscounts ?? 0);
                            const down = Number(orderDetails.downPayment ?? 0);
                            const collect = Number(orderDetails.toBeCollected ?? orderTotalToBeCollected ?? 0);
                            const fmt = (n, zeroMuted) => (
                              <Typography component="span" sx={{ fontWeight: 700, fontSize: "0.81rem", color: n === 0 && zeroMuted ? OD.tx3 : OD.tx }}>
                                {Number(n).toLocaleString("ar-EG")} ج.م
                              </Typography>
                            );
                            const row = (label, node, isTotal = false) => (
                              <Box
                                key={label}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  px: 2,
                                  py: 1,
                                  borderBottom: `0.5px solid ${OD.brd}`,
                                  ...(isTotal
                                    ? {
                                        background: `linear-gradient(135deg,${OD.al},rgba(99,102,241,0.04))`,
                                        borderTop: `0.5px solid ${OD.ab}`,
                                      }
                                    : {}),
                                }}
                              >
                                <Typography sx={{ fontSize: "0.78rem", color: isTotal ? OD.tx : OD.tx2, fontWeight: isTotal ? 700 : 500 }}>
                                  {label}
                                </Typography>
                                {node}
                              </Box>
                            );
                            return (
                              <>
                                {row("سعر البيع", fmt(sell, false))}
                                {row("سعر التكلفة", fmt(costLine, false))}
                                {row(
                                  "هامش الربح",
                                  <Typography
                                    component="span"
                                    sx={{ fontWeight: 700, fontSize: "0.81rem", color: margin >= 0 ? OD.green : OD.red }}
                                  >
                                    {margin >= 0 ? "+" : ""}
                                    {Number(margin).toLocaleString("ar-EG")} ج.م
                                  </Typography>
                                )}
                                {row("تكلفة الشحن", fmt(ship, true))}
                                {row("الخصم", fmt(disc, true))}
                                {row("جدية الشراء", fmt(down, true))}
                                {row(
                                  "المبلغ المطلوب تحصيله",
                                  <Typography component="span" sx={{ fontWeight: 900, fontSize: "0.94rem", color: OD.accent }}>
                                    {Number(collect).toLocaleString("ar-EG")} ج.م
                                  </Typography>,
                                  true
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      </Box>

                      {/* إجراءات سريعة */}
                      <Box
                        sx={{
                          bgcolor: OD.sur,
                          borderRadius: `${OD.radius}px`,
                          border: `0.5px solid ${OD.brd}`,
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ px: 2, py: 1.6, borderBottom: `0.5px solid ${OD.brd}` }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <BoltOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                            <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>إجراءات سريعة</Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 1,
                            }}
                          >
                            {[
                              {
                                icon: <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />,
                                title: "تتبع الشحنة",
                                sub: orderDetails.shipmentType || "—",
                                onClick: () => NotificationMeassage("info", "ميزة التتبع قريباً"),
                              },
                              {
                                icon: <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />,
                                title: "فتح تذكرة",
                                sub: "دعم العميل",
                                onClick: () => navigate("/tickets"),
                              },
                              {
                                icon: <LocalPrintshopOutlinedIcon sx={{ fontSize: 18 }} />,
                                title: "طباعة الفاتورة",
                                sub: "PDF",
                                onClick: () => handleDownloadInvoice(),
                              },
                              {
                                icon: <ShowChartOutlinedIcon sx={{ fontSize: 18, color: OD.red }} />,
                                title: "إلغاء الطلب",
                                sub: "قريباً",
                                disabled: true,
                                onClick: () => {},
                              },
                            ].map((qa) => (
                              <Box
                                key={qa.title}
                                onClick={qa.disabled ? undefined : qa.onClick}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.25,
                                  p: 1.4,
                                  border: `0.5px solid ${OD.brd}`,
                                  borderRadius: "10px",
                                  bgcolor: qa.disabled ? OD.sur2 : OD.sur2,
                                  opacity: qa.disabled ? 0.55 : 1,
                                  cursor: qa.disabled ? "default" : "pointer",
                                  transition: "0.15s",
                                  "&:hover": qa.disabled
                                    ? {}
                                    : {
                                        borderColor: OD.accent,
                                        bgcolor: OD.al,
                                        "& .qa-ico": { bgcolor: OD.accent, color: "#fff" },
                                      },
                                }}
                              >
                                <Box
                                  className="qa-ico"
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    bgcolor: OD.sur3,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: OD.tx2,
                                    transition: "0.15s",
                                  }}
                                >
                                  {qa.icon}
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: OD.tx }}>{qa.title}</Typography>
                                  <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>{qa.sub}</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>

                      {/* Timeline */}
                      <Box
                        sx={{
                          bgcolor: OD.sur,
                          borderRadius: `${OD.radius}px`,
                          border: `0.5px solid ${OD.brd}`,
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ px: 2, py: 1.6, borderBottom: `0.5px solid ${OD.brd}` }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ScheduleIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                            <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>سجل الأحداث</Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ px: 2, py: 1.5 }}>
                          {Array.isArray(orderDetails.timeline) && orderDetails.timeline.length > 0 ? (
                            <Stack spacing={0}>
                              {orderDetails.timeline.map((ev, ti) => (
                                <Stack
                                  key={ti}
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="flex-start"
                                  sx={{
                                    py: 1.25,
                                    borderRight: `2px solid ${ti === orderDetails.timeline.length - 1 ? "transparent" : OD.brd}`,
                                    pr: 1.75,
                                    mr: 1.75,
                                    position: "relative",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      right: -15,
                                      width: 28,
                                      height: 28,
                                      borderRadius: "50%",
                                      bgcolor: OD.gl,
                                      color: OD.green,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                                  </Box>
                                  <Box sx={{ mr: 3, flex: 1 }}>
                                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: OD.tx }}>
                                      {ev.action ?? ev.title ?? ev.message ?? "—"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.72rem", color: OD.tx2, mt: 0.25 }}>
                                      {ev.detail ?? ev.description ?? ""}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.65rem", color: OD.tx3, mt: 0.5 }}>
                                      {ev.createdAt || ev.at ? formatOrderDetailDate(ev.createdAt ?? ev.at) : ""}
                                    </Typography>
                                  </Box>
                                </Stack>
                              ))}
                            </Stack>
                          ) : (
                            <Typography sx={{ fontSize: "0.78rem", color: OD.tx3, textAlign: "center", py: 2 }}>
                              لا أحداث مسجّلة بعد
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Box>

            </>
          )}
        </Box>
      </DashboardLayout>
    </>
  );
}

export default OrderDetails;
