import { Box, Chip, Grid, IconButton, Typography } from "@mui/material";
import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MDTypography from "components/MDTypography";
import styles from "./AddOrderModal.module.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { ToastContainer } from "react-toastify";
import MDBox from "components/MDBox";
import ProductPayment from "./ProductPayment";
import CustomerDetails from "./CustomerDetails";
import AddProductModal from "./AddProductModal";
import { customerDetailsReducer } from "layouts/Orders/utils/reducers";
import { customerInitialState } from "layouts/Orders/utils/constants";

function AddOrderModal() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(customerDetailsReducer, customerInitialState);

  const changeCustomerChange = (e) => {
    dispatch({ field: e.target.name, value: e.target.value });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      <div className={styles.orderDetailsHeader}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton color="#344767" onClick={() => navigate("/orders")}>
            <ArrowNextIcon />
          </IconButton>
          <MDTypography variant="h6" fontWeight="small">
            اضافه طلب
          </MDTypography>
        </div>
      </div>
      {isProductModalOpen && (
        <AddProductModal
          open={() => setIsProductModalOpen(true)}
          onClose={() => setIsProductModalOpen(false)}
          onConfirm={handleProductSelect}
          product={selectedProduct}
        />
      )}
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={7}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={12} lg={12}>
                <div className={styles.productsCard}>
                  <div className={styles.productsCardHeader}>
                    <h6>المنتجات</h6>
                    <IconButton
                      className={styles.addIcon}
                      onClick={() => setIsProductModalOpen(true)}
                    >
                      <AddIcon />
                    </IconButton>
                  </div>
                  {selectedProduct && (
                    <>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          {" "}
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={selectedProduct.image}
                              alt={selectedProduct.title}
                              width={40}
                              height={40}
                              style={{ borderRadius: 4 }}
                            />
                            <Typography
                              sx={{ fontSize: "15px", color: "#000", marginLeft: "10px" }}
                            >
                              {selectedProduct.title}
                            </Typography>
                          </div>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{ fontSize: "15px", color: "#000", marginLeft: "10px" }}
                            >
                              {Number(selectedProduct.variants[0].price).toFixed(0)} ج.م
                            </Typography>

                            <IconButton
                              className={styles.removeIcon}
                              onClick={() => setSelectedProduct(null)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </div>
                        </div>
                      </Box>
                      <Chip
                        style={{ fontSize: "10px" }}
                        label={selectedProduct.variants[0].title}
                        color="primary"
                        variant="filled"
                        size="small"
                        sx={{
                          backgroundColor: "#f0f0f0",
                          margin: "2px 2px 2px 0",
                          border: "1px solid #00000099",
                          color: "#000",
                        }}
                      />
                    </>
                  )}
                </div>
              </Grid>
              <Grid item xs={12} md={12} lg={12}>
                <ProductPayment />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={12} lg={5}>
            <CustomerDetails handleChange={changeCustomerChange} state={state} />
          </Grid>
          {/* second  */}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AddOrderModal;
