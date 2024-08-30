import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import { Container, Grid, Pagination } from "@mui/material";
import ProductCard from "./components/ProductCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "components/Spinner/Spinner";
import SearchComponent from "components/SearchComponent/SearchComponent";
import styles from "./Products.module.css";

const ITEMS_PER_PAGE = 16;

function Products() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parseInt(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("searchQuery");
  const [searchText, setSearchText] = useState(searchFilter);
  const [totalPages, setTotalPages] = useState(0);
  const handlePageChange = (event, value) => {
    setSearchParams({ page: value.toString() });
    navigate(`/products?page=${value}&searchQuery=${searchFilter ? searchFilter : ""}`);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ searchQuery: searchText?.toString() });
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://homix.onrender.com/products?page=${page}&size=${ITEMS_PER_PAGE}&searchQuery=${
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

  useEffect(() => {
    fetchProducts();
  }, [page, searchFilter]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {!loading ? (
          <>
            <div className={styles.searchContainer}>
              <SearchComponent
                handleSearch={handleSearch}
                searchText={searchText}
                setSearchText={setSearchText}
              />
            </div>
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
