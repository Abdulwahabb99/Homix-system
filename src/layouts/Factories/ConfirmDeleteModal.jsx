/* eslint-disable react/prop-types */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";

function ConfirmDeleteModal({ open, onClose, handleConfirmDelete }) {
  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل طلب</DialogTitle>
      <DialogContent></DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button onClick={handleConfirmDelete} variant="contained" style={{ color: "#fff" }}>
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteModal;
