/**
 * Shared MUI DataGrid styles for dashboard reports (matches Homix global theme).
 * Avoid hacks on virtualScroller — they break layout in @mui/x-data-grid v5.
 */

/** ارتفاع موحّد لمنطقة الجدول (مع تمرير عند كثرة الصفوف) حتى جدولي الصفحة الرئيسية يبقوا متساويين */
export const DASHBOARD_TABLE_BODY_HEIGHT_PX = 400;

/** صف الـ stats cards والجداول: نفس العرض والمحاذاة (موبايل + ديسكتوب) */
export const DASHBOARD_TILES_AND_TABLES_GRID_SX = {
  maxWidth: 1100,
  width: "100%",
  mx: "auto",
};

export function getDashboardDataGridSx(theme) {
  const headerBg =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(6, 49, 70, 0.06)";
  const border = theme.palette.divider;

  return {
    width: "100%",
    minWidth: 0,
    border: "none",
    fontFamily: theme.typography.fontFamily,
    "& .MuiDataGrid-root": {
      border: "none",
    },
    "& .MuiDataGrid-main": {
      borderRadius: 0,
    },
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
    "& .MuiDataGrid-row": {
      minHeight: "52px !important",
    },
    "& .MuiDataGrid-cell": {
      borderColor: border,
      fontSize: "0.8125rem",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": { outline: "none" },
    "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
      outline: "none",
    },
  };
}
