import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import Spinner from "components/Spinner/Spinner";
import moment from "moment";
import { PAYMENT_STATUS, statusoptions } from "../utils/constants";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { manufactureStatusOptions } from "shared/utils/constants";
import {
  useOrderDetailQuery,
  useUpdateOrderMutation,
  type UpdateOrderPayload,
} from "query/orderEdit.api";

/** الـ API يضع أحيانًا معرّف العميل في أكثر من مسار. */
function resolveCustomerIdFromOrder(order: any): string {
  const candidates = [
    order?.customer?.id,
    order?.customerId,
    order?.customer?.customerId,
    order?.clientId,
    order?.financial?.customerId,
    order?.userCustomerId,
  ];
  for (const raw of candidates) {
    if (raw == null || raw === "") continue;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1) return String(n);
    const s = String(raw).trim();
    if (s !== "") return s;
  }
  return "";
}

function resolveManufactureStatusFromOrder(order: any): number | "" {
  const hasMfg = order?.manufactureStatus != null && order.manufactureStatus !== "";
  const raw = hasMfg ? order.manufactureStatus : order?.deliveryStatus;
  if (raw == null || raw === "") return "";
  return Number(raw);
}

function toYmdFromOrderDate(raw: unknown): string {
  if (raw == null || raw === "") return "";
  const m = moment(raw).locale("en");
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
}

function buildUpdatePayload(
  order: any,
  fields: {
    orderStatus: number | "";
    paymentStatus: number | "";
    manufactureStatus: number | "";
    customerId: string;
    totalPrice: string;
    expectedDeliveryDate: string;
  }
): UpdateOrderPayload | null {
  const cidStr = String(fields.customerId).trim() || resolveCustomerIdFromOrder(order);
  const customerId = Number(cidStr);
  if (!Number.isFinite(customerId) || customerId < 1) {
    NotificationMeassage("error", "تعذّر تحديد معرّف العميل من الطلب. أعد تحميل الصفحة.");
    return null;
  }

  const status =
    fields.orderStatus !== "" ? Number(fields.orderStatus) : Number(order?.status ?? 0);
  const paymentStatus =
    fields.paymentStatus !== ""
      ? Number(fields.paymentStatus)
      : Number(order?.paymentStatus ?? 0);

  let manufactureStatusNum: number;
  if (fields.manufactureStatus !== "") {
    manufactureStatusNum = Number(fields.manufactureStatus);
  } else {
    const fromOrder = resolveManufactureStatusFromOrder(order);
    manufactureStatusNum =
      fromOrder !== "" && Number.isFinite(Number(fromOrder)) ? Number(fromOrder) : 1;
  }
  if (!Number.isFinite(manufactureStatusNum)) {
    manufactureStatusNum = 1;
  }

  const dateTrim = fields.expectedDeliveryDate.trim();
  const expectedDeliveryDate =
    dateTrim || toYmdFromOrderDate(order?.expectedDeliveryDate) || toYmdFromOrderDate(order?.orderDate);
  if (!expectedDeliveryDate) {
    NotificationMeassage("error", "حدّد تاريخ التسليم المتوقع");
    return null;
  }

  const tp = Number(fields.totalPrice);
  if (fields.totalPrice.trim() === "" || !Number.isFinite(tp)) {
    NotificationMeassage("error", "أدخل إجمالي السعر بشكل صالح");
    return null;
  }

  return {
    customerId,
    expectedDeliveryDate,
    manufactureStatus: manufactureStatusNum,
    paymentStatus: Number.isFinite(paymentStatus) ? paymentStatus : 0,
    status: Number.isFinite(status) ? status : 0,
    totalPrice: tp,
  };
}

