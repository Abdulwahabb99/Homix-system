import * as React from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";

const columns = [
  {
    field: "name",
    headerName: "المنتجات",
    flex: 1.5,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          component="img"
          src={params.row.productImage}
          alt={params.row.productName}
          sx={{ width: 40, height: 40, borderRadius: "10%", objectFit: "cover" }}
        />{" "}
        <Box gap={0}>
          <Typography
            sx={{ fontSize: "14px", fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px" }}
            color="#00314C"
          >
            {params.row.productName}
          </Typography>
          <Typography
            sx={{ fontSize: "12px", fontWeight: 400, lineHeight: "140%", letterSpacing: "0.14px" }}
            color="#1A73E8"
          >
            sku:{params.row.sku}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: "sellPrice",
    headerName: "سعر البيع",
    flex: 0.7,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography
          sx={{ fontSize: "14px", fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px" }}
          color="#45464E"
        >
          EGP {Number(params.row.revenue).toFixed(0)}
        </Typography>
      </Box>
    ),
  },
  {
    field: "costPrice",
    headerName: "سعر التكلفة",
    flex: 0.7,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography
          sx={{ fontSize: "14px", fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px" }}
          color="#45464E"
        >
          EGP {Number(params.row.profit).toFixed(0)}
        </Typography>
      </Box>
    ),
  },
];

const TopSellingProductsTable = ({ rowData }) => {
  const newRowData = rowData?.map((row) => ({
    ...row,
    id: row.productId,
  }));

  return (
    <Box
      px={1}
      py={2}
      border="1px solid #E0E0E0"
      borderRadius={2}
      sx={{
        backgroundColor: "inherit",
      }}
    >
      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "130%",
        }}
        color="#00314C"
        mb={2}
        mx={1}
      >
        أكثر {rowData.length} منتجات مبيعًا
      </Typography>

      <Box sx={{ width: "100%", overflowX: "auto", maxHeight: 400 }}>
        <Box sx={{ minWidth: 600 }}>
          <DataGrid
            rows={newRowData}
            columns={columns}
            disableRowSelectionOnClick
            hideFooter
            disableColumnMenu
            sx={{
              height: 350,
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#DDDFE2",
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: "140%",
                minHeight: "40px !important",
                maxHeight: "40px !important",
              },
              "& .MuiDataGrid-columnHeader": {
                minHeight: "40px !important",
                maxHeight: "40px !important",
              },
              fontFamily: "inherit",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

TopSellingProductsTable.propTypes = {
  rowData: PropTypes.array,
};

export default TopSellingProductsTable;
