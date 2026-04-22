import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { getHomixDataGridSx, HOMIX_TABLE_DEFAULT_HEIGHT_PX } from "shared/theme/homixDataGridSx";

/**
 * MUI X DataGrid with Homix theming, optional server-side pagination.
 * Use paginationMode="server" with rowCount + onPageChange for server-driven lists.
 */
function HomixDataTable({
  rows,
  columns,
  getRowId,
  loading = false,
  height = HOMIX_TABLE_DEFAULT_HEIGHT_PX,
  page,
  pageSize,
  onPageChange,
  rowCount,
  paginationMode = "client",
  disablePagination = false,
  checkboxSelection = false,
  selectionModel = [],
  onSelectionModelChange,
  hideFooter = false,
  rowHeight = 52,
  columnHeaderHeight = 40,
  sx: sxProp,
  ...dataGridRest
}) {
  const theme = useTheme();
  const serverMode = paginationMode === "server";

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 2px 12px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        "& .MuiDataGrid-virtualScroller": { minHeight: 0 },
        ...getHomixDataGridSx(theme),
        height,
        ...sxProp,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        rowHeight={rowHeight}
        columnHeaderHeight={columnHeaderHeight}
        disableColumnMenu
        disableRowSelectionOnClick
        checkboxSelection={checkboxSelection}
        selectionModel={checkboxSelection ? selectionModel : undefined}
        onSelectionModelChange={checkboxSelection ? onSelectionModelChange : undefined}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        rowCount={serverMode ? rowCount : undefined}
        rowsPerPageOptions={serverMode && pageSize ? [pageSize] : [10, 25, 50, 100]}
        pagination={!disablePagination}
        paginationMode={serverMode ? "server" : "client"}
        hideFooter={hideFooter}
        sx={{ border: "none" }}
        {...dataGridRest}
      />
    </Box>
  );
}

HomixDataTable.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  getRowId: PropTypes.func,
  loading: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  rowCount: PropTypes.number,
  paginationMode: PropTypes.oneOf(["server", "client"]),
  disablePagination: PropTypes.bool,
  checkboxSelection: PropTypes.bool,
  selectionModel: PropTypes.array,
  onSelectionModelChange: PropTypes.func,
  hideFooter: PropTypes.bool,
  rowHeight: PropTypes.number,
  columnHeaderHeight: PropTypes.number,
  sx: PropTypes.object,
};

export default HomixDataTable;
