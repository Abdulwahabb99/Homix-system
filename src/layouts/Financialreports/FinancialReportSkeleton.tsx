/* eslint-disable react/prop-types */
// @ts-nocheck
import React from "react";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DASHBOARD_TILES_AND_TABLES_GRID_SX } from "shared/theme/homixDataGridSx";

const gridItem = { xs: 12, sm: 6, md: 4 };

function StatTileSkeleton() {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 108,
        p: 2.25,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2.5,
        borderInlineStart: "3px solid",
        borderInlineStartColor: (t) => alpha(t.palette.primary.main, 0.35),
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 1px 0 rgba(255,255,255,0.04) inset"
            : "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.05)",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="rounded" width={52} height={52} animation="wave" sx={{ borderRadius: 2.5, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="55%" height={14} animation="wave" sx={{ mb: 0.75, maxWidth: 140 }} />
          <Skeleton variant="text" width="80%" height={32} animation="wave" />
        </Box>
      </Stack>
    </Box>
  );
}

function SectionSkeleton({ titleWidth, children }) {
  return (
    <Box>
      <Skeleton variant="text" width={titleWidth} height={18} animation="wave" sx={{ mb: 1.5 }} />
      <Grid container spacing={2} alignItems="stretch" sx={DASHBOARD_TILES_AND_TABLES_GRID_SX}>
        {children}
      </Grid>
    </Box>
  );
}

/**
 * تخطيط قريب من ReportComponent: أقسام + بلاطات بنفس الـ grid
 */
export default function FinancialReportSkeleton({ isAdmin = true }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label="جاري تحميل التقرير"
      sx={{ pt: 0.5 }}
    >
      <Stack spacing={3}>
        <SectionSkeleton titleWidth={64}>
          {[0, 1, 2, 3].map((k) => (
            <Grid key={k} item {...gridItem}>
              <StatTileSkeleton />
            </Grid>
          ))}
        </SectionSkeleton>

        <SectionSkeleton titleWidth={isAdmin ? 120 : 100}>
          {isAdmin
            ? [0, 1, 2].map((k) => (
                <Grid key={k} item {...gridItem}>
                  <StatTileSkeleton />
                </Grid>
              ))
            : [0].map((k) => (
                <Grid key={k} item {...gridItem}>
                  <StatTileSkeleton />
                </Grid>
              ))}
        </SectionSkeleton>

        <SectionSkeleton titleWidth={56}>
          <Grid item {...gridItem}>
            <StatTileSkeleton />
          </Grid>
        </SectionSkeleton>

        <SectionSkeleton titleWidth={90}>
          {[0, 1].map((k) => (
            <Grid key={k} item {...gridItem}>
              <StatTileSkeleton />
            </Grid>
          ))}
        </SectionSkeleton>
      </Stack>
    </Box>
  );
}
