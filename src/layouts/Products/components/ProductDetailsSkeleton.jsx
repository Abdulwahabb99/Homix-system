import { Box, Card, CardContent, Divider, Grid, Skeleton, Stack } from "@mui/material";
import React from "react";
import { ProductDetailsImageFrameSkeleton } from "./ProductDetailsImageFrame";

export default function ProductDetailsSkeleton() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5} lg={4}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          <ProductDetailsImageFrameSkeleton />
        </Card>
      </Grid>

      <Grid item xs={12} md={7} lg={8}>
        <Stack spacing={2.5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Skeleton width={100} height={20} />
              <Skeleton width="85%" height={40} sx={{ mt: 1, mb: 1 }} />
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: (t) => (t.palette.mode === "dark" ? "action.selected" : "action.hover"),
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton width="60%" height={24} />
                    <Skeleton width="90%" height={16} sx={{ mt: 0.5 }} />
                  </Box>
                  <Skeleton variant="circular" width={32} height={32} />
                </Stack>
              </Box>
              <Stack spacing={1.5} sx={{ pt: 2.5 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "action.hover",
                  }}
                >
                  <Skeleton width="40%" height={20} sx={{ mb: 1.5 }} />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width={56} height={14} sx={{ mb: 0.5 }} />
                      <Skeleton width={88} height={32} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width={40} height={14} sx={{ mb: 0.5 }} />
                      <Skeleton width={72} height={32} />
                    </Box>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "action.hover",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width={56} height={14} sx={{ mb: 0.5 }} />
                      <Skeleton width={80} height={28} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width={40} height={14} sx={{ mb: 0.5 }} />
                      <Skeleton width={64} height={28} />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Skeleton width={40} height={16} sx={{ mb: 0.5 }} />
                  <Skeleton width="45%" height={24} />
                </Box>
                <Divider />
                <Box>
                  <Skeleton width={56} height={16} sx={{ mb: 1 }} />
                  <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                    <Skeleton variant="rounded" width={80} height={32} />
                    <Skeleton variant="rounded" width={100} height={32} />
                    <Skeleton variant="rounded" width={72} height={32} />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}
