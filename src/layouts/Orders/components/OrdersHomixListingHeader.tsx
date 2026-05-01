import React from "react";
import { Button, CircularProgress, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import { HX } from "layouts/Orders/ordersHomixTheme";

interface OrdersHomixListingHeaderProps {
  isVendor: boolean;
  isExportLoading: boolean;
  onExport: () => void;
  onAddOrder: () => void;
}

export default function OrdersHomixListingHeader({
  isVendor,
  isExportLoading,
  onExport,
  onAddOrder,
}: OrdersHomixListingHeaderProps) {
  return (
    <HomixPageHeader
      title="الطلبات"
      subtitle="إدارة ومتابعة جميع الطلبات"
      actions={
        !isVendor ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              size="small"
              variant="text"
              onClick={onExport}
              disabled={isExportLoading}
              startIcon={
                isExportLoading ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <DownloadIcon sx={{ fontSize: "12px !important" }} />
                )
              }
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                bgcolor: HX.surface2,
                border: `0.5px solid ${HX.border}`,
                borderRadius: "8px",
                px: 1.5,
                height: 32,
                fontSize: "12px",
                fontWeight: 600,
                color: HX.tx2,
                "&:hover": { borderColor: HX.accent, color: HX.accent },
              }}
            >
              تصدير Excel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={onAddOrder}
              startIcon={<AddIcon sx={{ fontSize: "12px !important" }} />}
              sx={{
                bgcolor: HX.accent,
                color: "#fff",
                borderRadius: "8px",
                px: 1.75,
                height: 32,
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": { bgcolor: "#5254e0", boxShadow: "none" },
              }}
            >
              طلب جديد
            </Button>
          </Stack>
        ) : undefined
      }
    />
  );
}
