/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { statusoptions } from "layouts/Orders/utils/constants";
import { PAYMENT_STATUS } from "layouts/Orders/utils/constants";
import { USER_TYPES_VALUES } from "shared/utils/constants";
import { SHIPMENT_STATUS_VALUES } from "shared/utils/constants";
import { SHIPMENT_TYPE_VALUES } from "shared/utils/constants";
import { GOVERNORATES_VALUES } from "shared/utils/constants";
import axiosRequest from "shared/functions/axiosRequest";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${year}-${month}-${day}`;
};

const AddOrderDetails = ({ open, onClose, customer, onConfirm }) => {
  const [orderStatus, setOrderStatus] = useState(customer?.orderStatus);
  const [commission, setCommission] = useState(customer?.commission);
  const [manufacturingDate, setManufacturingDate] = useState(
    formatDate(`${customer?.manufacturingDate}`)
  );
  const [paymentStatus, setPaymentStatus] = useState(customer?.paymentStatus);
  const [downPayment, setDownPayment] = useState(customer?.downPayment);
  const [shippingCost, setShippingCost] = useState(customer?.shippingCost);
  const [toBeCollected, setToBeCollected] = useState(customer?.toBeCollected);
  const [users, setUsers] = useState(customer?.administrator);
  const [selectedUser, setSelectedUser] = useState(customer?.userId);

  const [shipmentStatus, setShipmentStatus] = useState(customer?.shipmentStatus);
  const [shipmentType, setShipmentType] = useState(customer?.shipmentType);
  const [governorate, setGovernorate] = useState(customer?.governorate);
  const [shippingCompany, setShippingCompany] = useState(customer?.shippingCompany);
  const [shippingReceiveDate, setShippingReceiveDate] = useState(
    customer?.shippingReceiveDate
      ? formatDate(customer?.shippingReceiveDate)
      : new Date().toISOString().split("T")[0]
  );
  const [deliveryDate, setDeliveryDate] = useState(
    customer?.deliveryDate
      ? formatDate(customer?.deliveryDate)
      : new Date().toISOString().split("T")[0]
  );

  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  useEffect(() => {
    axiosRequest.get("/users").then(({ data: { data } }) => {
      const newUsers = data.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
      setUsers(newUsers);
    });
  }, []);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>اضافه معلومات الطلب</DialogTitle>
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
            <InputLabel id="administratorName">المسؤول</InputLabel>
            <Select
              fullWidth
              labelId="administrator"
              id="administrator"
              value={selectedUser}
              label="حالة الدفع"
              onChange={(e) => setSelectedUser(e.target.value)}
              sx={{ height: 35 }}
            >
              {users?.map((option) => {
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
            <InputLabel id="shipmentStatus">حالة الشحنة</InputLabel>
            <Select
              fullWidth
              labelId="shipmentStatus"
              id="shipmentStatus-select"
              value={shipmentStatus}
              label="حالة الشحنة"
              onChange={(e) => setShipmentStatus(e.target.value)}
              sx={{ height: 35 }}
            >
              {SHIPMENT_STATUS_VALUES.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="shipmentType">نوع الشحنة</InputLabel>
            <Select
              fullWidth
              labelId="shipmentType"
              id="shipmentType-select"
              value={shipmentType}
              label="نوع الشحنة"
              onChange={(e) => setShipmentType(e.target.value)}
              sx={{ height: 35 }}
            >
              {SHIPMENT_TYPE_VALUES.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="governorate">المحافظة</InputLabel>
            <Select
              fullWidth
              labelId="governorate"
              id="governorate-select"
              value={governorate}
              label="نوع الشحنة"
              onChange={(e) => setGovernorate(e.target.value)}
              sx={{ height: 35 }}
            >
              {GOVERNORATES_VALUES.map((option) => {
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
            label="شركة الشحن"
            value={shippingCompany}
            onChange={(e) => setShippingCompany(e.target.value)}
            type="text"
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="تاريخ استلام الشحنة"
            value={shippingReceiveDate}
            onChange={(e) => setShippingReceiveDate(e.target.value)}
            type="date"
            style={{ margin: "5px 0" }}
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <TextField
            fullWidth
            label="تاريخ التسليم"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            type="date"
            style={{ margin: "5px 0" }}
            defaultValue={new Date().toISOString().split("T")[0]}
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
          onClick={() => {
            onConfirm({
              orderStatus,
              commission,
              manufacturingDate,
              paymentStatus,
              downPayment,
              shippingCost,
              toBeCollected,
              selectedUser,
              shipmentStatus,
              shipmentType,
              governorate,
              shippingCompany,
              shippingReceiveDate,
              deliveryDate,
            });
          }}
          variant="contained"
          style={{ color: "#fff" }}
        >
          اضافه
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrderDetails;
