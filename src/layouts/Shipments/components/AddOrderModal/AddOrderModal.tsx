import { Box, Chip, Grid, IconButton, Typography } from "@mui/material";
import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ToastContainer } from "react-toastify";
import ProductPayment from "./ProductPayment";
import CustomerDetails from "./CustomerDetails";
import AddProductModal from "./AddProductModal";
import { customerDetailsReducer } from "layouts/Orders/utils/reducers";
import { customerInitialState } from "layouts/Orders/utils/constants";
import AddOrderDetails from "./AddOrderDetails";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";

const baseURI = `${process.env.REACT_APP_API_URL}`;
const FONT = "'Cairo', sans-serif";

function AddOrderModal() {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

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

  const toIsoDate = (d) => {
    if (!d) return undefined;
    const date = new Date(d);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const addNewOrder = () => {
    const variant = selectedProduct?.variants?.[0] ?? {};
    const toStr = (v) => (v === undefined || v === null || v === "" ? undefined : String(v));
    const body = {
      customer: {
        first_name: state.firstName,
        last_name: state.lastName,
        phone: state.phone,
      },
      line_items: [
        {
          title: selectedProduct?.title,
          price: toStr(variant.price),
          quantity: 1,
          variant_id: toStr(variant.shopifyId),
        },
      ],
      shippingCompany: orderDetails?.shippingCompany,
      governorate: toStr(orderDetails?.governorate),
      shipmentStatus: toStr(orderDetails?.shipmentStatus),
      shipmentType: toStr(orderDetails?.shipmentType),
      shippingReceiveDate: toIsoDate(orderDetails?.shippingReceiveDate),
      deliveryDate: toIsoDate(orderDetails?.deliveryDate),
      deliveryBy: toStr(orderDetails?.deliveryBy),
      shippingFees: toStr(orderDetails?.shippingCost),
      toBeCollected: toStr(orderDetails?.toBeCollected),
    };

    axiosRequest
      .post(`${baseURI}/shipments`, body)
      .then(() => {
        NotificationMeassage("success", "تم اضافه الشحنة بنجاح");
        navigate("/shipments");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const canSubmit = Boolean(selectedProduct && state.firstName && state.lastName);

  const sectionTitleSx = {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontFamily: FONT,
    fontSize: "14px",
    fontWeight: 700,
    color: HX.tx,
  };

  const iconChipSx = (bg, color) => ({
    width: 30,
    height: 30,
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: bg,
    color,
    flexShrink: 0,
  });

  return (
    <DashboardLayout>
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
        />
      )}

      <Box sx={{ fontFamily: FONT, pb: "90px" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            mb: "18px",
          }}
        >
          <IconButton
            onClick={() => navigate("/shipments")}
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              border: `1px solid ${HX.border2}`,
              bgcolor: HX.surface,
              color: HX.tx2,
              transition: ".15s",
              "&:hover": { bgcolor: HX.surface3, color: HX.accent, borderColor: HX.accent },
            }}
          >
            <ArrowNextIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: "19px", fontWeight: 800, color: HX.tx, lineHeight: 1.2 }}>
              إضافة شحنة جديدة
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2, mt: "2px" }}>
              أضف المنتج وبيانات العميل ومعلومات الشحن
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.2}>
          {/* Left column */}
          <Grid item xs={12} lg={7}>
            <Grid container spacing={2.2}>
              {/* Products card */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    bgcolor: HX.surface,
                    borderRadius: HX.r,
                    border: `0.5px solid ${HX.border}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    p: "18px 20px",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: selectedProduct ? "16px" : 0 }}>
                    <Box sx={sectionTitleSx}>
                      <Box sx={iconChipSx(HX.accentLight, HX.accent)}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 17 }} />
                      </Box>
                      المنتجات
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setIsProductModalOpen(true)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        px: "12px",
                        height: 34,
                        borderRadius: "9px",
                        border: "none",
                        bgcolor: HX.accent,
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "12.5px",
                        fontFamily: FONT,
                        fontWeight: 700,
                        transition: ".2s",
                        "&:hover": { bgcolor: "#4f46e5" },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 17 }} />
                      {selectedProduct ? "تغيير" : "إضافة منتج"}
                    </Box>
                  </Box>

                  {selectedProduct ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        p: "12px",
                        borderRadius: "11px",
                        border: `0.5px solid ${HX.border}`,
                        bgcolor: HX.surface2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <Box
                          component="img"
                          src={selectedProduct.image}
                          alt={selectedProduct.title}
                          sx={{ width: 52, height: 52, borderRadius: "10px", objectFit: "cover", flexShrink: 0, border: `0.5px solid ${HX.border}` }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: "13.5px", fontWeight: 700, color: HX.tx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedProduct.title}
                          </Typography>
                          <Chip
                            label={selectedProduct.variants[0].title}
                            size="small"
                            sx={{
                              mt: "5px",
                              height: 22,
                              fontFamily: FONT,
                              fontSize: "11px",
                              fontWeight: 600,
                              bgcolor: HX.accentLight,
                              color: HX.accent,
                              border: "none",
                              "& .MuiChip-label": { px: "9px" },
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: "14px", fontWeight: 800, color: HX.tx }}>
                          {Number(selectedProduct.variants[0].price).toFixed(0)}
                          <Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx3, mr: "3px" }}>ج.م</Box>
                        </Typography>
                        <IconButton
                          onClick={() => setSelectedProduct(null)}
                          sx={{ width: 30, height: 30, borderRadius: "8px", color: HX.red, bgcolor: HX.redLight, "&:hover": { bgcolor: "rgba(239,68,68,0.18)" } }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      onClick={() => setIsProductModalOpen(true)}
                      sx={{
                        mt: "14px",
                        py: "26px",
                        borderRadius: "11px",
                        border: `1.5px dashed ${HX.border2}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        transition: ".15s",
                        "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight },
                      }}
                    >
                      <Box sx={iconChipSx(HX.surface3, HX.tx3)}>
                        <AddIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2, fontWeight: 600 }}>
                        لم يتم اختيار منتج بعد
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Order info card */}
              <Grid item xs={12}>
                <ProductPayment
                  customer={orderDetails}
                  openAddModal={() => setIsOrderDetailsModalOpen(true)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} lg={5}>
            <CustomerDetails handleChange={changeCustomerChange} state={state} />
          </Grid>
        </Grid>
      </Box>

      {/* Sticky footer actions */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "10px",
          px: { xs: "16px", lg: "28px" },
          py: "12px",
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${HX.border}`,
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => navigate("/shipments")}
          sx={{
            px: "20px",
            height: 40,
            borderRadius: "10px",
            border: `1px solid ${HX.border2}`,
            bgcolor: HX.surface,
            color: HX.tx2,
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: FONT,
            fontWeight: 600,
            transition: ".15s",
            "&:hover": { bgcolor: HX.surface3, color: HX.tx },
          }}
        >
          إلغاء
        </Box>
        <Box
          component="button"
          type="button"
          onClick={addNewOrder}
          disabled={!canSubmit}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            px: "26px",
            height: 40,
            borderRadius: "10px",
            border: "none",
            bgcolor: canSubmit ? HX.accent : HX.surface3,
            color: canSubmit ? "#fff" : HX.tx3,
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontSize: "13px",
            fontFamily: FONT,
            fontWeight: 700,
            boxShadow: canSubmit ? "0 4px 14px rgba(99,102,241,0.32)" : "none",
            transition: ".2s",
            "&:hover": canSubmit ? { bgcolor: "#4f46e5" } : {},
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          إضافة الشحنة
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default AddOrderModal;
