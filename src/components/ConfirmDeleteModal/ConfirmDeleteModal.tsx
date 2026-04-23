/* eslint-disable react/prop-types */
// ConfirmDeleteDialog.js
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import styles from "./ConfirmDeleteModal.module.css";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, row }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>تأكيد الحذف</DialogTitle>
      <DialogContent>
        <DialogContentText>
          هل أنت متأكد أنك تريد حذف الطلب رقم {row?.orderNumber}؟
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() => onConfirm(row)}
          //  color="error"
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

export default ConfirmDeleteModal;
