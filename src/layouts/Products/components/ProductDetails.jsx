import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import Spinner from "components/Spinner/Spinner";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

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
            <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              تفاصيل المنتج
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {isLoading ? "…" : productDetails?.title || "—"}
            </Typography>
          </Box>
        </Stack>

        {isLoading ? (
          <Spinner />
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
                <Box sx={{ bgcolor: "action.hover", aspectRatio: "1", maxHeight: 420 }}>
                  <CardMedia
                    component="img"
                    image={productDetails?.image}
                    alt={productDetails?.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
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
                    <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                      الخيارات والأسعار
                    </Typography>
                    <Stack spacing={1.5}>
                      {productDetails.variants.map((variant) => (
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
                      ))}
                    </Stack>
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
                                bgcolor: "rgba(6, 49, 70, 0.08)",
                                color: "primary.main",
                                border: "1px solid",
                                borderColor: "rgba(6, 49, 70, 0.2)",
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
