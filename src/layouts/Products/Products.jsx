import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
} from "@mui/material";

import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import Spinner from "components/Spinner/Spinner";
import ProductCard from "./components/ProductCard";
import axiosRequest from "shared/functions/axiosRequest";

const ITEMS_PER_PAGE = 16;
const PAGE = "page";

function Products() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user.userType === "1";
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get("searchQuery") || "");
  const [selectedVendors, setSelectedVendors] = useState(
    searchParams.get("vendorsIds")?.split(",").map(Number) || []
  );
  const [vendorsIds, setVendorsIds] = useState([]);
  const [categoriesIds, setCategoriesIds] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("typesIds")?.split(",").map(Number) || []
  );
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get("page")) || 1;
  const searchQueryParam = searchParams.get("searchQuery") || "";

  const updateURLParams = (params) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });

    setSearchParams(updated);
  };

  const handlePageChange = (event, value) => {
    updateURLParams({ page: value.toString() });
  };

  const handleVendorChange = (vendors) => {
    setVendorsIds(vendors);
    updateURLParams({ vendorsIds: vendors.join(",") });
  };

  const handleCategoryChange = (categories) => {
    setCategoriesIds(categories);
    updateURLParams({ typesIds: categories.join(",") });
  };

  const fetchProducts = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page,
      size: ITEMS_PER_PAGE,
      ...(selectedVendors.length && { vendorsIds: selectedVendors.join(",") }),
      ...(selectedCategories.length && { typesIds: selectedCategories.join(",") }),
      ...(searchQueryParam && { searchQuery: searchQueryParam }),
    });
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/products?${query}`)
      .then(({ data: { data } }) => {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Error fetching products:", error))
      .finally(() => {
        setLoading(false);
      });
  };

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
        const categoryOptions = data.map((c) => ({ label: c.name, value: c.id }));
        setCategories(categoryOptions);
      });
  };

  useEffect(() => {
    getVendors();
    getCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {!loading ? (
          <>
            <Grid container spacing={2} mb={4}>
              <Grid item xs={12} md={4} lg={3}>
                <TextField
                  label="بحث"
                  variant="outlined"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    updateURLParams({ searchQuery: e.target.value });
                  }}
                  fullWidth
                />
              </Grid>

              {isAdmin && (
                <Grid item xs={6} md={4} lg={3}>
                  <FormControl fullWidth>
                    <InputLabel id="vendors">الموردين</InputLabel>
                    <Select
                      labelId="vendors"
                      id="vendors"
                      multiple
                      value={selectedVendors}
                      label="الموردين"
                      onChange={(e) => setSelectedVendors(e.target.value)}
                      onClose={() => {
                        handleVendorChange(selectedVendors);
                      }}
                      sx={{ height: 43 }}
                      renderValue={(selected) =>
                        selected
                          .map((value) => vendors.find((option) => option.value === value)?.label)
                          .join(", ")
                      }
                    >
                      {vendors.map((option) => {
                        const isSelected = selectedVendors.includes(option.value);
                        return (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                            style={{
                              margin: "5px 0",
                              color: "#000",
                              backgroundColor: isSelected ? "#e0e0e0" : "inherit",
                            }}
                          >
                            {option.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <InputLabel id="categories">التصنيفات</InputLabel>
                  <Select
                    labelId="categories"
                    id="categories"
                    multiple
                    value={selectedCategories}
                    label="التصنيفات"
                    onChange={(e) => setSelectedCategories(e.target.value)}
                    onClose={() => handleCategoryChange(selectedCategories)}
                    sx={{ height: 43 }}
                    renderValue={(selected) =>
                      selected
                        .map((value) => categories.find((option) => option.value === value)?.label)
                        .join(", ")
                    }
                  >
                    {categories.map((option) => {
                      const isSelected = selectedCategories.includes(option.value);
                      return (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          style={{
                            margin: "5px 0",
                            color: "#000",
                            backgroundColor: isSelected ? "#e0e0e0" : "inherit",
                          }}
                        >
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4} lg={3}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ color: "#fff" }}
                  onClick={() => {
                    if (page === 1) {
                      fetchProducts();
                    }
                    updateURLParams({ page: 1 });
                  }}
                >
                  بحث
                </Button>
              </Grid>
            </Grid>

            <Container>
              <Grid container spacing={1}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <MDBox mb={1.5}>
                      <ProductCard product={product} />
                    </MDBox>
                  </Grid>
                ))}
              </Grid>

              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                sx={{ display: "flex", justifyContent: "center", mt: 3 }}
              />
            </Container>
          </>
        ) : (
          <Spinner />
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default Products;
