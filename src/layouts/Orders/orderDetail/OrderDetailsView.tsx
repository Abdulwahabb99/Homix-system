import React, { useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Autocomplete, Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Modal, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { SelectComponent } from "components/ui";
import { manufactureStatusOptions } from "shared/utils/constants";
import { DELIVERY_STATUS, statusoptions } from "layouts/Orders/utils/constants";
import { useOrdersMeta } from "query/ordersMeta.api";
import { OrderStatusChip } from "../components/OrderStatusChips";
import { OD } from "./odTheme";
import {
  formatOrderDetailDate,
  getOrderLineProductDescriptionPlainText,
} from "./orderDetailNormalize";
import { getOrderDetailPaymentLabel } from "./orderDetailPayment";
import CustomerEditModal, { type CustomerFormValues } from "./CustomerEditModal";

/** اسم صاحب التعليق — يدعم أشكال الـ API المختلفة (user / createdBy / author / userName)،
    ومع وجود userId فقط يُستخرج الاسم من قائمة المستخدمين. */
function resolveCommenterName(comment: any, users: any[]): string {
  const p = comment?.user ?? comment?.createdBy ?? comment?.author ?? {};
  const nested =
    [p.firstName ?? p.first_name, p.lastName ?? p.last_name].filter(Boolean).join(" ").trim() ||
    (typeof p.name === "string" ? p.name.trim() : "") ||
    (typeof p.fullName === "string" ? p.fullName.trim() : "");
  if (nested) return nested;

  const flat = comment?.userName ?? comment?.authorName ?? comment?.createdByName;
  if (typeof flat === "string" && flat.trim()) return flat.trim();

  const uid =
    comment?.userId ?? comment?.user?.id ?? comment?.createdBy?.id ?? comment?.authorUserId;
  if (uid != null && Array.isArray(users)) {
    const u = users.find((x) => String(x.id) === String(uid));
    if (u) {
      const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
      if (name) return name;
    }
  }
  return "—";
}

/** أيقونة/لون حدث سجل الأحداث حسب نوعه */
function timelineEventStyle(eventType: string): { bg: string; color: string; Icon: React.ElementType } {
  switch (eventType) {
    case "order_received":
      return { bg: OD.gl, color: OD.green, Icon: CheckIcon };
    case "notification_sent":
      return { bg: OD.bl, color: OD.blue, Icon: NotificationsNoneOutlinedIcon };
    default:
      return { bg: OD.al, color: OD.accent, Icon: ScheduleIcon };
  }
}

/** "٥ يوليو ٢٠٢٦، ١:٠٠ ص" — تنسيق عربي لوقت الحدث */
function formatEventTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type OrderDetailsViewProps = {
  orderDetails: any;
  orderlines: any[];
  manufactureStatus: number | null;
  administrator: string;
  users: any[];
  comments: any[];
  commentText: string;
  setCommentText: (v: string) => void;
  editingIndex: number | null;
  setEditingIndex: (v: number | null) => void;
  editedCommentText: string;
  setEditedCommentText: (v: string) => void;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  selectedFiles: { file: File; url: string }[];
  orderTotalPrice: number | null;
  orderTotalShipping: number | null;
  orderTotalToBeCollected: number | null;
  orderTotalCost: number | null;
  orderId: string | undefined;
  isVendor: boolean;
  isAdmin: boolean;
  isAddingComment: boolean;
  isUpdatingComment: boolean;
  navigate: NavigateFunction;
  changeManufactureStatus: (status: number | null) => void;
  changeOrderStatus: (status: number | null) => void;
  changeDeliveryStatus: (status: number | null) => void;
  changeAssignee: (userId: number | null) => void;
  changeDeliveryLocation: (shippedFromInventory: boolean) => void;
  updateCustomer: (values: CustomerFormValues) => Promise<unknown>;
  isUpdatingCustomer: boolean;
  updateComment: (noteId: number | string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  handleAddComment: () => void;
  setPendingDeleteNoteId: (v: any) => void;
  handleDownloadInvoice: () => void;
};

export default function OrderDetailsView({
  orderDetails,
  orderlines,
  manufactureStatus,
  administrator,
  users,
  comments,
  commentText,
  setCommentText,
  editingIndex,
  setEditingIndex,
  editedCommentText,
  setEditedCommentText,
  setComments,
  selectedFiles,
  orderTotalPrice,
  orderTotalShipping,
  orderTotalToBeCollected,
  orderTotalCost,
  isVendor,
  isAdmin,
  isAddingComment,
  isUpdatingComment,
  navigate,
  changeManufactureStatus,
  changeOrderStatus,
  changeDeliveryStatus,
  changeAssignee,
  changeDeliveryLocation,
  updateCustomer,
  isUpdatingCustomer,
  updateComment,
  handleFileChange,
  handleRemoveFile,
  handleAddComment,
  setPendingDeleteNoteId,
  handleDownloadInvoice,
}: OrderDetailsViewProps) {
  /* صورة المنتج المعروضة في نافذة التكبير (lightbox) — null = مغلقة */
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /* نافذة تعديل بيانات العميل */
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  /* خيارات «حالة التأخير» من الـ meta (manufactureStatuses)؛ الثابت المحلي احتياطي فقط */
  const metaQuery = useOrdersMeta();
  const manufactureOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.manufactureStatuses;
    return fromMeta?.length
      ? fromMeta.map((s) => ({ value: s.id, label: s.label }))
      : manufactureStatusOptions;
  }, [metaQuery.data]);

  /* «حالة الطلب» من meta.statuses، و«المسؤول» من meta.assignees؛ ثوابت محلية احتياطية */
  const orderStatusOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.statuses;
    return fromMeta?.length
      ? fromMeta.map((s) => ({ value: s.id, label: s.label }))
      : statusoptions;
  }, [metaQuery.data]);

  /* «المسؤول» من users API (endpoint /users) مباشرةً */
  const assigneeOptions = useMemo(
    () =>
      (users ?? []).map((u: any) => ({
        value: Number(u.id),
        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.id),
      })),
    [users]
  );

  /* «حالة التسليم»: لا يوجد لها مفتاح في الـ meta — نستخدم الثابت المحلي.
     «مكان التسليم»: قيمتان ثابتتان تُحدّثان shippedFromInventory. */
  const deliveryStatusOptions = DELIVERY_STATUS;
  const deliveryLocationOptions = [
    { value: "inventory", label: "مخازن هومكس" },
    { value: "customer", label: "عنوان العميل" },
  ];

  const statusFieldLabelSx = { fontSize: "0.69rem", fontWeight: 700, color: OD.tx3, mb: 0.75 } as const;
  const statusSelectSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 40,
      borderRadius: "9px",
      bgcolor: OD.sur,
      fontSize: "0.78rem",
      "& fieldset": { borderColor: OD.brd },
      "&:hover fieldset": { borderColor: OD.accent },
    },
    "& .MuiSelect-select": { py: 1, px: 1.5, textAlign: "start" },
  } as const;

  return (
    <Box sx={{ width: "100%", bgcolor: OD.bg, minHeight: "50vh" }}>
                {/* ——— نافذة تكبير صورة المنتج (تُغلق بالزر أو بالنقر خارج الصورة) ——— */}
                <Modal
                  open={Boolean(previewImage)}
                  onClose={() => setPreviewImage(null)}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
                >
                  <Box sx={{ position: "relative", outline: "none", maxWidth: "94vw", maxHeight: "92vh" }}>
                    <IconButton
                      onClick={() => setPreviewImage(null)}
                      aria-label="إغلاق"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255,255,255,0.92)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                        "&:hover": { bgcolor: "#fff" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 20, color: "#0f172a" }} />
                    </IconButton>
                    <Box
                      component="img"
                      src={previewImage ?? ""}
                      alt=""
                      sx={{
                        display: "block",
                        maxWidth: "94vw",
                        maxHeight: "92vh",
                        objectFit: "contain",
                        borderRadius: "12px",
                        boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
                      }}
                    />
                  </Box>
                </Modal>

                {/* ——— نافذة تعديل بيانات العميل ——— */}
                <CustomerEditModal
                  open={customerModalOpen}
                  customer={orderDetails?.customer}
                  isSaving={isUpdatingCustomer}
                  onClose={() => setCustomerModalOpen(false)}
                  onSave={updateCustomer}
                />

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
                            {getOrderDetailPaymentLabel(orderDetails.paymentStatus) || "—"}
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
                      {orderlines.map((order) => {
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
                                  onClick={() => order?.product?.image && setPreviewImage(order.product.image)}
                                  sx={{
                                    width: 120,
                                    height: 110,
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                    border: `0.5px solid ${OD.brd}`,
                                    bgcolor: OD.sur2,
                                    flexShrink: 0,
                                    cursor: order?.product?.image ? "zoom-in" : "default",
                                    transition: "opacity .15s, box-shadow .15s",
                                    "&:hover": order?.product?.image
                                      ? { opacity: 0.9, boxShadow: `0 0 0 2px ${OD.accent}` }
                                      : undefined,
                                  }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: OD.tx, mb: 0.75, lineHeight: 1.4 }}>
                                    {order?.title}
                                  </Typography>
                                  <Typography sx={{ fontSize: "1.125rem", fontWeight: 900, color: OD.accent, mb: 1 }}>
                                    {unitPrice != null ? Number(unitPrice).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"}{" "}
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
                            {/* حالة الطلب */}
                            <Box>
                              <Typography sx={statusFieldLabelSx}>حالة الطلب</Typography>
                              <SelectComponent
                                id="order-status"
                                options={orderStatusOptions}
                                value={orderDetails.status != null ? Number(orderDetails.status) : null}
                                onChange={changeOrderStatus}
                                withSectionBorder={false}
                                boxSx={{ p: 0 }}
                                formControlSx={statusSelectSx}
                              />
                            </Box>

                            {/* حالة التسليم */}
                            <Box>
                              <Typography sx={statusFieldLabelSx}>حالة التسليم</Typography>
                              <SelectComponent
                                id="order-delivery-status"
                                options={deliveryStatusOptions}
                                value={orderDetails.deliveryStatus != null ? Number(orderDetails.deliveryStatus) : null}
                                onChange={changeDeliveryStatus}
                                withSectionBorder={false}
                                boxSx={{ p: 0 }}
                                formControlSx={statusSelectSx}
                              />
                            </Box>

                            {/* المسؤول — بحث ضمن مستخدمي /users */}
                            <Box>
                              <Typography sx={statusFieldLabelSx}>المسؤول</Typography>
                              <Autocomplete
                                id="order-assignee"
                                options={assigneeOptions}
                                value={
                                  assigneeOptions.find(
                                    (o) =>
                                      o.value ===
                                      (orderDetails.userId != null ? Number(orderDetails.userId) : null)
                                  ) ?? null
                                }
                                onChange={(_e, newValue: any) =>
                                  changeAssignee(newValue ? newValue.value : null)
                                }
                                getOptionLabel={(o: any) => o.label ?? ""}
                                isOptionEqualToValue={(o: any, v: any) => o.value === v.value}
                                noOptionsText="لا يوجد"
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    minHeight: 40,
                                    borderRadius: "9px",
                                    bgcolor: OD.sur,
                                    fontSize: "0.78rem",
                                    py: "1px !important",
                                    "& fieldset": { borderColor: OD.brd },
                                    "&:hover fieldset": { borderColor: OD.accent },
                                    "&.Mui-focused fieldset": { borderColor: OD.accent },
                                  },
                                  "& .MuiAutocomplete-input": { fontSize: "0.78rem" },
                                }}
                                renderInput={(params) => (
                                  <TextField {...params} placeholder="ابحث عن مسؤول..." />
                                )}
                              />
                            </Box>

                            {/* مكان التسليم */}
                            <Box>
                              <Typography sx={statusFieldLabelSx}>مكان التسليم</Typography>
                              <SelectComponent
                                id="order-delivery-location"
                                options={deliveryLocationOptions}
                                value={orderDetails.shippedFromInventory ? "inventory" : "customer"}
                                onChange={(v: string) => changeDeliveryLocation(v === "inventory")}
                                withSectionBorder={false}
                                boxSx={{ p: 0 }}
                                formControlSx={statusSelectSx}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography sx={{ fontSize: "0.69rem", fontWeight: 700, color: OD.tx3, mb: 0.75 }}>
                              حالة التأخير (تشغيل الفعلي)
                            </Typography>
                            <SelectComponent
                              id="order-manufacture-status"
                              options={manufactureOptions}
                              value={manufactureStatus}
                              onChange={changeManufactureStatus}
                              withSectionBorder={false}
                              boxSx={{ p: 0 }}
                              formControlSx={{
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
                                const commentMaker = resolveCommenterName(comment, users);
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
                                  <Stack key={comment.id ?? index} direction="row" spacing={1.125} alignItems="flex-start" sx={{ opacity: comment.pending ? 0.6 : 1, transition: "opacity .2s" }}>
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
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                  e.preventDefault();
                                                  if (!isUpdatingComment && editedCommentText.trim()) {
                                                    updateComment(comment.id);
                                                  }
                                                }
                                              }}
                                              multiline
                                              size="small"
                                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: "0.75rem" } }}
                                            />
                                            <Stack direction="row" spacing={0.75} justifyContent="flex-end" mt={1}>
                                              <Button size="small" disabled={isUpdatingComment} onClick={() => setEditingIndex(null)} sx={{ textTransform: "none", fontSize: "0.7rem" }}>
                                                إلغاء
                                              </Button>
                                              <Button
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                disabled={isUpdatingComment || !editedCommentText.trim()}
                                                onClick={() => updateComment(comment.id)}
                                                sx={{ textTransform: "none", fontSize: "0.7rem", minWidth: 56, bgcolor: OD.accent, "&:hover": { bgcolor: OD.accentHover } }}
                                              >
                                                {isUpdatingComment ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "حفظ"}
                                              </Button>
                                            </Stack>
                                          </>
                                        ) : (
                                          comment.text
                                        )}
                                      </Box>
                                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }} flexWrap="wrap" gap={0.5}>
                                        <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>
                                          {commentMaker} · {new Date(comment.createdAt).toLocaleString("en-US")}
                                        </Typography>
                                        {isAdmin && editingIndex !== index && (
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
                                        )}
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (!isAddingComment && (commentText.trim() || selectedFiles?.length)) {
                                  handleAddComment();
                                }
                              }
                            }}
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
                            disabled={(!commentText && !selectedFiles?.length) || isAddingComment}
                            onClick={handleAddComment}
                            sx={{
                              px: 2.25,
                              height: 36,
                              minWidth: 76,
                              borderRadius: "9px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              bgcolor: OD.accent,
                              whiteSpace: "nowrap",
                              "&:hover": { bgcolor: OD.accentHover },
                            }}
                          >
                            {isAddingComment ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "إرسال"}
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
                                onClick={() => setCustomerModalOpen(true)}
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
                                {Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })} ج.م
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
                                    {Number(margin).toLocaleString("en-US", { maximumFractionDigits: 0 })} ج.م
                                  </Typography>
                                )}
                                {row("تكلفة الشحن", fmt(ship, true))}
                                {row("الخصم", fmt(disc, true))}
                                {row("جدية الشراء", fmt(down, true))}
                                {row(
                                  "المبلغ المطلوب تحصيله",
                                  <Typography component="span" sx={{ fontWeight: 900, fontSize: "0.94rem", color: OD.accent }}>
                                    {Number(collect).toLocaleString("en-US", { maximumFractionDigits: 0 })} ج.م
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
                                onClick: () => {
                                  const op = String(orderDetails.operationNumber ?? orderDetails.code ?? "").trim();
                                  navigate(op ? `/tickets?operationNumber=${encodeURIComponent(op)}` : "/tickets");
                                },
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

                      {/* سجل الأحداث — من data.timeline */}
                      {Array.isArray(orderDetails.timeline) && orderDetails.timeline.length > 0 && (
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
                              <TimelineOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />
                              <Typography sx={{ fontSize: "0.81rem", fontWeight: 700, color: OD.tx }}>
                                سجل الأحداث
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: "14px 16px" }}>
                            {orderDetails.timeline.map((ev: any, i: number) => {
                              const isLast = i === orderDetails.timeline.length - 1;
                              const st = timelineEventStyle(ev?.eventType);
                              const Icon = st.Icon;
                              return (
                                <Box key={ev?.id ?? i} sx={{ display: "flex", gap: 1.25 }}>
                                  {/* المسار: نقطة + خط عمودي */}
                                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        bgcolor: st.bg,
                                        color: st.color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Icon sx={{ fontSize: 14 }} />
                                    </Box>
                                    {!isLast && (
                                      <Box sx={{ flex: 1, width: "2px", bgcolor: OD.brd, minHeight: 16, my: "2px" }} />
                                    )}
                                  </Box>
                                  {/* المحتوى */}
                                  <Box sx={{ flex: 1, minWidth: 0, pt: "3px", pb: isLast ? 0 : 1.75 }}>
                                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: OD.tx, lineHeight: 1.4 }}>
                                      {ev?.message ?? "—"}
                                    </Typography>
                                    {ev?.description ? (
                                      <Typography sx={{ fontSize: "0.72rem", color: OD.tx2, mt: 0.25 }}>
                                        {ev.description}
                                        {ev?.userName ? ` · ${ev.userName}` : ""}
                                      </Typography>
                                    ) : null}
                                    <Typography sx={{ fontSize: "0.66rem", color: OD.tx3, mt: 0.375 }}>
                                      {formatEventTime(ev?.changedAt)}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Box>
  );
}
