/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const EditVendorModal = ({ open, onEdit, onClose, data }) => {
  const [password, setPassword] = useState("");
  const [daysToDeliver, setDaysToDeliver] = useState(data.daysToDeliver);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>تعديل المورد </DialogTitle>
      <DialogContent>
        <div style={{ padding: "10px 0" }}>
          <TextField
            fullWidth
            label="البريد الالكتروني"
            name="email-field"
            value={data.user?.email}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label="كلمة المرور"
            autoComplete="new-password"
            name="new-password-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            style={{ margin: "5px 0" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="مدة الشحن"
            value={daysToDeliver}
            onChange={(e) => setDaysToDeliver(e.target.value)}
            type="number"
            style={{ margin: "5px 0" }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" style={{ background: "#000", color: "#fff" }}>
          إلغاء
        </Button>
        <Button
          onClick={() => onEdit(daysToDeliver, password)}
          variant="contained"
          style={{ color: "#fff" }}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVendorModal;
