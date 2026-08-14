import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { PAYMENT_STATUS, statusoptions } from "../utils/constants";
import { useOrdersMeta } from "query/ordersMeta.api";

const PRIMARY = "primary.main";

const formControlSx = {
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: PRIMARY,
    "&.Mui-focused": { color: PRIMARY },
    "&.MuiInputLabel-shrink": { color: PRIMARY },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    backgroundColor: "background.paper",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(99, 102, 241, 0.28)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(99, 102, 241, 0.45)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2, borderColor: PRIMARY },
  },
  "& .MuiSelect-select": { py: 1.75, px: 1.5, fontSize: "0.875rem" },
};

const menuProps = {
  PaperProps: {
    elevation: 8,
    sx: { borderRadius: 2, mt: 0.5, maxHeight: 360 },
  },
};

const BulkEditModal = ({ open, onEdit, onClose }) => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [deliveryBy, setDeliveryBy] = useState("");
  const { data: ordersMeta } = useOrdersMeta();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      BackdropProps={{ sx: { backgroundColor: "rgba(15, 23, 42, 0.45)" } }}
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          py: 2,
          px: 2.5,
          mb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: PRIMARY,
        }}
      >
        تعديل الطلبات المحددة
      </DialogTitle>
      <DialogContent sx={{ pt: 1, px: 2.5, pb: 0 }}>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-order-status-label">حالة الطلب</InputLabel>
            <Select
              labelId="bulk-order-status-label"
              id="bulk-order-status-select"
              value={orderStatus}
              label="حالة الطلب"
              onChange={(e) => setOrderStatus(e.target.value)}
              color="primary"
              MenuProps={menuProps}
            >
              {statusoptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-payment-status-label">حالة الدفع</InputLabel>
            <Select
              labelId="bulk-payment-status-label"
              id="bulk-payment-status-select"
              value={paymentStatus}
              label="حالة الدفع"
              onChange={(e) => setPaymentStatus(e.target.value)}
              color="primary"
              MenuProps={menuProps}
            >
              {PAYMENT_STATUS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-delivery-by-label">التوصيل بواسطة</InputLabel>
            <Select
              labelId="bulk-delivery-by-label"
              id="bulk-delivery-by-select"
              value={deliveryBy}
              label="التوصيل بواسطة"
              onChange={(e) => setDeliveryBy(e.target.value)}
              color="primary"
              MenuProps={menuProps}
            >
              {(ordersMeta?.deliveryByOptions ?? []).map((option) => (
                <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={(t) => ({
            fontWeight: 600,
            minWidth: 96,
            color: t.palette.text.primary,
            borderColor: alpha(t.palette.text.primary, 0.32),
            backgroundColor: alpha(t.palette.text.primary, 0.05),
            "&:hover": {
              color: t.palette.text.primary,
              borderColor: alpha(t.palette.text.primary, 0.5),
              backgroundColor: alpha(t.palette.text.primary, 0.1),
            },
          })}
        >
          إلغاء
        </Button>
        <Button
          onClick={() => onEdit(orderStatus, paymentStatus, deliveryBy)}
          variant="contained"
          color="primary"
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BulkEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkEditModal;
