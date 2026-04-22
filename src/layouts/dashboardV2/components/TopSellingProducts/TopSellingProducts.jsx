import * as React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import { DASHBOARD_TABLE_BODY_HEIGHT_PX, getDashboardDataGridSx } from "../dashboardDataGridSx";

const getColumns = (theme) => {
  const primary = theme.palette.primary.main;
  const info = theme.palette.info.main;
  const text = theme.palette.text.primary;

  return [
    {
      field: "name",
      headerName: "المنتجات",
      flex: 1.2,
      minWidth: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1.25} width="1%" minWidth={0} py={0.25}>
          <Box
            component="img"
            src={params.row.productImage}
            alt={params.row.productName}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              objectFit: "cover",
              flexShrink: 0,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
          <Box minWidth={0}>
            <Typography
              noWrap
              title={params.row.productName}
              sx={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.3 }}
              color={primary}
            >
              {params.row.productName}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 400, opacity: 0.9 }} color={info}>
              sku: {params.row.sku}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "sellPrice",
      headerName: "سعر البيع",
      flex: 0.5,
      minWidth: 108,
      maxWidth: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }} color={text}>
          EGP {Number(params.row.revenue).toFixed(0)}
        </Typography>
      ),
    },
    {
      field: "costPrice",
      headerName: "التكلفة",
      flex: 0.5,
      minWidth: 108,
      maxWidth: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }} color={text}>
          EGP {Number(params.row.profit).toFixed(0)}
        </Typography>
      ),
    },
  ];
};

const TopSellingProductsTable = ({ rowData }) => {
  const theme = useTheme();
  const columns = getColumns(theme);
  const newRowData = rowData?.map((row) => ({
    ...row,
    id: row.productId,
  }));

  if (!rowData?.length) return null;

  return (
    <Box
      sx={{
        p: 0,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
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
          background: (t) =>
            t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(6, 49, 70, 0.04)",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="primary" fontSize="0.9375rem">
          أكثر {rowData.length} منتجات مبيعًا
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
          حسب نطاق التاريخ المحدد
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          minHeight: DASHBOARD_TABLE_BODY_HEIGHT_PX,
          flex: 1,
          overflowX: "auto",
        }}
      >
        <DataGrid
          rows={newRowData}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter
          disableColumnMenu
          rowHeight={52}
          sx={{
            height: DASHBOARD_TABLE_BODY_HEIGHT_PX,
            width: "100%",
            ...getDashboardDataGridSx(theme),
          }}
        />
      </Box>
    </Box>
  );
};

TopSellingProductsTable.propTypes = {
  rowData: PropTypes.array,
};

export default TopSellingProductsTable;
