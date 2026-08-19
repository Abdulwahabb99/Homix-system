import React from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import Breadcrumbs from "examples/Breadcrumbs";
import { OD } from "./odTheme";
import { getOrderDetailPaymentLabel } from "./orderDetailPayment";

export type OrderDetailsLayoutHeaderProps = {
  orderDetails: any;
  routeOrderId: string | undefined;
  isVendor: boolean;
  invoicePdfLoading: boolean;
  onNavigateEdit: () => void;
  onDownloadInvoice: () => void;
};

export default function OrderDetailsLayoutHeader({
  orderDetails,
  routeOrderId,
  isVendor,
  invoicePdfLoading,
  onNavigateEdit,
  onDownloadInvoice,
}: OrderDetailsLayoutHeaderProps) {
  const crumbsId = String(orderDetails?.id ?? routeOrderId ?? "");
  const titleRaw =
    orderDetails?.name ||
    orderDetails?.code ||
    orderDetails?.orderNumber ||
    (routeOrderId ? `#${routeOrderId}` : "");
  const breadcrumbTitle = String(titleRaw).replace(/^#/, "");

  return (
    <HomixPageHeader
      breadcrumb={
        <Breadcrumbs icon="home" route={["orders", crumbsId]} title={breadcrumbTitle || "الطلب"} />
      }
      actions={
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {!isVendor && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon sx={{ fontSize: 15 }} />}
              onClick={onNavigateEdit}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.78rem",
                height: 34,
                px: 2,
                borderRadius: "9px",
                color: OD.tx2,
                border: `0.5px solid ${OD.brd}`,
                bgcolor: OD.sur2,
                "&:hover": { borderColor: OD.accent, color: OD.accent, bgcolor: OD.sur },
              }}
            >
              تعديل
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={onDownloadInvoice}
            disabled={invoicePdfLoading}
            aria-label="الفاتورة"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.78rem",
              height: 34,
              minWidth: { xs: 34, sm: "auto" },
              px: { xs: 0, sm: 2 },
              gap: { sm: 0.75 },
              borderRadius: "9px",
              color: "#92400e",
              border: "0.5px solid rgba(245,158,11,0.2)",
              bgcolor: OD.aml,
              "&:hover": { bgcolor: OD.amber, color: "#fff", borderColor: OD.amber },
            }}
          >
            {/* على الموبايل النص مخفي، فبدون مؤشّر داخل الأيقونة يبدو الزر كأنه
                لم يفعل شيئاً خلال ثواني توليد الـ PDF. */}
            {invoicePdfLoading ? (
              <CircularProgress size={15} sx={{ color: "#92400e" }} />
            ) : (
              <PictureAsPdf sx={{ fontSize: 15 }} />
            )}
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              {invoicePdfLoading ? "جارٍ التحميل…" : "الفاتورة"}
            </Box>
          </Button>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              height: 34,
              px: 2,
              borderRadius: "9px",
              bgcolor: OD.accent,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <AttachMoneyOutlinedIcon sx={{ fontSize: 17 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
              {getOrderDetailPaymentLabel(orderDetails?.paymentStatus) || "—"}
            </Typography>
          </Stack>
        </Stack>
      }
    />
  );
}
