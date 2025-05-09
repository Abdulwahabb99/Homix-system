/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";

function ConfirmDeleteModal({ open, onClose, handleConfirmDelete }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <h2 style={{ textAlign: "center", color: "#000" }}>هل متأكد من حذف الشحنة ؟</h2>
      </DialogContent>
      <DialogActions style={{ display: "flex", justifyContent: "center" }}>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="contained"
          style={{ color: "#fff", background: "red" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteModal;
