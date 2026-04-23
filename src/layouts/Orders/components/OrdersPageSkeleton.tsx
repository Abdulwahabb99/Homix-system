import { Box, Skeleton, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import React from "react";
import { getHomixDataGridHeaderBackground } from "shared/theme/homixDataGridSx";

/** يطابق HomixDataTable في صفحة الطلبات (height) */
const ORDERS_TABLE_SKELETON_HEIGHT_PX = 560;
const SKELETON_ROWS = 9;
const TABLE_HEADER_PX = 40;

/**
 * هيكل الجدول فقط (نفس ارتفاع HomixDataTable) — لتحميل البيانات من السيرفر بدل spinner الـ DataGrid
 */
export function OrdersTableSkeleton() {
  const theme = useTheme();
  const headerBackground = getHomixDataGridHeaderBackground(theme);

  return (
    <Box
      aria-busy={true}
      aria-label="جاري تحميل الطلبات"
      sx={{
        width: "100%",
        minWidth: 0,
        height: ORDERS_TABLE_SKELETON_HEIGHT_PX,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 2px 12px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          gap: 0.5,
          px: 1.5,
          height: TABLE_HEADER_PX,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: headerBackground,
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={20}
            animation="wave"
            sx={{ flex: i === 0 ? 0.6 : 1, minWidth: 48, borderRadius: 0.5 }}
          />
        ))}
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              height: 52,
              flexShrink: 0,
              borderBottom: "1px solid",
              borderColor: "divider",
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            {Array.from({ length: 7 }).map((__, j) => (
              <Skeleton
                key={j}
                variant="rounded"
                height={18}
                animation="wave"
                sx={{ flex: j === 0 ? 0.6 : 1, minWidth: 40, borderRadius: 0.5 }}
              />
            ))}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexShrink: 0,
          gap: 1,
          px: 1.5,
          height: 52,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Skeleton width={120} height={32} variant="rounded" sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}

/**
 * تخطيط تقريبي لصفحة الطلبات بالكامل (للاستخدام اختياري: عنوان، فلاتر، جدول)
 */
function OrdersPageSkeleton({ isVendor = false }) {
  return (
    <>
      <Stack
        spacing={0.5}
        mb={2.5}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Box>
          <Skeleton variant="text" width={120} height={32} sx={{ borderRadius: 0.5 }} />
          <Skeleton
            variant="text"
            height={18}
            sx={{ borderRadius: 0.5, mt: 0.25, width: { xs: "100%", sm: 280 } }}
          />
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Skeleton variant="text" width={88} height={32} />
          {!isVendor && (
            <>
              <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: 1.5 }} />
              <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: 1.5 }} />
            </>
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%", mb: 2 }}>
          <Skeleton
            variant="rounded"
            height={40}
            sx={{ flex: 1, minWidth: 0, borderRadius: 1.5 }}
          />
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
        </Stack>
        <Skeleton
          variant="rounded"
          height={40}
          sx={{ width: "100%", borderRadius: 1.5, maxWidth: { md: "100%" } }}
        />
      </Box>

      {!isVendor && (
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1 }} />
        </Stack>
      )}

      <OrdersTableSkeleton />
    </>
  );
}

OrdersPageSkeleton.propTypes = {
  isVendor: PropTypes.bool,
};

export default OrdersPageSkeleton;
