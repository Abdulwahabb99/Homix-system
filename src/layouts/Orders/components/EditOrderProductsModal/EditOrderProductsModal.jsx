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
  const [status, setStatus] = useState(data.status);
  const [notes, setNotes] = useState(data.notes);
  console.log(data);
  // useEffect(() => {
  //   setOrderStatus(data.status);
  // }, []);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل {data.name}</DialogTitle>
      <DialogContent>
        <div>
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel id="orderStatus">حالة المنتج</InputLabel>
            <Select
              fullWidth
              labelId="orderStatus"
              id="orderStatus-select"
              value={status}
              label="حالة المنتج"
              onChange={(e) => setStatus(e.target.value)}
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
          <TextField
            fullWidth
            label="تكلفة القطعة"
            type="number"
            value={orderCost}
            onChange={(e) => setOrderCost(e.target.value)}
            style={{ margin: "5px 0" }}
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
          //  color="error"
          onClick={() => onEdit(status, notes, orderCost, data.id)}
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
