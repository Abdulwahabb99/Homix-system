import React from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PropTypes from "prop-types";
import { orderStatusValues } from "layouts/Orders/utils/constants";
import { paymentStatusValues } from "layouts/Orders/utils/constants";
import { getUserType } from "shared/utils/constants";
import { addOrderPageCardSx } from "./addOrderFormStyles";

function OrderInfoRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      gap={1}
      sx={{
        py: 1.1,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: 0, pb: 0 },
        "&:first-of-type": { pt: 0 },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.77rem", fontWeight: 600, minWidth: 0 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        textAlign="end"
        sx={{ fontSize: "0.875rem", fontWeight: 600, maxWidth: "58%", wordBreak: "break-word" }}
      >
        {value == null || value === "" ? "—" : String(value)}
      </Typography>
    </Stack>
  );
}

OrderInfoRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function ProductPayment({ customer, openAddModal, vendorName }) {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        ...addOrderPageCardSx,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.info.main, 0.06),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
            <Box
              sx={{
                width: 3,
                minHeight: 20,
                borderRadius: 0.5,
                bgcolor: "primary.main",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="subtitle1"
              fontWeight={800}
              color="text.primary"
              component="h2"
              sx={{ fontSize: "1.03rem" }}
            >
              معلومات الطلب
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.77rem" }}>
            الحالة، المسؤول، والشحن
          </Typography>
        </Box>
        <Button
          onClick={openAddModal}
          color="primary"
          variant="contained"
          size="small"
          startIcon={customer ? null : <AddCircleOutlineIcon fontSize="small" />}
          sx={{ fontWeight: 700, boxShadow: "none", minWidth: 100 }}
        >
          {customer ? "تعديل" : "إضافة"}
        </Button>
      </Box>
      <CardContent sx={{ p: 2, flex: 1, "&:last-child": { pb: 2 } }}>
        {customer ? (
          <Box>
            <OrderInfoRow label="حالة الطلب" value={orderStatusValues[customer?.orderStatus]} />
            {vendorName != null && vendorName !== "" && (
              <OrderInfoRow label="البائع" value={vendorName} />
            )}
            <OrderInfoRow label="المسؤول" value={getUserType(customer?.administrator)} />
            <OrderInfoRow
              label="طريقة الدفع"
              value={paymentStatusValues[customer?.paymentStatus]}
            />
            <OrderInfoRow label="جدية الشراء" value={customer?.downPayment} />
            <OrderInfoRow label="تكلفة الشحن" value={customer?.shippingCost} />
            <OrderInfoRow label="المبلغ المطلوب تحصيله" value={customer?.toBeCollected} />
            <OrderInfoRow label="العمولة" value={customer?.commission} />
            <OrderInfoRow
              label="تاريخ الدفع"
              value={
                customer?.manufacturingDate === "NaN-NaN-NaN" || !customer?.manufacturingDate
                  ? "—"
                  : customer?.manufacturingDate
              }
            />
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 2.5,
              px: 1,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: "0.86rem" }}
            >
              لم تُضف معلومات الطلب بعد
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
              اضغط «إضافة» لتحديد المسؤول، الشحن، والدفع
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

ProductPayment.propTypes = {
  openAddModal: PropTypes.func.isRequired,
  customer: PropTypes.object,
  vendorName: PropTypes.string,
};

export default ProductPayment;
