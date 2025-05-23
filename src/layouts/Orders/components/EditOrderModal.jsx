/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { PAYMENT_STATUS, statusoptions } from "../utils/constants";
import axiosRequest from "shared/functions/axiosRequest";
import moment from "moment";

const EditOrderModal = ({ open, onEdit, onClose, data, vendors, isSubmitting }) => {
  const [users, setUsers] = useState([]);
  const [orderStatus, setOrderStatus] = useState(data.status);
  const [commission, setCommission] = useState(data.commission);
  const [paymentStatus, setPaymentStatus] = useState(data.paymentStatus ? data.paymentStatus : "");
  const [downPayment, setDownPayment] = useState(data.downPayment);
  const [shippingCost, setShippingCost] = useState(data.shippingFees);
  const [toBeCollected, setToBeCollected] = useState(data.toBeCollected);
  const [selectedVendor, setSelectedVendor] = useState(data.items[0].product.vendorId);
  const [administrator, setAdministrator] = useState(data?.userId ? data?.userId : null);
  const [shippedFromInventory, setShippedFromInventory] = useState(
    data.shippedFromInventory ? data.shippedFromInventory : false
  );
  const [totalVendorDue, setTotalVendorDue] = useState(data.totalVendorDue);
  const [totalCompanyDue, setTotalCompanyDue] = useState(data.totalCompanyDue);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    moment(data.expectedDeliveryDate).locale("en").format("YYYY-MM-DD")
  );

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
              {users.map((option) => {
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
          {/* <TextField
            fullWidth
            label="العمولة"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          /> */}
          {/* <TextField
            label="إﺟﻣﺎﻟﻲ اﻟﻣﺳﺗﺣق ﻟﻠﺑﺎﺋﻊ"
            fullWidth
            value={totalVendorDue}
            onChange={(e) => setTotalVendorDue(e.target.value)}
            style={{ margin: "5px 0" }}
            type="number"
          />{" "}
          <TextField
            label="إﺟﻣﺎﻟﻲ اﻟﻣﺳﺗﺣق ﻟﻠﺷرﻛﺔ"
            fullWidth
            value={totalCompanyDue}
            onChange={(e) => setTotalCompanyDue(e.target.value)}
            style={{ margin: "5px 0" }}
            type="number"
          /> */}
          {/* <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel style={{ margin: "5px 20px 0 0" }} id="manufacturingDate">
              تاريخ التسليم المتوقع{" "}
            </InputLabel>
            <TextField
              fullWidth
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              style={{ margin: "5px 0" }}
              type="date"
              InputProps={{
                inputProps: {
                  min: moment().locale("en").format("YYYY-MM-DD"),
                },
              }}
            />
          </FormControl> */}
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
          onClick={() =>
            onEdit(
              data.orderId,
              orderStatus,
              commission,
              totalVendorDue,
              paymentStatus,
              downPayment,
              toBeCollected,
              shippingCost,
              selectedVendor,
              administrator,
              shippedFromInventory,
              totalCompanyDue,
              expectedDeliveryDate
            )
          }
          variant="contained"
          style={{ color: "#fff" }}
        >
          {isSubmitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "تأكيد"}{" "}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderModal;
