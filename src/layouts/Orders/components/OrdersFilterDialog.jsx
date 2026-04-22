import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PAYMENT_STATUS, statusoptions, DELIVERY_STATUS } from "layouts/Orders/utils/constants";

const PRIMARY = "primary.main";

const formControlSx = {
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: PRIMARY,
    "&.Mui-focused": {
      color: PRIMARY,
    },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    backgroundColor: "background.paper",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.28)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.45)" },
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

/**
 * تصفية: حالة الطلب، الموردون، الدفع، حالة التصنيع. (التاريخ يبقى في الصفحة مع useDateRange)
 */
function OrdersFilterDialog({ open, onClose, isVendor, vendors, value, onApply, onReset }) {
  const [draftStatus, setDraftStatus] = useState(value?.orderStatus ?? []);
  const [draftVendor, setDraftVendor] = useState(value?.selectedVendor ?? []);
  const [draftPayment, setDraftPayment] = useState(value?.paymentStatus ?? "");
  const [draftDelivery, setDraftDelivery] = useState(value?.deliveryStatus ?? []);

  useEffect(() => {
    if (!open) return;
    setDraftStatus(value?.orderStatus ?? []);
    setDraftVendor(value?.selectedVendor ?? []);
    setDraftPayment(value?.paymentStatus ?? "");
    setDraftDelivery(value?.deliveryStatus ?? []);
  }, [open, value]);

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 2.5,
          mb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: PRIMARY,
        }}
      >
        تصفية الطلبات
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="إغلاق"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5, px: 2.5, pb: 1, overflow: "visible" }}>
        <Stack spacing={2.5}>
          <FormControl fullWidth sx={{ ...formControlSx, mt: 0.5 }}>
            <InputLabel id="of-status" shrink>
              حالة الطلب
            </InputLabel>
            <Select
              labelId="of-status"
              notched
              label="حالة الطلب"
              multiple
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              MenuProps={menuProps}
              renderValue={(sel) =>
                !sel?.length ? (
                  <Box component="span" sx={{ color: "text.secondary" }}>
                    — الكل
                  </Box>
                ) : (
                  statusoptions
                    .filter((o) => sel.includes(o.value))
                    .map((o) => o.label)
                    .join("، ")
                )
              }
            >
              {statusoptions.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!isVendor && (
            <FormControl fullWidth sx={formControlSx}>
              <InputLabel id="of-v" shrink>
                المصنعون
              </InputLabel>
              <Select
                labelId="of-v"
                notched
                label="المصنعون"
                multiple
                value={draftVendor}
                onChange={(e) => setDraftVendor(e.target.value)}
                MenuProps={menuProps}
                renderValue={(sel) =>
                  !sel?.length ? (
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      — الكل
                    </Box>
                  ) : (
                    sel
                      .map((v) => vendors.find((x) => String(x.value) === String(v))?.label)
                      .filter(Boolean)
                      .join("، ")
                  )
                }
              >
                {vendors.map((o) => (
                  <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!isVendor && (
            <FormControl fullWidth sx={formControlSx}>
              <InputLabel id="of-pay" shrink>
                طريقة الدفع
              </InputLabel>
              <Select
                labelId="of-pay"
                notched
                label="طريقة الدفع"
                value={draftPayment}
                onChange={(e) => setDraftPayment(e.target.value)}
                MenuProps={menuProps}
              >
                <MenuItem value="">
                  <em>الكل</em>
                </MenuItem>
                {PAYMENT_STATUS.map((o) => (
                  <MenuItem key={o.value} value={String(o.value)} sx={{ fontSize: "0.875rem" }}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth sx={formControlSx}>
            <InputLabel id="of-del" shrink>
              حالة التصنيع
            </InputLabel>
            <Select
              labelId="of-del"
              notched
              label="حالة التصنيع"
              multiple
              value={draftDelivery}
              onChange={(e) => setDraftDelivery(e.target.value)}
              MenuProps={menuProps}
              renderValue={(sel) =>
                !sel?.length ? (
                  <Box component="span" sx={{ color: "text.secondary" }}>
                    — الكل
                  </Box>
                ) : (
                  DELIVERY_STATUS.filter((d) => sel.includes(d.value))
                    .map((d) => d.label)
                    .join("، ")
                )
              }
            >
              {DELIVERY_STATUS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 2.5,
          py: 2.5,
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "flex-end",
          backgroundColor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.50"),
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            onReset();
            onClose();
          }}
          sx={{
            minHeight: 44,
            fontWeight: 700,
            color: PRIMARY,
            borderColor: PRIMARY,
            borderWidth: 2,
            "&:hover": { borderColor: PRIMARY, backgroundColor: "rgba(6, 49, 70, 0.06)" },
          }}
        >
          إعادة التعيين
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => {
            onApply({
              orderStatus: draftStatus,
              selectedVendor: draftVendor,
              paymentStatus: draftPayment,
              deliveryStatus: draftDelivery,
            });
            onClose();
          }}
          sx={{ minHeight: 44, fontWeight: 700 }}
        >
          تطبيق
        </Button>
      </DialogActions>
    </Dialog>
  );
}

OrdersFilterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isVendor: PropTypes.bool,
  vendors: PropTypes.array,
  value: PropTypes.object,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default OrdersFilterDialog;
