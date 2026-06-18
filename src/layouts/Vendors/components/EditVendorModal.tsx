/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontFamily: FONT, fontSize: "13px",
    "& fieldset": { borderColor: HX.border },
    "&:hover fieldset": { borderColor: HX.accent },
    "&.Mui-focused fieldset": { borderColor: HX.accent, borderWidth: "1px" },
  },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "13px" },
  "& .MuiInputLabel-root.Mui-focused": { color: HX.accent },
  "& .MuiInputBase-input": { fontFamily: FONT },
};

const EditVendorModal = ({ open, onEdit, onClose, data }) => {
  const [password, setPassword] = useState("");
  const [daysToDeliver, setDaysToDeliver] = useState(data.daysToDeliver);
  const [showPassword, setShowPassword] = useState(false);

  const btnBase = {
    px: "20px", height: 38, borderRadius: "10px", border: "none", cursor: "pointer",
    fontFamily: FONT, fontSize: "13px", fontWeight: 700, transition: ".15s",
  } as const;

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: HX.r, fontFamily: FONT } }}
    >
      <DialogTitle sx={{ fontFamily: FONT, fontSize: "16px", fontWeight: 800, color: HX.tx, pb: "8px" }}>
        تعديل المورد
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", pt: "8px" }}>
          <TextField
            fullWidth label="البريد الإلكتروني" name="email-field" size="small"
            value={data.user?.email} InputProps={{ readOnly: true }} sx={fieldSx}
          />
          <TextField
            fullWidth label="كلمة المرور" autoComplete="new-password" name="new-password-field" size="small"
            value={password} onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"} sx={fieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" aria-label="إظهار كلمة المرور">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth label="مدة الشحن" value={daysToDeliver} size="small"
            onChange={(e) => setDaysToDeliver(e.target.value)} type="number" sx={fieldSx}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: "8px" }}>
        <Box component="button" type="button" onClick={onClose} sx={{ ...btnBase, border: `1px solid ${HX.border2}`, bgcolor: HX.surface, color: HX.tx2, "&:hover": { bgcolor: HX.surface3, color: HX.tx } }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={() => onEdit(daysToDeliver, password)} sx={{ ...btnBase, bgcolor: HX.accent, color: "#fff", "&:hover": { bgcolor: "#4f46e5" } }}>
          تأكيد
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditVendorModal;
