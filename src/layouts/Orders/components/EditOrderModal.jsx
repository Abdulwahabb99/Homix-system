/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
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
const EditOrderModal = ({ open, onClose, data }) => {
  const [orderCost, setOrderCost] = useState(null);
  const [orderStatus, setOrderStatus] = useState(data.status);
  const [commission, setCommission] = useState(null);
  const [notes, setNotes] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  console.log(data);
  // useEffect(() => {
  //   setOrderStatus(data.status);
  // }, []);

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
          <TextField
            fullWidth
            label="التكلفة"
            type="number"
            value={orderCost}
            onChange={(e) => setOrderCost(e.target.value)}
            style={{ margin: "5px 0" }}
          />
          <TextField
            fullWidth
            label="العمولة"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            type="number"
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
          <FormControl fullWidth style={{ margin: "10px 0" }}>
            <InputLabel style={{ margin: "5px 20px 0 0" }} id="manufacturingDate">
              تاريخ امر التصنيع
            </InputLabel>
            <TextField
              fullWidth
              // label="تاريخ امر التصنيع"
              value={manufacturingDate}
              onChange={(e) => setManufacturingDate(e.target.value)}
              style={{ margin: "5px 0" }}
              type="date"
            />
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          //  color="error"
          //  onClick={}
          variant="contained"
          style={{ color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderModal;
