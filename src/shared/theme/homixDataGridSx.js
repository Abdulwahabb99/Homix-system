/**
 * MUI X DataGrid styles aligned with Homix theme (primary / neutrals).
 * Use across dashboard and list pages. Avoid virtualScroller hacks in DataGrid v5.
 */

import { alpha } from "@mui/material/styles";

export const HOMIX_TABLE_DEFAULT_HEIGHT_PX = 520;

export const DASHBOARD_TABLE_BODY_HEIGHT_PX = 400;

/** صف الـ tiles والجداول في لوحة المعلومات: نفس عرض صف البحث/التاريخ (بدون تقييد 1100px) */
export const DASHBOARD_TILES_AND_TABLES_GRID_SX = {
  width: "100%",
  maxWidth: "100%",
  justifyContent: "flex-start",
};

/** خلفية الترويسة: أوضح من `rgba(…,0.06)` لتمييز رأس الجدول عن خلايا الجسم */
export function getHomixDataGridHeaderBackground(theme) {
  return theme.palette.mode === "dark"
    ? alpha(theme.palette.common.white, 0.1)
    : alpha(theme.palette.primary.main, 0.16);
}

export function getHomixDataGridSx(theme) {
  const headerBg = getHomixDataGridHeaderBackground(theme);
  const border = theme.palette.divider;

  return {
    width: "100%",
    minWidth: 0,
    border: "none",
    fontFamily: theme.typography.fontFamily,
    "& .MuiDataGrid-root": { border: "none" },
    "& .MuiDataGrid-main": { borderRadius: 0 },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: headerBg,
      borderBottom: `1px solid ${border}`,
      color: theme.palette.text.primary,
      fontSize: "0.75rem",
      fontWeight: 700,
      minHeight: "40px !important",
    },
    "& .MuiDataGrid-columnHeader": {
      minHeight: "40px !important",
      maxHeight: "40px !important",
    },
    "& .MuiDataGrid-row": { minHeight: "52px !important" },
    "& .MuiDataGrid-cell": {
      borderColor: border,
      fontSize: "0.8125rem",
    },
    "& .MuiDataGrid-row:hover": { backgroundColor: theme.palette.action.hover },
    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": { outline: "none" },
    "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
      outline: "none",
    },
  };
}

export const getDashboardDataGridSx = getHomixDataGridSx;
