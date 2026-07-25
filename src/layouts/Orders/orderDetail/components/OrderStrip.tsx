/**
 * الشريط العلوي لصفحة التفاصيل: رقم الطلب + المعرّف + شارات الحالة/الدفع + التاريخ.
 */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { OD } from "../odTheme";
import { formatOrderDetailDate } from "../orderDetailNormalize";
import { getOrderDetailPaymentLabel } from "../orderDetailPayment";
import { OrderStatusChip } from "../../components/OrderStatusChips";

export default function OrderStrip({ orderDetails }: { orderDetails: any }) {
  const isPaid = Number(orderDetails?.paymentStatus) === 2;
  return (
    <Box
      sx={(theme) => ({
        bgcolor: OD.sur,
        borderBottom: `0.5px solid ${OD.brd}`,
        py: 1.5,
        px: 3,
        mx: -3,
        width: `calc(100% + ${theme.spacing(6)})`,
        maxWidth: "none",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      })}
    >
      <Box>
        <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, mb: 0.25 }}>رقم الطلب</Typography>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: OD.tx }}>
          #
          <Box component="span" sx={{ color: OD.accent }}>
            {(orderDetails?.name || orderDetails?.orderNumber || orderDetails?.code || "—").replace(/^#/, "")}
          </Box>
        </Typography>
      </Box>
      <Stack spacing={0.5}>
        <Box
          sx={{
            fontSize: "0.69rem",
            color: OD.tx3,
            bgcolor: OD.sur2,
            border: `0.5px solid ${OD.brd}`,
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
            fontWeight: 500,
            width: "fit-content",
          }}
        >
          ID: {orderDetails.id}
        </Box>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {orderDetails?.status != null && <OrderStatusChip status={orderDetails.status} size="small" />}
          {orderDetails?.paymentStatus != null ? (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: isPaid ? OD.green : OD.amber,
                }}
              />
              <Typography
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.25,
                  py: 0.5,
                  borderRadius: "20px",
                  fontSize: "0.69rem",
                  fontWeight: 700,
                  bgcolor: isPaid ? OD.gl : OD.aml,
                  color: isPaid ? "#065f46" : "#92400e",
                }}
              >
                {getOrderDetailPaymentLabel(orderDetails.paymentStatus) || "—"}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        useFlexGap
        sx={{ ml: "auto", flexShrink: 0, flexWrap: "wrap", rowGap: 1, columnGap: 1.25 }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: "0.72rem",
            color: OD.tx3,
            whiteSpace: "nowrap",
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          📅 {formatOrderDetailDate(orderDetails.createdAt ?? orderDetails.orderDate)}
        </Typography>
      </Stack>
    </Box>
  );
}
