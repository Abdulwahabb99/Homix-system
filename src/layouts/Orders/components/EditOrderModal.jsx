/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";

const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "قيد التنفيذ", value: 2 },
  { label: "نصف مكتمل", value: 3 },
  { label: "جاري التوصيل ", value: 4 },
  { label: "تم التوصيل", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "استبدال ", value: 7 },
];
const PAYMENT_STATUS = [
  { label: "مدفوع", value: 1 },
  { label: "دفع عند الاستلام", value: 2 },
];
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${year}-${month}-${day}`;
};

const EditOrderModal = ({ open, onEdit, onClose, data }) => {
  const [orderStatus, setOrderStatus] = useState(data.status);
  const [commission, setCommission] = useState(data.commission);
  const [receivedAmount, setReceivedAmount] = useState(data.receivedAmount);
  const [manufacturingDate, setManufacturingDate] = useState(formatDate(`${data.PoDate}`));
  const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus);
  const [downPayment, setDownPayment] = useState(data.downPayment);
  const [toBeCollected, setToBeCollected] = useState(data.toBeCollected);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل طلب {data.orderData.name}</DialogTitle>
      <DialogContent>
        <div>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة الطلب</InputLabel>
            <Select
              fullWidth
              labelId="orderStatus"
              id="orderStatus-select"
              value={orderStatus}
              label="حالة الطلب"
              onChange={(e) => setOrderStatus(e.target.value)}
              sx={{ height: 35 }}
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
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة الدفع</InputLabel>
            <Select
              fullWidth
              labelId="PAYMENT_STATUS"
              id="PAYMENT_STATUS-select"
              value={paymentStatus}
              label="حالة الدفع"
              onChange={(e) => setPaymentStatus(e.target.value)}
              sx={{ height: 35 }}
            >
              {PAYMENT_STATUS.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="المبلغ المستلم"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="جدية شراء"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="المبلغ المطلوب تحصيله"
            value={toBeCollected}
            onChange={(e) => setToBeCollected(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="العمولة"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel style={{ margin: "5px 20px 0 0" }} id="manufacturingDate">
              تاريخ امر التصنيع
            </InputLabel>
            <TextField
              fullWidth
              value={manufacturingDate}
              onChange={(e) => setManufacturingDate(e.target.value)}
              style={{ margin: "5px 0" }}
              type="date"
            />
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() =>
            onEdit(
              data.orderId,
              orderStatus,
              commission,
              manufacturingDate,
              receivedAmount,
              paymentStatus,
              downPayment,
              toBeCollected
            )
          }
          variant="contained"
          style={{ color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderModal;
