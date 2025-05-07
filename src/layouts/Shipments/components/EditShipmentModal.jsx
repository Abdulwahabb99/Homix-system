/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DELIVERY_STATUS, PAYMENT_STATUS, statusoptions } from "../../Orders/utils/constants";
import { USER_TYPES_VALUES } from "shared/utils/constants";
import { SHIPMENT_TYPE_VALUES } from "shared/utils/constants";
import { SHIPMENT_STATUS_VALUES } from "shared/utils/constants";
import { GOVERNORATES_VALUES } from "shared/utils/constants";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${year}-${month}-${day}`;
};

const EditOrderModal = ({ open, onEdit, onClose, data, vendors }) => {
  const [shipmentStatus, setShipmentStatus] = useState(data.shipmentStatus);
  const [shipmentType, setShipmentType] = useState(data.shipmentType);
  const [governorate, setGovernorate] = useState(data.governorate);
  const [shippingCompany, setShippingCompany] = useState(data.shippingCompany);
  const [shippingFees, setShippingFees] = useState(data.shippingFees);
  const [shippingReceiveDate, setShippingReceiveDate] = useState(
    data.shippingReceiveDate
      ? formatDate(data.shippingReceiveDate)
      : new Date().toISOString().split("T")[0]
  );
  const [deliveryDate, setDeliveryDate] = useState(
    data.deliveryDate ? formatDate(data.deliveryDate) : new Date().toISOString().split("T")[0]
  );

  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  console.log(data);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل الشحنة {data.orderData?.name}</DialogTitle>
      <DialogContent>
        <div>
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
            label="تكلفة الشحن"
            value={shippingFees}
            onChange={(e) => setShippingFees(e.target.value)}
            type="number"
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
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() =>
            onEdit(
              data.id,
              shipmentStatus,
              shipmentType,
              governorate,
              shippingCompany,
              shippingFees,
              shippingReceiveDate,
              deliveryDate
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
