/* eslint-disable react/prop-types */
// ConfirmDeleteDialog.js
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
// import styles from "./ConfirmDeleteModal.module.css";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
// import { useSearchParams } from "react-router-dom";
const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "قيد التنفيذ", value: 2 },
  { label: "رفض", value: 3 },
  { label: "تم التنفيذ", value: 4 },
  { label: "خارج للتوصيل", value: 5 },
  { label: "تم التسليم", value: 6 },
  { label: "مسترجع", value: 7 },
  { label: "ملغي", value: 8 },
];
const SearchDialog = ({ open, onClose, setSearchParams }) => {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [vendorName, setVendorName] = useState("");

  const onSearchConfirm = (e) => {
    e.preventDefault();
    setSearchParams({
      orderNumber: orderNumber ? orderNumber : "",
      vendorName: vendorName ? vendorName?.toString() : "",
      status: orderStatus ? orderStatus : "",
    });
    onClose();
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>البحث</DialogTitle>
      <DialogContent>
        <div>
          <TextField
            fullWidth
            variant="standard"
            label="رقم الطلب"
            type="number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            //  style={{ marginBottom: "10px" }}
          />
          {/* <TextField
            fullWidth
            variant="standard"
            label="حالة الطلب"
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            style={{ margin: "10px 0" }}
          /> */}
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة الطلب</InputLabel>
            <Select
              fullWidth
              labelId="orderStatus"
              id="orderStatus-select"
              variant="standard"
              value={orderStatus}
              label="حالة الطلب"
              onChange={(e) => setOrderStatus(e.target.value)}
              sx={{ height: 35 }} // Adjust the height as needed
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

          <TextField
            fullWidth
            variant="standard"
            label="المصنع"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            //  style={{ marginBottom: "10px" }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          //  color="error"
          onClick={onSearchConfirm}
          variant="contained"
          //  className={styles.deleteButton}
          style={{ background: "#d32f2f", color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;
