import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import ProductDetailsSkeleton from "./ProductDetailsSkeleton";
import { ProductDetailsProductImage } from "./ProductDetailsImageFrame";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

function ProductDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoading, setIsLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const [optionsPricesOpen, setOptionsPricesOpen] = useState(false);
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
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`);
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }

        setProductDetails(data.data);
      } catch (error) {
        NotificationMeassage("error", "حدث خطأ");
      } finally {
        setIsLoading(false);
      }
    };

    getProductDetails();
  }, [id, navigate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 3 },
          py: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="الرجوع"
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "primary.main",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} />
          </IconButton>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              تفاصيل المنتج
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="text"
                height={32}
                sx={{ width: { xs: "75%", sm: 280 }, borderRadius: 0.5 }}
              />
            ) : (
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {productDetails?.title || "—"}
              </Typography>
            )}
          </Box>
        </Stack>

        {isLoading ? (
          <ProductDetailsSkeleton />
        ) : productDetails ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={5} lg={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 4px 24px rgba(15, 23, 42, 0.08)",
                }}
              >
                <ProductDetailsProductImage
                  src={productDetails?.image}
                  alt={productDetails?.title || ""}
                  title={productDetails?.title}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
              <Stack spacing={2.5}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={600}>
                      اسم المنتج
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, mb: 2 }}>
                      {productDetails.title}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      onClick={() => setOptionsPricesOpen((v) => !v)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOptionsPricesOpen((v) => !v);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      id="options-prices-header"
                      aria-expanded={optionsPricesOpen}
                      aria-controls="options-prices-panel"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        width: "100%",
                        p: 1.5,
                        mx: -1.5,
                        my: 0,
                        borderRadius: 2,
                        cursor: "pointer",
                        textAlign: "start",
                        border: "1px dashed",
                        borderColor: "rgba(99, 102, 241, 0.28)",
                        bgcolor: (t) =>
                          t.palette.mode === "dark"
                            ? "rgba(99, 102, 241, 0.12)"
                            : "rgba(99, 102, 241, 0.04)",
                        transition: "background-color 0.2s, border-color 0.2s",
                        "&:hover": {
                          borderColor: "primary.light",
                          bgcolor: (t) =>
                            t.palette.mode === "dark"
                              ? "rgba(99, 102, 241, 0.18)"
                              : "rgba(99, 102, 241, 0.07)",
                        },
                        "&:focus-visible": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          component="span"
                          variant="subtitle1"
                          fontWeight={700}
                          color="primary"
                          display="block"
                        >
                          الخيارات والأسعار
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.25 }}
                        >
                          اضغط لعرض الخيارات والأسعار أو إخفائها
                        </Typography>
                      </Box>
                      <ExpandMoreIcon
                        aria-hidden
                        sx={{
                          flexShrink: 0,
                          color: "primary.main",
                          transform: optionsPricesOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </Box>
                    <Collapse in={optionsPricesOpen} id="options-prices-panel" unmountOnExit>
                      <Stack
                        spacing={1.5}
                        sx={{ pt: 2 }}
                        role="region"
                        aria-labelledby="options-prices-header"
                      >
                        {(productDetails.variants || []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            لا توجد خيارات مسجّلة لهذا المنتج.
                          </Typography>
                        ) : (
                          (productDetails.variants || []).map((variant) => (
                            <Box
                              key={variant.shopifyId || variant.title}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "action.hover",
                              }}
                            >
                              {variant.title !== "Default Title" && (
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                  {variant.title}
                                </Typography>
                              )}
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    سعر البيع
                                  </Typography>
                                  <Typography variant="h6" fontWeight={800} color="primary">
                                    {Number(variant.price).toFixed(0)} ج.م
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    التكلفة
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="text.primary">
                                    {Number(variant.cost).toFixed(0)} ج.م
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          ))
                        )}
                      </Stack>
                    </Collapse>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          المورد
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {productDetails.vendor?.name}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 1 }}
                        >
                          التصنيفات
                        </Typography>
                        <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                          {productDetails?.categories?.map((category) => (
                            <Chip
                              key={category.categoryId}
                              label={category.category?.title}
                              size="medium"
                              sx={{
                                fontWeight: 500,
                                borderRadius: 2,
                                bgcolor: "rgba(99, 102, 241, 0.08)",
                                color: "primary.main",
                                border: "1px solid",
                                borderColor: "rgba(99, 102, 241, 0.2)",
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">تعذر عرض هذا المنتج</Typography>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default ProductDetails;
