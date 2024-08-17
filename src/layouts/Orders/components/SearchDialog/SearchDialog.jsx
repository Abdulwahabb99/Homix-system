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
const SearchDialog = ({ open, onClose, setSearchParams }) => {
  const [orderNumber, setOrderNumber] = useState("");

  const onSearchConfirm = (e) => {
    e.preventDefault();
    setSearchParams({
      orderNumber: orderNumber ? orderNumber : "",
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
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={onSearchConfirm}
          variant="contained"
          style={{ background: "#d32f2f", color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;
