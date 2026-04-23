import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Grid, Pagination, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ProductCard from "./components/ProductCard";
import {
  ProductsFilterDialog,
  ProductsFilterTriggerButton,
} from "./components/ProductsFilterDialog";
import ProductsPageSkeleton from "./components/ProductsPageSkeleton";
import axiosRequest from "shared/functions/axiosRequest";

const ITEMS_PER_PAGE = 16;

function Products() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user.userType === "1";
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get("page"), 10) || 1;
  const searchQueryParam = searchParams.get("searchQuery") || "";

  const selectedVendors = useMemo(() => {
    const raw = searchParams.get("vendorsIds");
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n));
  }, [searchParams]);

  const selectedCategories = useMemo(() => {
    const raw = searchParams.get("typesIds");
    if (!raw) return [];
    return raw
      .split(",")
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n));
  }, [searchParams]);

  const filterActiveCount = selectedVendors.length + selectedCategories.length;

  const setParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        next.set(key, String(value));
      } else {
        next.delete(key);
      }
    });
    setSearchParams(next);
  };

  const handlePageChange = (event, value) => {
    setParams({ page: String(value) });
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const p = parseInt(searchParams.get("page"), 10) || 1;
    const searchQuery = searchParams.get("searchQuery") || "";
    const vendorsIds = searchParams.get("vendorsIds");
    const typesIds = searchParams.get("typesIds");

    const query = new URLSearchParams({
      page: String(p),
      size: String(ITEMS_PER_PAGE),
    });
    if (vendorsIds) query.set("vendorsIds", vendorsIds);
    if (typesIds) query.set("typesIds", typesIds);
    if (searchQuery) query.set("searchQuery", searchQuery);

    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/products?${query}`)
      .then(({ data: { data } }) => {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Error fetching products:", error))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getVendors = () => {
    axiosRequest.get(`${process.env.REACT_APP_API_URL}/vendors`).then(({ data: { data } }) => {
      const vendorOptions = data.map((v) => ({ label: v.name, value: v.id }));
      setVendors([{ label: "هومكس", value: 0 }, ...vendorOptions]);
    });
  };

  const getCategories = () => {
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/products/types`)
      .then(({ data: { data } }) => {
        setCategories(data.map((c) => ({ label: c.name, value: c.id })));
      });
  };

  useEffect(() => {
    getVendors();
    getCategories();
  }, []);

  const handleSearchChange = (e) => {
    setParams({ searchQuery: e.target.value, page: "1" });
  };

  const handleApplyFilters = (vendorsList, categoryList) => {
    if (isAdmin) {
      setParams({
        page: "1",
        vendorsIds: vendorsList.length ? vendorsList.join(",") : "",
        typesIds: categoryList.length ? categoryList.join(",") : "",
      });
    } else {
      setParams({
        page: "1",
        vendorsIds: "",
        typesIds: categoryList.length ? categoryList.join(",") : "",
      });
    }
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    next.set("page", "1");
    setSearchParams(next);
  };

  const searchFieldStyles = {
    flex: 1,
    minWidth: 0,
    "& .MuiInputLabel-root": {
      fontSize: "0.8125rem",
      color: "primary.main",
      "&.Mui-focused": {
        color: "primary.main",
      },
    },
    "& .MuiOutlinedInput-root": {
      height: 40,
      borderRadius: 1.5,
      fontSize: "0.8125rem",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(6, 49, 70, 0.35)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
        borderWidth: 2,
      },
    },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          maxWidth: 1680,
          mx: "auto",
          width: "100%",
        }}
      >
        <Stack spacing={0.5} mb={2.5}>
          <Typography variant="h6" fontWeight={700} color="text.primary" fontSize="1.1rem">
            المنتجات
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">
            ابحث عن المنتج، أو اضبط الموردين والتصنيفات من أيقونة التصفية
          </Typography>
        </Stack>

        {loading ? (
          <ProductsPageSkeleton />
        ) : (
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
                <TextField
                  label="بحث"
                  placeholder="اسم المنتج…"
                  variant="outlined"
                  size="small"
                  value={searchQueryParam}
                  onChange={handleSearchChange}
                  sx={searchFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { fontSize: "0.8125rem" } }}
                  InputProps={{
                    endAdornment: <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} />,
                  }}
                />
                <ProductsFilterTriggerButton
                  onClick={() => setFilterDialogOpen(true)}
                  activeCount={filterActiveCount}
                />
              </Stack>
            </Box>

            <ProductsFilterDialog
              open={filterDialogOpen}
              onClose={() => setFilterDialogOpen(false)}
              isAdmin={isAdmin}
              vendors={vendors}
              categories={categories}
              selectedVendors={selectedVendors}
              selectedCategories={selectedCategories}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />

            {products.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <Typography color="text.secondary">
                  لا توجد منتجات مطابقة للتصفية الحالية
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 1.5,
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Products;
