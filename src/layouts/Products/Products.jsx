import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import {
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import ProductCard from "./components/ProductCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "components/Spinner/Spinner";
import SearchComponent from "components/SearchComponent/SearchComponent";
import styles from "./Products.module.css";

const ITEMS_PER_PAGE = 16;

function Products() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchParams, setSearchParams] = useSearchParams();
  const vendorIdsParam = searchParams.get("vendorsIds");
  const categoriesIdsParam = searchParams.get("categoriesIds");
  const page = parseInt(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("searchQuery");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState(
    vendorIdsParam ? vendorIdsParam.split(",").map(Number) : []
  );
  const [selectedCategories, setSelectedCategories] = useState(
    categoriesIdsParam ? categoriesIdsParam.split(",").map(Number) : []
  );
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState(searchFilter);
  const [totalPages, setTotalPages] = useState(0);
  const isAdmin = user.userType === "1";

  const handlePageChange = (event, value) => {
    setSearchParams({ page: value.toString() });
    navigate(
      vendorIdsParam
        ? `/products?page=${value}&vendorsIds=${vendorIdsParam}`
        : `/products?page=${value}&searchQuery=${searchFilter ? searchFilter : ""}`
    );
  };
  axios.interceptors.request.use(
    (config) => {
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText) {
      setSearchParams({ searchQuery: searchText?.toString() });
    } else {
      setSearchParams({ searchQuery: "" });
    }
  };
  const changeVendors = (vendors) => {
    setSelectedVendors(vendors);
    setSearchParams({
      vendorsIds: vendors.length > 0 ? vendors.join(",") : "",
    });
  };
  const handleChangeCategories = (categories) => {
    setSelectedCategories(categories);
    setSearchParams({
      categoriesIds: categories.length > 0 ? categories.join(",") : "",
    });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        vendorIdsParam
          ? `${process.env.REACT_APP_API_URL}/products?page=${page}&size=${ITEMS_PER_PAGE}&vendorsIds=${vendorIdsParam}`
          : `${
              process.env.REACT_APP_API_URL
            }/products?page=${page}&size=${ITEMS_PER_PAGE}&searchQuery=${
              searchFilter ? searchFilter : ""
            }`
      );
      if (response.data.force_logout) {
        localStorage.removeItem("user");
        navigate("/authentication/sign-in");
      }
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  const getVendors = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/vendors`)
      .then(({ data: { data } }) => {
        const newData = data.map((vendor) => ({ label: vendor.name, value: vendor.id }));
        setVendors([{ label: "هومكس", value: "0" }, ...newData]);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    getVendors();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, searchFilter, vendorIdsParam]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {!loading ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} lg={3}>
                {" "}
                <div className={styles.searchContainer}>
                  <SearchComponent
                    handleSearch={handleSearch}
                    searchText={searchText}
                    setSearchText={setSearchText}
                  />
                </div>
              </Grid>
              {isAdmin && (
                <Grid item xs={6} md={4} lg={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="vendors">الموردين</InputLabel>
                    <Select
                      labelId="vendors"
                      id="vendors"
                      multiple
                      value={selectedVendors}
                      label="الموردين"
                      fullWidth
                      onChange={(e) => changeVendors(e.target.value)}
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
                <FormControl style={{ width: "100%" }}>
                  <InputLabel id="vendors">التصنيفات</InputLabel>
                  <Select
                    labelId="categories"
                    id="categories"
                    multiple
                    value={selectedCategories}
                    label="التصنيفات"
                    fullWidth
                    onChange={(e) => handleChangeCategories(e.target.value)}
                    sx={{ height: 43 }}
                    renderValue={(selected) =>
                      selected
                        .map((value) => vendors.find((option) => option.value === value)?.label)
                        .join(", ")
                    }
                  >
                    {vendors.map((option) => {
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
            </Grid>

            <Container>
              <Grid container spacing={1}>
                {products?.map((product) => (
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
                sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
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
