import { Card, CardMedia, Grid, IconButton } from "@mui/material";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Spinner from "components/Spinner/Spinner";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import styles from "../Products.module.css";

function ProductDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoading, setIsLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const getProductDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`https://homix.onrender.com/products/${id}`);
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }

        setProductDetails(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProductDetails();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div className={styles.productDetailsHeader}>
        <IconButton color="#344767" onClick={() => navigate(-1)}>
          <ArrowNextIcon />
        </IconButton>
      </div>

      {!isLoading && productDetails ? (
        <>
          <MDBox py={3}>
            <MDBox>
              <Grid container spacing={2} justifyContent={"center"}>
                <Grid item xs={12} md={8} lg={8}>
                  <Card sx={{ height: "100%", width: "100%" }}>
                    <>
                      <MDBox pt={2} px={3}>
                        <MDBox mt={0} mb={2}>
                          <MDTypography variant="h6" fontWeight="large">
                            {productDetails.title}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDBox pt={1} px={3}>
                        <MDBox mt={0} mb={0}>
                          <MDBox mt={0} mb={0}>
                            <MDTypography variant="h6" fontWeight="large">
                              الخيارات
                            </MDTypography>
                          </MDBox>
                          {productDetails.variants.map((variant, inedx) => (
                            <>
                              <MDTypography variant="button" fontWeight="regular">
                                <div>
                                  {variant.title !== "Default Title" && <div>{variant.title}</div>}
                                  <div>
                                    <MDTypography
                                      display="inline"
                                      variant="h6"
                                      verticalAlign="middle"
                                    >
                                      السعر :
                                    </MDTypography>
                                    &nbsp;
                                    <MDTypography
                                      variant="button"
                                      color="text"
                                      fontWeight="regular"
                                      key={inedx}
                                    >
                                      {Number(variant.price).toFixed(0)}ج.م
                                    </MDTypography>
                                  </div>
                                </div>
                              </MDTypography>
                            </>
                          ))}
                        </MDBox>

                        <MDBox mt={0} mb={2}>
                          <MDTypography variant="button" fontWeight="regular">
                            <MDTypography display="inline" variant="h6" verticalAlign="middle">
                              المورد:
                            </MDTypography>
                            &nbsp;
                            <MDTypography variant="button" color="text" fontWeight="regular">
                              {productDetails.vendor.name}
                            </MDTypography>
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <Card
                    sx={{
                      maxWidth: 345,
                      maxHeight: 387,
                      minHeight: 370,
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={productDetails?.image}
                      sx={{ objectFit: "cover", maxHeight: "387" }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </MDBox>
          </MDBox>
        </>
      ) : (
        <Spinner />
      )}
    </DashboardLayout>
  );
}

export default ProductDetails;
