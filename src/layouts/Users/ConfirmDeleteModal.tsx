/* eslint-disable react/prop-types */
import React from "react";
import { Box, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

function ConfirmDeleteModal({ open, onClose, handleConfirmDelete }) {
  const btnBase = {
    px: "22px", height: 40, borderRadius: "10px", border: "none", cursor: "pointer",
    fontFamily: FONT, fontSize: "13px", fontWeight: 700, transition: ".15s",
  } as const;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: HX.r, fontFamily: FONT } }}>
      <DialogContent sx={{ pt: "26px", px: "32px", textAlign: "center" }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: HX.redLight, color: HX.red, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: "14px" }}>
          <DeleteOutlineIcon sx={{ fontSize: 26 }} />
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: "16px", fontWeight: 800, color: HX.tx, mb: "4px" }}>
          هل أنت متأكد من حذف المستخدم؟
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2 }}>
          لا يمكن التراجع عن هذا الإجراء.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center", gap: "10px", pb: "24px", px: "32px" }}>
        <Box component="button" type="button" onClick={onClose} sx={{ ...btnBase, border: `1px solid ${HX.border2}`, bgcolor: HX.surface, color: HX.tx2, "&:hover": { bgcolor: HX.surface3, color: HX.tx } }}>
          إلغاء
        </Box>
        <Box component="button" type="button" onClick={handleConfirmDelete} sx={{ ...btnBase, bgcolor: HX.red, color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>
          تأكيد الحذف
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteModal;
