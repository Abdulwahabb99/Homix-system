/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  getUserSelectAutocompleteConfig,
  getUserSelectValue,
} from "layouts/Orders/components/userSelectAutocompleteConfig";
import { statusoptions } from "layouts/Orders/utils/constants";
import { PAYMENT_STATUS } from "layouts/Orders/utils/constants";
import { addOrderTextFieldSx } from "./addOrderFormStyles";

const BRAND = "#063146";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${year}-${month}-${day}`;
};

const formControlAddOrder = {
  width: "100%",
  "& .MuiInputLabel-root": { fontSize: "0.8125rem" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.18)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.32)" },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
    borderWidth: 2,
  },
  "& .MuiSelect-select": { py: 1.2, fontSize: "0.875rem" },
};

const AddOrderDetails = ({ open, onClose, customer, onConfirm, users = [] }) => {
  const theme = useTheme();
  const [orderStatus, setOrderStatus] = useState(customer?.orderStatus);
  const [commission, setCommission] = useState(customer?.commission);
  const [manufacturingDate, setManufacturingDate] = useState(
    formatDate(`${customer?.manufacturingDate}`)
  );
  const [paymentStatus, setPaymentStatus] = useState(customer?.paymentStatus);
  const [downPayment, setDownPayment] = useState(customer?.downPayment);
  const [shippingCost, setShippingCost] = useState(customer?.shippingCost);
  const [toBeCollected, setToBeCollected] = useState(customer?.toBeCollected);
  const [administrator, setAdministrator] = useState(customer?.administrator);

  useEffect(() => {
    if (!open) return;
    setOrderStatus(customer?.orderStatus);
    setCommission(customer?.commission);
    setManufacturingDate(
      customer?.manufacturingDate ? formatDate(String(customer.manufacturingDate)) : ""
    );
    setPaymentStatus(customer?.paymentStatus);
    setDownPayment(customer?.downPayment);
    setShippingCost(customer?.shippingCost);
    setToBeCollected(customer?.toBeCollected);
    setAdministrator(customer?.administrator);
  }, [open, customer]);

  const today = new Date();
  const formattedDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const newUsers = users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
  }));

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      transitionDuration={220}
      scroll="body"
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(8px)",
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          position: "relative",
          borderRadius: 3.5,
          overflow: "hidden",
          border: "1px solid",
          borderColor: alpha(BRAND, 0.12),
          background:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : `linear-gradient(180deg, #ffffff 0%, ${alpha(BRAND, 0.02)} 100%)`,
          boxShadow: `0 24px 48px -12px ${alpha(BRAND, 0.18)}, 0 12px 24px -8px ${alpha(
            "#0f172a",
            0.1
          )}`,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          px: 2.5,
          pt: 2.5,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
          boxSizing: "border-box",
          background: (t) =>
            t.palette.mode === "dark"
              ? alpha(BRAND, 0.12)
              : `linear-gradient(120deg, ${alpha(BRAND, 0.09)} 0%, ${alpha(
                  BRAND,
                  0.02
                )} 55%, #fff 100%)`,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            insetInlineEnd: 12,
            color: "text.secondary",
            bgcolor: (t) => alpha(t.palette.common.white, 0.5),
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { bgcolor: "background.paper", color: "primary.main" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="flex-start"
          gap={1.75}
          sx={{
            width: "100%",
            maxWidth: "100%",
            paddingInlineEnd: 7,
            textAlign: "start",
            alignSelf: "flex-start",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
              color: "primary.main",
              boxShadow: `0 2px 8px -2px ${alpha(BRAND, 0.2)}`,
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, pt: 0.25, textAlign: "start" }}>
            <Typography
              component="h2"
              fontWeight={800}
              color="primary.main"
              sx={{ fontSize: "1.2rem", letterSpacing: "-0.02em", lineHeight: 1.3, textAlign: "start" }}
            >
              {customer ? "تعديل معلومات الطلب" : "إضافة معلومات الطلب"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.82rem", mt: 0.75, lineHeight: 1.5, textAlign: "start" }}
            >
              الحالة، المسؤول، الشحن، والمبالغ — حدد القيم ثم احفظ.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent
        sx={{
          pt: 2.5,
          px: 2.5,
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            p: 2.25,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: (t) => alpha(t.palette.divider, 0.9),
            bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : alpha(BRAND, 0.02)),
          }}
        >
          <Stack spacing={2.15}>
            <FormControl fullWidth sx={formControlAddOrder}>
              <InputLabel id="add-order-status">حالة الطلب</InputLabel>
              <Select
                labelId="add-order-status"
                id="orderStatus-select"
                value={orderStatus ?? ""}
                label="حالة الطلب"
                onChange={(e) => setOrderStatus(e.target.value)}
                sx={{ minHeight: 48, borderRadius: 1.5 }}
              >
                {statusoptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: "0.875rem" }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={formControlAddOrder}>
              <InputLabel id="add-order-pay">حالة الدفع</InputLabel>
              <Select
                labelId="add-order-pay"
                id="PAYMENT_STATUS-select"
                value={paymentStatus ?? ""}
                label="حالة الدفع"
                onChange={(e) => setPaymentStatus(e.target.value)}
                sx={{ minHeight: 48, borderRadius: 1.5 }}
              >
                {PAYMENT_STATUS.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: "0.875rem" }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ width: "100%" }}>
              <Autocomplete
                id="administratorAddOrder-autocomplete"
                fullWidth
                options={newUsers}
                disabled={!newUsers.length}
                value={getUserSelectValue(newUsers, administrator)}
                onChange={(_, v) => setAdministrator(v != null ? v.value : "")}
                renderOption={(props, option) => (
                  <li {...props} key={String(option.value)} style={{ fontSize: "0.875rem" }}>
                    {option.label}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="المسؤول"
                    InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                    placeholder={getUserSelectValue(newUsers, administrator) ? "" : "ابحث عن مسؤول…"}
                    inputProps={{ ...params.inputProps, autoComplete: "off" }}
                  />
                )}
                {...getUserSelectAutocompleteConfig(48)}
              />
            </Box>
            <TextField
              fullWidth
              label="جدية شراء"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              type="number"
              size="small"
              sx={addOrderTextFieldSx}
            />
            <TextField
              fullWidth
              label="تكلفة الشحن"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              type="number"
              size="small"
              sx={addOrderTextFieldSx}
            />
            <TextField
              fullWidth
              label="المبلغ المطلوب تحصيله"
              value={toBeCollected}
              onChange={(e) => setToBeCollected(e.target.value)}
              type="number"
              size="small"
              sx={addOrderTextFieldSx}
            />
            <TextField
              fullWidth
              label="العمولة"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              type="number"
              size="small"
              sx={addOrderTextFieldSx}
            />
            <TextField
              fullWidth
              label="تاريخ أمر التصنيع"
              value={manufacturingDate}
              onChange={(e) => setManufacturingDate(e.target.value)}
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ inputProps: { max: formattedDate } }}
              sx={addOrderTextFieldSx}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 2.25,
          gap: 1.25,
          borderTop: "1px solid",
          borderColor: "divider",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "flex-end",
          bgcolor: (t) => (t.palette.mode === "dark" ? alpha(BRAND, 0.08) : alpha(BRAND, 0.03)),
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          fullWidth
          sx={(t) => ({
            minHeight: 48,
            maxWidth: { sm: 160 },
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            borderColor: alpha(BRAND, 0.28),
            color: t.palette.text.primary,
            bgcolor: t.palette.mode === "dark" ? "action.hover" : t.palette.background.paper,
            "&:hover": {
              borderColor: alpha(BRAND, 0.45),
              bgcolor: alpha(BRAND, 0.04),
            },
          })}
        >
          إلغاء
        </Button>
        <Button
          onClick={() => {
            onConfirm({
              orderStatus,
              commission,
              manufacturingDate,
              paymentStatus,
              downPayment,
              shippingCost,
              toBeCollected,
              administrator,
            });
          }}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disableElevation
          sx={(t) => ({
            minHeight: 48,
            maxWidth: { sm: 200 },
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: `0 8px 20px -4px ${alpha(t.palette.primary.main, 0.4)}`,
            "&:hover": { boxShadow: `0 10px 24px -4px ${alpha(t.palette.primary.main, 0.5)}` },
          })}
        >
          {customer ? "حفظ التغييرات" : "إضافة المعلومات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrderDetails;