function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id ?? "";

  const { data: order, isLoading, isError, error } = useOrderDetailQuery(orderId || undefined);
  const updateMutation = useUpdateOrderMutation(orderId || undefined);

  const [orderStatus, setOrderStatus] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState<number | "">("");
  const [manufactureStatus, setManufactureStatus] = useState<number | "">("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  useEffect(() => {
    if (isError) {
      NotificationMeassage("error", "تعذر تحميل بيانات الطلب");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [isError, error]);

  useEffect(() => {
    if (!order?.id) return;
    setOrderStatus(order.status != null ? Number(order.status) : "");
    setPaymentStatus(order.paymentStatus != null ? Number(order.paymentStatus) : "");
    setManufactureStatus(resolveManufactureStatusFromOrder(order));
    setCustomerId(resolveCustomerIdFromOrder(order));
    const cn =
      order.customer?.name ??
      [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ");
    setCustomerName(typeof cn === "string" ? cn : "");
    const tp = order.totalPrice ?? order.subTotalPrice;
    setTotalPrice(tp != null ? String(tp) : "");
    const exp = order.expectedDeliveryDate ?? order.orderDate;
    setExpectedDeliveryDate(exp ? toYmdFromOrderDate(exp) : "");
  }, [order?.id]);

  /* تعطيل الزر فقط أثناء الحفظ — التحقق من الحقول عند الضغط (مع قيم احتياطية من الطلب المحمّل). */
  const saveDisabled = updateMutation.isPending;

  const editOrder = () => {
    if (updateMutation.isPending || !orderId || !order) return;
    const payload = buildUpdatePayload(order, {
      orderStatus,
      paymentStatus,
      manufactureStatus,
      customerId,
      totalPrice,
      expectedDeliveryDate,
    });
    if (!payload) return;
    updateMutation.mutate(payload, {
      onSuccess: () => navigate(`/orders/${orderId}`),
    });
  };

  const displayCustomerId = customerId || resolveCustomerIdFromOrder(order);

  return (
    <DashboardLayout>
      <ToastContainer />
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <IconButton sx={{ color: "#344767" }} onClick={() => navigate(`/orders/${id}`)}>
          <ArrowNextIcon />
        </IconButton>
      </div>
      {isLoading ? (
        <Spinner />
      ) : isError || !order?.id ? (
        <Typography color="error">تعذر عرض الطلب.</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              العميل: <strong>{customerName || "—"}</strong>{" "}
              {displayCustomerId ? `(#${displayCustomerId})` : ""}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="orderStatus">حالة الطلب</InputLabel>
              <Select<number>
                fullWidth
                labelId="orderStatus"
                id="orderStatus-select"
                value={orderStatus === "" ? "" : Number(orderStatus)}
                label="حالة الطلب"
                onChange={(e) => setOrderStatus(Number(e.target.value))}
                sx={{ height: 43 }}
              >
                {statusoptions?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="paymentStatus">حالة الدفع</InputLabel>
              <Select<number>
                fullWidth
                labelId="paymentStatus"
                id="paymentStatus-select"
                value={paymentStatus === "" ? "" : Number(paymentStatus)}
                label="حالة الدفع"
                onChange={(e) => setPaymentStatus(Number(e.target.value))}
                sx={{ height: 43 }}
              >
                {PAYMENT_STATUS?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <FormControl fullWidth>
              <InputLabel id="mfgStatus">حالة التصنيع</InputLabel>
              <Select<number>
                fullWidth
                labelId="mfgStatus"
                id="mfgStatus-select"
                value={manufactureStatus === "" ? "" : Number(manufactureStatus)}
                label="حالة التصنيع"
                onChange={(e) => setManufactureStatus(Number(e.target.value))}
                sx={{ height: 43 }}
              >
                {manufactureStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="إجمالي السعر"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <TextField
              fullWidth
              label="تاريخ التسليم المتوقع"
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate(`/orders/${id}`)}
              variant="contained"
              style={{ background: "#000", color: "#fff", margin: "0 5px" }}
            >
              إلغاء
            </Button>
            <Button
              onClick={editOrder}
              variant="contained"
              style={{ color: "#fff" }}
              disabled={saveDisabled}
            >
              {updateMutation.isPending ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "حفظ"
              )}
            </Button>
          </Grid>
        </Grid>
      )}
    </DashboardLayout>
  );
}

export default OrderEdit;
