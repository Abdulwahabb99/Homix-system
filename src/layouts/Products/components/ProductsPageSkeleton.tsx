import { Box, Grid, Skeleton, Stack } from "@mui/material";
import React from "react";

const PLACEHOLDER_COUNT = 12;

function ProductCardSkeleton() {
  return (
    <Box
      sx={{
        height: "100%",
        maxHeight: 420,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ width: "100%", flexShrink: 0, pt: 1.25, px: 1.25 }}>
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2, width: "100%" }} />
      </Box>
      <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column", gap: 0.75, pt: 1.5 }}>
        <Skeleton variant="text" width="92%" height={18} />
        <Skeleton variant="text" width="64%" height={18} />
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline", pt: 0.25 }}>
          <Skeleton width={48} height={24} />
          <Skeleton width={20} height={16} />
        </Box>
        <Skeleton width="55%" height={16} />
        <Skeleton
          variant="rounded"
          width={72}
          height={22}
          sx={{ borderRadius: 1.5, alignSelf: "flex-start" }}
        />
      </Box>
    </Box>
  );
}

export default function ProductsPageSkeleton() {
  return (
    <>
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
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
          <Skeleton
            variant="rounded"
            height={40}
            sx={{ flex: 1, minWidth: 0, borderRadius: 1.5 }}
          />
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <ProductCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
