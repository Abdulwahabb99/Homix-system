/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { DELIVERY_STATUS, PAYMENT_STATUS, statusoptions } from "../utils/constants";
import axiosRequest from "shared/functions/axiosRequest";

const BulkEditModal = ({ open, onEdit, onClose }) => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [shippedFromInventory, setShippedFromInventory] = useState(false);

  // useEffect(() => {
  //   axiosRequest.get("/users").then(({ data: { data } }) => {
  //     const newUsers = data.map((user) => ({
  //       label: `${user.firstName} ${user.lastName}`,
  //       value: user.id,
  //     }));
  //     setUsers(newUsers);
  //   });
  // }, []);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل الطلبات المحددة </DialogTitle>
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

          <FormControlLabel
            sx={{ display: "flex", alignItems: "center" }}
            control={
              <Checkbox
                checked={shippedFromInventory}
                onChange={(e) => setShippedFromInventory(e.target.checked)}
                color="primary"
                sx={{
                  "& .MuiSvgIcon-root": {
                    border: "1px solid rgb(135, 134, 134)",
                    fontSize: 18,
                  },
                }}
              />
            }
            label={
              <Typography color={"#000"} fontSize={"13px"} fontWeight="bold">
                شحن للمخزن
              </Typography>
            }
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() => onEdit(orderStatus, paymentStatus, shippedFromInventory)}
          variant="contained"
          style={{ color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEditModal;
