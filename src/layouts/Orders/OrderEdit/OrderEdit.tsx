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
    setManufactureStatus(
      order.manufactureStatus != null && order.manufactureStatus !== ""
        ? Number(order.manufactureStatus)
        : ""
    );
    const cid = order.customer?.id;
    setCustomerId(cid != null ? String(cid) : "");
    const cn =
      order.customer?.name ??
      [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ");
    setCustomerName(typeof cn === "string" ? cn : "");
    const tp = order.totalPrice ?? order.subTotalPrice;
    setTotalPrice(tp != null ? String(tp) : "");
    const exp = order.expectedDeliveryDate;
    setExpectedDeliveryDate(
      exp ? moment(exp).locale("en").format("YYYY-MM-DD") : ""
    );
  }, [order?.id]);

  const saveDisabled = (() => {
    if (updateMutation.isPending) return true;
    if (
      orderStatus === "" ||
      paymentStatus === "" ||
      manufactureStatus === "" ||
      !customerId ||
      !expectedDeliveryDate ||
      totalPrice === ""
    ) {
      return true;
    }
    const tp = Number(totalPrice);
    if (!Number.isFinite(tp)) return true;
    return false;
  })();

  const editOrder = () => {
    if (saveDisabled || !orderId) return;
    const payload: UpdateOrderPayload = {
      customerId: Number(customerId),
      expectedDeliveryDate,
      manufactureStatus: Number(manufactureStatus),
      paymentStatus: Number(paymentStatus),
      status: Number(orderStatus),
      totalPrice: Number(totalPrice),
    };
    if (!Number.isFinite(payload.customerId) || payload.customerId < 1) {
      NotificationMeassage("error", "بيانات العميل غير صالحة");
      return;
    }
    updateMutation.mutate(payload, {
      onSuccess: () => navigate(`/orders/${orderId}`),
    });
  };

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
              {customerId ? `(#${customerId})` : ""}
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
                onChange={(e) => setOrderStatus(e.target.value as number)}
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
                onChange={(e) => setPaymentStatus(e.target.value as number)}
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
                onChange={(e) => setManufactureStatus(e.target.value as number)}
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
