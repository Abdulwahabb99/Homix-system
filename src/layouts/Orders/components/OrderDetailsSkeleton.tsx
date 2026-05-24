import { Box, Skeleton, Stack } from "@mui/material";
import { OD } from "../orderDetail/odTheme";

function CardHeaderBar() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.6,
        borderBottom: `0.5px solid ${OD.brd}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Skeleton variant="rounded" width={18} height={18} />
        <Skeleton width={110} height={18} />
      </Stack>
      <Skeleton variant="rounded" width={56} height={22} />
    </Box>
  );
}

/**
 * هيكل تحميل يطابق صفحة تفاصيل الطلب: شريط علوي، شبكة عمودين (منتج + حالة + ملاحظات | عميل + مالية + إجراءات).
 */
export default function OrderDetailsSkeleton() {
  return (
    <Box sx={{ width: "100%", bgcolor: OD.bg, minHeight: "50vh" }}>
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
        <Box sx={{ minWidth: 100 }}>
          <Skeleton width={56} height={14} sx={{ mb: 0.5 }} />
          <Skeleton width={140} height={32} />
        </Box>
        <Stack spacing={0.75}>
          <Skeleton variant="rounded" width={100} height={26} sx={{ borderRadius: "20px" }} />
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Skeleton variant="rounded" width={76} height={24} />
            <Skeleton variant="rounded" width={88} height={24} />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          useFlexGap
          sx={{ ml: "auto", flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}
        >
          <Skeleton width={120} height={18} />
        </Stack>
      </Box>

      <Box sx={{ py: 2.25, width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
            gap: 1.75,
            alignItems: "start",
          }}
        >
          <Stack spacing={1.5}>
            <Box
              sx={{
                bgcolor: OD.sur,
                borderRadius: `${OD.radius}px`,
                border: `0.5px solid ${OD.brd}`,
                overflow: "hidden",
              }}
            >
              <CardHeaderBar />
              <Box sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
                  <Skeleton variant="rounded" width={120} height={110} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="92%" height={22} sx={{ mb: 1 }} />
                    <Skeleton width={100} height={26} sx={{ mb: 1.25 }} />
                    <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Skeleton variant="rounded" width={72} height={22} />
                      <Skeleton variant="rounded" width={80} height={22} />
                    </Stack>
                    <Skeleton width="60%" height={14} />
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: OD.sur,
                borderRadius: `${OD.radius}px`,
                border: `0.5px solid ${OD.brd}`,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1.6,
                  borderBottom: `0.5px solid ${OD.brd}`,
                }}
              >
                <Skeleton variant="rounded" width={18} height={18} sx={{ ml: 1 }} />
                <Skeleton width={90} height={18} />
              </Box>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.75,
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <Box key={i}>
                      <Skeleton width={64} height={12} sx={{ mb: 0.75 }} />
                      <Skeleton variant="rounded" width="100%" height={34} sx={{ borderRadius: "9px" }} />
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Skeleton width={140} height={14} sx={{ mb: 0.75 }} />
                  <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "9px" }} />
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: OD.sur,
                borderRadius: `${OD.radius}px`,
                border: `0.5px solid ${OD.brd}`,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.6,
                  borderBottom: `0.5px solid ${OD.brd}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Skeleton variant="rounded" width={18} height={18} />
                  <Skeleton width={130} height={18} />
                </Stack>
                <Skeleton width={48} height={14} />
              </Box>
              <Box sx={{ px: 2, py: 2 }}>
                <Stack spacing={1.25}>
                  <Skeleton variant="rounded" height={72} sx={{ borderRadius: "10px" }} />
                  <Skeleton variant="rounded" height={72} sx={{ borderRadius: "10px" }} />
                </Stack>
              </Box>
              <Box
                sx={{
                  borderTop: `0.5px solid ${OD.brd}`,
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "9px" }} />
                <Skeleton variant="rounded" height={36} sx={{ flex: 1, minWidth: 120, borderRadius: "9px" }} />
                <Skeleton variant="rounded" width={72} height={36} sx={{ borderRadius: "9px" }} />
              </Box>
            </Box>
          </Stack>

          <Stack spacing={1.5}>
            <Box
              sx={{
                bgcolor: OD.sur,
                borderRadius: `${OD.radius}px`,
                border: `0.5px solid ${OD.brd}`,
                overflow: "hidden",
              }}
            >
              <CardHeaderBar />
              <Box sx={{ px: 2, py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.75 }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="70%" height={20} />
                    <Skeleton width={90} height={14} sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
                {[0, 1, 2].map((i) => (
                  <Stack
                    key={i}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ py: 1.125, borderBottom: i < 2 ? `0.5px solid ${OD.brd}` : "none" }}
                  >
                    <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: "8px" }} />
                    <Skeleton width={48} height={12} />
                    <Skeleton height={14} sx={{ flex: 1 }} />
                  </Stack>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: OD.sur,
                borderRadius: `${OD.radius}px`,
                border: `0.5px solid ${OD.brd}`,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1.6,
                  borderBottom: `0.5px solid ${OD.brd}`,
                }}
              >
                <Skeleton variant="rounded" width={18} height={18} sx={{ ml: 1 }} />
                <Skeleton width={100} height={18} />
              </Box>
              <Box sx={{ p: 0 }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                      borderBottom: `0.5px solid ${OD.brd}`,
                    }}
                  >
                    <Skeleton width={110} height={16} />
                    <Skeleton width={72} height={16} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: OD.sur,
                borderRadius: `${OD.radius}px`,
                border: `0.5px solid ${OD.brd}`,
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 2, py: 1.6, borderBottom: `0.5px solid ${OD.brd}` }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Skeleton variant="rounded" width={18} height={18} />
                  <Skeleton width={100} height={18} />
                </Stack>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "10px" }} />
                  ))}
                </Box>
              </Box>
            </Box>

          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
