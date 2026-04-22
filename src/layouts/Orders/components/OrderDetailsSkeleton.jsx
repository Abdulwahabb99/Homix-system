import { Box, Card, Grid, Skeleton, Stack } from "@mui/material";
import React from "react";

/**
 * هيكل تحميل صفحة تفاصيل الطلب (Homix) — بمحاذاة أقسام الصفحة
 */
function SectionLine() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, mt: 0 }}>
      <Skeleton variant="rounded" width={3} height={24} />
      <Skeleton width={140} height={22} />
      <Skeleton variant="rounded" width={32} height={24} />
    </Box>
  );
}

export default function OrderDetailsSkeleton() {
  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          gap={1.5}
        >
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Skeleton width={90} height={16} sx={{ mb: 0.5 }} />
            <Skeleton width={{ xs: "85%", sm: 320 }} height={32} />
            <Skeleton width={160} height={16} sx={{ mt: 0.5 }} />
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={120} height={36} />
            <Skeleton variant="rounded" width={100} height={36} />
          </Stack>
        </Stack>
      </Card>

      <Box sx={{ mb: 0.5 }}>
        <SectionLine />
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
            }}
          >
            <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
              <Skeleton width="45%" height={22} />
              <Skeleton width="70%" height={14} sx={{ mt: 0.5 }} />
            </Box>
            <Box sx={{ p: 2 }}>
              <Skeleton width="100%" height={18} />
              <Skeleton width="95%" height={18} sx={{ mt: 1.25 }} />
              <Skeleton width="80%" height={18} sx={{ mt: 1.25 }} />
            </Box>
          </Card>
        </Grid>
        {[0, 1].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
              }}
            >
              <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                <Skeleton width="45%" height={22} />
                <Skeleton width="70%" height={14} sx={{ mt: 0.5 }} />
              </Box>
              <Box sx={{ p: 2 }}>
                <Skeleton width="100%" height={18} />
                <Skeleton width="95%" height={18} sx={{ mt: 1.25 }} />
                <Skeleton width="80%" height={18} sx={{ mt: 1.25 }} />
              </Box>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <SectionLine />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton width="100%" height={200} variant="rectangular" sx={{ borderRadius: 0 }} />
            <Box sx={{ p: 2 }}>
              <Skeleton width="90%" height={20} />
              <Skeleton width="50%" height={16} sx={{ mt: 1 }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ pt: 1 }}>
            <SectionLine />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton variant="rounded" height={88} />
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, mb: 2 }}>
        <SectionLine />
      </Box>
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
            <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
              <Skeleton width={140} height={18} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
            <Stack direction="row" gap={1}>
              <Skeleton variant="rounded" width={36} height={36} />
              <Skeleton variant="rounded" width={36} height={36} />
            </Stack>
          </Stack>
          <Skeleton width="100%" height={40} sx={{ mt: 2 }} />
        </Card>
      </Stack>
    </Box>
  );
}
