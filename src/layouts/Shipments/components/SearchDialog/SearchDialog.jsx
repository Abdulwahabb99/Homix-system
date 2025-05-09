/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";

const SearchDialog = ({ data, open, onClose, handleSearch }) => {
  const [orderNumber, setOrderNumber] = useState(data?.orderNumber || "");
  const [shipmentCompany, setShipmentCompany] = useState(data?.shippingCompany || "");

  const onSearchConfirm = (e) => {
    e.preventDefault();
    handleSearch(orderNumber, shipmentCompany);
    onClose();
  };

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>البحث</DialogTitle>
      <DialogContent>
        <div style={{ marginBottom: "16px" }}>
          <TextField
            fullWidth
            variant="standard"
            label="رقم الشحنة"
            type="number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div>
          <TextField
            fullWidth
            variant="standard"
            label="شركة الشحن"
            type="text"
            value={shipmentCompany}
            onChange={(e) => setShipmentCompany(e.target.value)}
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
