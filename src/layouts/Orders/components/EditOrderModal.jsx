/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DELIVERY_STATUS, PAYMENT_STATUS, statusoptions } from "../utils/constants";
import { USER_TYPES_VALUES } from "shared/utils/constants";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${year}-${month}-${day}`;
};

const EditOrderModal = ({ open, onEdit, onClose, data, vendors }) => {
  const [orderStatus, setOrderStatus] = useState(data.status);
  const [commission, setCommission] = useState(data.commission);
  const [manufacturingDate, setManufacturingDate] = useState(formatDate(`${data.PoDate}`));
  const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus);
  const [downPayment, setDownPayment] = useState(data.downPayment);
  const [shippingCost, setShippingCost] = useState(data.receivedAmount);
  const [toBeCollected, setToBeCollected] = useState(data.toBeCollected);
  const [selectedVendor, setSelectedVendor] = useState(data.selectedVendor);
  const [deliveryStatus, setDeliveryStatus] = useState(data.deliveryStatus);
  const [administrator, setAdministrator] = useState(data?.administrator);

  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

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
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">البائع</InputLabel>
            <Select
              fullWidth
              labelId="vendor"
              id="vendor"
              value={selectedVendor}
              label="البائع"
              onChange={(e) => setSelectedVendor(e.target.value)}
              sx={{ height: 35 }}
            >
              {vendors.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة التصنيع</InputLabel>
            <Select
              fullWidth
              labelId="deliveryStatus"
              id="deliveryStatus"
              value={deliveryStatus}
              label="حالة التصنيع"
              onChange={(e) => setDeliveryStatus(e.target.value)}
              sx={{ height: 35 }}
            >
              {DELIVERY_STATUS.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="administratorName">المسؤول</InputLabel>
            <Select
              fullWidth
              labelId="administrator"
              id="administrator"
              value={administrator}
              label="حالة الدفع"
              onChange={(e) => setAdministrator(e.target.value)}
              sx={{ height: 35 }}
            >
              {USER_TYPES_VALUES.map((option) => {
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
            label="جدية شراء"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="تكلفة الشحن"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
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
              InputProps={{
                inputProps: {
                  max: formattedDate,
                },
              }}
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
              paymentStatus,
              downPayment,
              toBeCollected,
              shippingCost,
              selectedVendor,
              deliveryStatus,
              administrator
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
