/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
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
const EditOrderProductsModal = ({ open, onEdit, onClose, data }) => {
  const [orderCost, setOrderCost] = useState(data.unitCost);
  const [color, setColor] = useState(data.color);
  const [size, setSize] = useState(data.size);
  const [material, setMaterial] = useState(data.material);
  const [notes, setNotes] = useState(data.notes);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.userType === "1";

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل {data.name}</DialogTitle>
      <DialogContent>
        <div>
          <TextField
            fullWidth
            label="تكلفة القطعة"
            type="number"
            value={orderCost}
            onChange={(e) => setOrderCost(e.target.value)}
            style={{ margin: "5px 0" }}
            disabled={!isAdmin}
          />
          <TextField
            fullWidth
            label="اللون"
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ margin: "5px 0" }}
            disabled={!isAdmin}
          />
          <TextField
            fullWidth
            label="المقاس"
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={{ margin: "5px 0" }}
            disabled={!isAdmin}
          />
          <TextField
            fullWidth
            label="الخامات"
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            style={{ margin: "5px 0" }}
            disabled={!isAdmin}
          />

          <TextField
            fullWidth
            label="ملاحظات"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            multiline
            style={{ margin: "5px 0" }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() => onEdit(notes, orderCost, data.id, color, size, material)}
          variant="contained"
          style={{ color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderProductsModal;
