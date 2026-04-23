import { Box, Grid, Skeleton, Stack } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import {
  DASHBOARD_TABLE_BODY_HEIGHT_PX,
  DASHBOARD_TILES_AND_TABLES_GRID_SX,
} from "./dashboardDataGridSx";

function StatsCardSkeleton() {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 108,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderInlineStart: (t) => `3px solid ${t.palette.divider}`,
        bgcolor: "background.paper",
        p: 2.25,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
      }}
    >
      <Skeleton
        variant="rounded"
        width={52}
        height={52}
        sx={{ borderRadius: 2.5, flexShrink: 0 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton width="45%" height={16} />
        <Skeleton width="80%" height={32} sx={{ mt: 1, borderRadius: 0.5 }} />
      </Box>
    </Box>
  );
}

function DashboardTableBlockSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Skeleton width="55%" height={22} />
        <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
      </Box>
      <Box
        sx={{
          p: 1.5,
          minHeight: DASHBOARD_TABLE_BODY_HEIGHT_PX,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={44}
            animation="wave"
            sx={{ mb: i < 5 ? 1.25 : 0, borderRadius: 0.5 }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function DashboardV2Skeleton({ isVendor = false }) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        pt: 2.5,
        pb: 5,
        maxWidth: 1680,
        mx: "auto",
        width: "100%",
        minHeight: "60vh",
      }}
    >
      <Stack spacing={0.5} mb={3}>
        <Skeleton variant="text" width={200} height={40} sx={{ borderRadius: 0.5 }} />
        <Skeleton variant="text" height={20} sx={{ width: { xs: "100%", sm: 420 } }} />
      </Stack>

      <Box
        mb={3}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 20px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Grid container spacing={1.5} alignItems="center" columnSpacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <Skeleton variant="rounded" height={40} sx={{ width: "100%", borderRadius: 1.5 }} />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Skeleton variant="rounded" height={40} sx={{ width: "100%", borderRadius: 1.5 }} />
          </Grid>
        </Grid>
      </Box>

      <Grid
        container
        spacing={2}
        mb={3}
        alignItems="flex-start"
        sx={DASHBOARD_TILES_AND_TABLES_GRID_SX}
      >
        <Grid item xs={12} sm={6} md={4}>
          <StatsCardSkeleton />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCardSkeleton />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCardSkeleton />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch" sx={DASHBOARD_TILES_AND_TABLES_GRID_SX}>
        <Grid item xs={12} lg={isVendor ? 12 : 6}>
          <DashboardTableBlockSkeleton />
        </Grid>
        {!isVendor && (
          <Grid item xs={12} lg={6}>
            <DashboardTableBlockSkeleton />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

DashboardV2Skeleton.propTypes = {
  isVendor: PropTypes.bool,
};
