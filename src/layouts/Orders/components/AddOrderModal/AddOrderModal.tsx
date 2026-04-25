import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import React, { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { ToastContainer } from "react-toastify";
import MDBox from "components/MDBox";
import ProductPayment from "./ProductPayment";
import CustomerDetails from "./CustomerDetails";
import AddProductModal from "./AddProductModal";
import { customerDetailsReducer } from "layouts/Orders/utils/reducers";
import { customerInitialState } from "layouts/Orders/utils/constants";
import AddOrderDetails from "./AddOrderDetails";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { addOrderPageCardSx } from "./addOrderFormStyles";

const baseURI = `${process.env.REACT_APP_API_URL}`;

function AddOrderModal() {
  const theme = useTheme();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(customerDetailsReducer, customerInitialState);

  const changeCustomerChange = (e) => {
    dispatch({ field: e.target.name, value: e.target.value });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(false);
  };
  const handleCustomerDetailsChange = (order) => {
    setOrderDetails(order);
    setIsOrderDetailsModalOpen(false);
  };

  const addNewOrder = () => {
    axiosRequest
      .post(`${baseURI}/orders`, {
        total_discounts: 0,
        total_line_items_price: selectedProduct.variants[0].price,
        total_price: selectedProduct.variants[0].price,
        total_tax: 0,
        customer: {
          firstName: state.firstName,
          lastName: state.lastName,
          country: state.country,
          province: state.province,
          city: state.city,
          phone: state.phone,
          address: state.address,
          email: state.email,
        },
        line_items: [
          {
            title: selectedProduct.title,
            name: selectedProduct.title,
            price: selectedProduct.variants[0].price,
            product_id: selectedProduct.shopifyId,
            quantity: 1,
            variant_id: selectedProduct.variants[0].shopifyId,
            sku: selectedProduct.variants[0].sku,
            total_discount: "",
            discount_allocations: [],
            shipping_lines: [
              {
                price: orderDetails.shippingCost,
              },
            ],
          },
        ],
        userType: orderDetails.administrator,
        commission: orderDetails.commission,
        downPayment: orderDetails.downPayment,
        shippingFees: orderDetails.shippingCost,
        toBeCollected: orderDetails.toBeCollected,
        status: orderDetails.orderStatus,
        paymentStatus: orderDetails.paymentStatus,
        userId: orderDetails.administrator,
      })
      .then(() => {
        NotificationMeassage("success", "تم اضافه الطلب بنجاح");
        navigate("/orders");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    axiosRequest.get(`${process.env.REACT_APP_API_URL}/users`).then(({ data: { data } }) => {
      setUsers(data);
    });
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      {isProductModalOpen && (
        <AddProductModal
          open={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onConfirm={handleProductSelect}
          product={selectedProduct}
        />
      )}
      {isOrderDetailsModalOpen && (
        <AddOrderDetails
          open={isOrderDetailsModalOpen}
          onClose={() => setIsOrderDetailsModalOpen(false)}
          onConfirm={handleCustomerDetailsChange}
          customer={orderDetails}
          users={users}
        />
      )}
      <Box
        sx={{
          maxWidth: 1680,
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 3 },
          py: 2.5,
          minHeight: "50vh",
        }}
      >
        <Box
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background: (t) =>
              t.palette.mode === "dark"
                ? "rgba(255,255,255,0.03)"
                : "linear-gradient(135deg, rgba(6, 49, 70, 0.06) 0%, rgba(255,255,255,0.95) 48%, rgba(255,255,255,1) 100%)",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(6, 49, 70, 0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} flex={1} minWidth={0}>
              <IconButton
                onClick={() => navigate("/orders")}
                aria-label="رجوع للطلبات"
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  color: "primary.main",
                  flexShrink: 0,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} />
              </IconButton>
              <Box minWidth={0}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontSize: "0.77rem" }}
                >
                  إنشاء طلب جديد
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="text.primary"
                  sx={{ fontSize: "1.12rem" }}
                >
                  إضافة طلب
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.8125rem", mt: 0.5 }}
                >
                  اختر منتجاً واحداً، ثم أكمل بيانات العميل ومعلومات الطلب
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={7}>
            <Stack spacing={2.5}>
              <Card
                elevation={0}
                sx={{ ...addOrderPageCardSx, display: "flex", flexDirection: "column" }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.info.main, 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                      <Box
                        sx={{
                          width: 3,
                          minHeight: 20,
                          borderRadius: 0.5,
                          bgcolor: "primary.main",
                          flexShrink: 0,
                        }}
                      />
                      <MDTypography
                        component="h2"
                        variant="subtitle1"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ fontSize: "1.03rem" }}
                      >
                        المنتج
                      </MDTypography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.77rem" }}
                    >
                      منتج واحد لكل طلب
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => setIsProductModalOpen(true)}
                    size="small"
                    color="primary"
                    aria-label="اختيار منتج"
                    sx={(t) => ({
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: alpha(t.palette.primary.main, 0.12),
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: alpha(t.palette.primary.main, 0.32),
                      "&:hover": {
                        bgcolor: alpha(t.palette.primary.main, 0.2),
                      },
                    })}
                  >
                    <AddShoppingCartOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  {selectedProduct ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1.5} minWidth={0} flex={1}>
                        <Box
                          component="img"
                          src={selectedProduct.image}
                          alt={selectedProduct.title}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            objectFit: "cover",
                            border: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                          }}
                        />
                        <Box minWidth={0}>
                          <Typography
                            fontWeight={700}
                            color="text.primary"
                            sx={{ fontSize: "0.9rem", lineHeight: 1.4 }}
                          >
                            {selectedProduct.title}
                          </Typography>
                          {selectedProduct.variants[0].title &&
                            selectedProduct.variants[0].title !== "Default Title" && (
                              <Chip
                                label={selectedProduct.variants[0].title}
                                size="small"
                                sx={{
                                  mt: 0.75,
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  height: 24,
                                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                                  border: "1px solid",
                                  borderColor: (t) => alpha(t.palette.primary.main, 0.28),
                                }}
                              />
                            )}
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={0.5} flexShrink={0}>
                        <Typography fontWeight={800} color="primary.main" sx={{ fontSize: "1rem" }}>
                          {Number(selectedProduct.variants[0].price).toFixed(0)} ج.م
                        </Typography>
                        <IconButton
                          onClick={() => setSelectedProduct(null)}
                          size="small"
                          aria-label="إزالة المنتج"
                          sx={{
                            color: "error.main",
                            border: "1px solid",
                            borderColor: (t) => alpha(t.palette.error.main, 0.35),
                            bgcolor: (t) => alpha(t.palette.error.main, 0.04),
                            "&:hover": { bgcolor: (t) => alpha(t.palette.error.main, 0.1) },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 3.5,
                        px: 2,
                        borderRadius: 2.5,
                        border: "1px dashed",
                        borderColor: "divider",
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                      }}
                    >
                      <AddShoppingCartOutlinedIcon
                        sx={{ fontSize: 44, color: "primary.main", opacity: 0.5, mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ fontSize: "0.9rem" }}
                      >
                        لم يُاختر منتج
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 0.75 }}
                      >
                        اضغط أيقونة «+» أعلاه لاستعراض المنتجات واختيار بند
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <ProductPayment
                customer={orderDetails}
                users={users}
                openAddModal={() => setIsOrderDetailsModalOpen(true)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} lg={5}>
            <CustomerDetails handleChange={changeCustomerChange} state={state} />
          </Grid>
        </Grid>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          width="100%"
          gap={1.25}
          mt={3}
          flexWrap="wrap"
        >
          <Button
            onClick={() => navigate("/orders")}
            variant="outlined"
            color="inherit"
            size="large"
            sx={(t) => ({
              fontWeight: 700,
              borderColor: t.palette.divider,
              color: "text.primary",
              px: 2.5,
              "&:hover": { borderColor: t.palette.text.secondary, bgcolor: "action.hover" },
            })}
          >
            إلغاء
          </Button>
          <Button
            onClick={() => addNewOrder()}
            variant="contained"
            color="primary"
            size="large"
            disabled={
              !selectedProduct ||
              !orderDetails ||
              !String(state.firstName ?? "").trim() ||
              !String(state.lastName ?? "").trim()
            }
            sx={{ fontWeight: 700, px: 3, boxShadow: "none" }}
          >
            حفظ الطلب
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default AddOrderModal;
