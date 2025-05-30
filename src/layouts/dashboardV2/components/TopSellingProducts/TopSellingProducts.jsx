import * as React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const rows = [
  {
    id: 1,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 2,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 3,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 4,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 5,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 6,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 7,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 8,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 9,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
  {
    id: 10,
    name: "دولاب خشبي EGT9 - سم 180*40*80",
    sku: "skuA3659",
    costPrice: "3000 EGP",
    sellPrice: "3000 EGP",
    image: "/product-image.jpg",
  },
];

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
          src={
            "https://cdn.shopify.com/s/files/1/0699/1108/5302/files/D109-removebg-preview__1_-removebg-preview_1_.remini-enhanced.jpg?v=1738742239"
          }
          alt={params.row.name}
          sx={{ width: 40, height: 40, borderRadius: "10%", objectFit: "cover" }}
        />{" "}
        <Box gap={0}>
          <Typography
            sx={{ fontSize: "14px", fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px" }}
            color="#00314C"
          >
            {params.row.name}
          </Typography>
          <Typography
            sx={{ fontSize: "14px", fontWeight: 400, lineHeight: "140%", letterSpacing: "0.14px" }}
            color="#1A73E8"
          >
            {params.row.sku}
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
          {params.row.sellPrice}
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
          {params.row.costPrice}
        </Typography>
      </Box>
    ),
  },
];

const TopSellingProductsTable = () => {
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
        أكثر 10 منتجات مبيعًا
      </Typography>

      <Box sx={{ width: "100%", overflowX: "auto", maxHeight: 400 }}>
        <Box sx={{ minWidth: 600 }}>
          <DataGrid
            rows={rows}
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

export default TopSellingProductsTable;
