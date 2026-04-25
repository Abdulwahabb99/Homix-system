import * as React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import PersonDoctorIcon from "shared/icons/PersonDoctorIcon";
import { DASHBOARD_TABLE_BODY_HEIGHT_PX, getDashboardDataGridSx } from "../dashboardDataGridSx";

const getColumns = (theme) => {
  const primary = theme.palette.primary.main;
  const info = theme.palette.info.main;
  const text = theme.palette.text.primary;

  return [
    {
      field: "name",
      headerName: "الموردين",
      flex: 1.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1.25} width="1%" minWidth={0} py={0.25}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              bgcolor: "rgba(99, 102, 241, 0.08)",
              color: "primary.main",
            }}
          >
            <PersonDoctorIcon />
          </Box>
          <Box minWidth={0}>
            <Typography
              noWrap
              title={params.row.vendorName}
              sx={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.3 }}
              color={primary}
            >
              {params.row.vendorName}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 400, mt: 0.1 }} color={info}>
              {params.row.sku}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "sellPrice",
      headerName: "إجمالي المبيعات",
      flex: 0.5,
      minWidth: 125,
      maxWidth: 180,
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
      headerName: "إجمالي التكلفة",
      flex: 0.5,
      minWidth: 125,
      maxWidth: 180,
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

const MostVendorsSelling = ({ rowData }) => {
  const theme = useTheme();
  const columns = getColumns(theme);
  const newRowData = rowData?.map((row) => ({
    ...row,
    id: row.vendorId,
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
            t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(99, 102, 241, 0.04)",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="primary" fontSize="0.9375rem">
          أكثر {rowData.length} موردين مبيعاً
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
          إجماليات لكل مورد
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
          disableSelectionOnClick
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

MostVendorsSelling.propTypes = {
  rowData: PropTypes.array,
};

export default MostVendorsSelling;
