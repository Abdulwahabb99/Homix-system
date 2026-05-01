import React from "react";
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "22px",
        py: "10px",
        minHeight: 58,
        bgcolor: HX.surface,
        borderBottom: `1px solid ${HX.border2}`,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Title */}
      <Box>
        <Typography
          sx={{
            fontSize: "17px",
            fontWeight: 800,
            color: HX.tx,
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
          }}
        >
          الطلبات
        </Typography>
        <Typography
          sx={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: HX.tx2,
            lineHeight: 1.3,
            mt: "2px",
          }}
        >
          إدارة ومتابعة جميع الطلبات
        </Typography>
      </Box>

      {/* Actions */}
      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Export Excel */}
        {!isVendor && (
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
        )}

        {/* Notification */}
        <Box sx={{ position: "relative" }}>
          <IconButton
            size="small"
            sx={{
              width: 32,
              height: 32,
              border: `0.5px solid ${HX.border}`,
              borderRadius: "8px",
              bgcolor: HX.surface,
              color: HX.tx2,
              "& svg": { width: 14, height: 14 },
            }}
          >
            <NotificationsNoneIcon />
          </IconButton>
          {/* Notification dot */}
          <Box
            sx={{
              width: 6,
              height: 6,
              bgcolor: HX.red,
              borderRadius: "50%",
              position: "absolute",
              top: 5,
              right: 5,
              border: `1.5px solid ${HX.surface}`,
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* Add new order */}
        {!isVendor && (
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
        )}
      </Stack>
    </Box>
  );
}
