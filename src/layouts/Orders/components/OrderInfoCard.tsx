/* eslint-disable react/prop-types */
import { Box, Stack, Typography, useTheme, alpha } from "@mui/material";

function OrderInfoCard({ orderDetails, isShimpentDetails }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.userType === "2";
  const theme = useTheme();

  const rows = [
    { label: "سعر البيع", value: Number(orderDetails.subTotalPrice).toFixed(0) || "" },
    { label: "سعر التكلفة", value: Number(orderDetails.orderLines[0].cost).toFixed(0) || "" },
  ];
  if (!isVendor) {
    rows.push({ label: "تكلفة الشحن", value: orderDetails.shippingFees || 0 });
  }
  rows.push(
    { label: "الخصم", value: Number(orderDetails.totalDiscounts).toFixed(0) || "" },
    { label: "اجمالي البيع", value: Number(orderDetails.totalPrice).toFixed(0) || "" },
    { label: "جدية الشراء", value: orderDetails.downPayment || 0 },
    { label: "المبلغ المطلوب تحصيله", value: orderDetails.toBeCollected || 0 }
  );

  const row = (item, i) => (
    <Box
      key={`${item.label}-${i}`}
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 1.5,
        py: 0.9,
        borderBottom: "1px solid",
        borderColor: "divider",
        ...(i === rows.length - 1 && { borderBottom: "none", pb: 0 }),
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flex: "0 0 auto", fontSize: "0.77rem" }}
      >
        {item.label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ textAlign: "left", fontSize: "0.88rem" }}
      >
        {item.value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.success.main, 0.04),
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          component="h3"
          sx={{ fontSize: "1.03rem" }}
        >
          {isShimpentDetails ? "تفاصيل الشحنة" : "تفاصيل مالية للطلب"}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.25, fontSize: "0.77rem" }}
        >
          الأسعار، الخصم، وما يُستحق
        </Typography>
      </Box>
      <Stack spacing={0} sx={{ px: 2, py: 1.5, flex: 1 }}>
        {rows.map((item, i) => row(item, i))}
      </Stack>
    </Box>
  );
}

export default OrderInfoCard;
