/* eslint-disable react/prop-types */
import { Box, Card, CardContent, Stack, Typography, useTheme, alpha } from "@mui/material";
import { getDeliveryStatusValue, getStatusValue } from "shared/utils/constants";

const rowSx = (theme) => ({
  p: 1.25,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.info.main, 0.04),
  border: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.6),
});

function BasicsInfoCard({ orderDetails }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.info.main, 0.06),
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          component="h3"
          sx={{ fontSize: "1.03rem" }}
        >
          حالة الطلب والمتابعة
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.25, fontSize: "0.77rem" }}
        >
          التسليم، المسؤول، ومصدر الشحن
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flex: 1, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Box sx={rowSx(theme)}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontSize: "0.77rem" }}
            >
              حالة الطلب
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: "0.88rem" }}
            >
              {getStatusValue(orderDetails.status)}
            </Typography>
          </Box>
          <Box sx={rowSx(theme)}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontSize: "0.77rem" }}
            >
              حالة التصنيع
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: "0.88rem" }}
            >
              {getDeliveryStatusValue(orderDetails.deliveryStatus)}
            </Typography>
          </Box>
          <Box sx={rowSx(theme)}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontSize: "0.77rem" }}
            >
              المسؤول
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: "0.88rem" }}
            >
              {orderDetails.administrator ? orderDetails.administrator : "لا يوجد"}
            </Typography>
          </Box>
          <Box sx={rowSx(theme)}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontSize: "0.77rem" }}
            >
              مكان التسليم
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: "0.88rem" }}
            >
              {orderDetails.shippedFromInventory ? "مخازن هومكس" : "عنوان العميل"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default BasicsInfoCard;
