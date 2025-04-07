import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  InputAdornment,
  Grid,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import axios from "axios";

const AddProductModal = ({ open, onClose, onConfirm, product }) => {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/products?searchQuery=${searchText}`
      );
      if (response.data.force_logout) {
        localStorage.removeItem("user");
        return (window.location.href = "/authentication/sign-in");
      }
      setProducts(response.data.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantCheck = (variant, product) => {
    const isSameProduct = selectedProduct?.id === product.id;
    const isSameVariant = selectedProduct?.variants[0]?.sku === variant.sku;

    if (isSameProduct & isSameVariant) {
      setSelectedProduct(null);
    } else {
      setSelectedProduct({ ...product, variants: [variant] });
    }
  };

  const isVariantChecked = (productId, variantSku) =>
    selectedProduct?.id === productId && selectedProduct.variants?.[0]?.sku === variantSku;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          minHeight: 500,
          maxHeight: 500,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          إضافة منتج
        </Typography>
      </DialogTitle>

      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchProducts();
          }}
        >
          <Box mb={2}>
            <Grid container spacing={2} alignItems="center" mt={1}>
              <Grid item xs={9}>
                <TextField
                  label="اسم المنتج"
                  variant="outlined"
                  fullWidth
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputLabelProps={{
                    sx: {
                      color: "#000",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon color="#000" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <Button variant="contained" fullWidth type="submit" sx={{ color: "#fff" }}>
                  بحث
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {products.map((product) => (
              <Box key={product.id} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <img
                    src={product.image}
                    alt={product.title}
                    width={40}
                    height={40}
                    style={{ borderRadius: 4 }}
                    loading="lazy"
                  />
                  <Typography sx={{ fontSize: "15px", color: "#000" }}>{product.title}</Typography>
                </Box>
                <Box mt={1} pl={4}>
                  {product.variants.map((variant) => (
                    <Box
                      key={variant.sku}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={1}
                      color={"#000"}
                    >
                      <FormControlLabel
                        sx={{ display: "flex", alignItems: "center" }}
                        control={
                          <Checkbox
                            checked={isVariantChecked(product.id, variant.sku)}
                            onChange={() => handleVariantCheck(variant, product)}
                            color="primary"
                            sx={{
                              "& .MuiSvgIcon-root": {
                                border: "1px solid rgb(135, 134, 134)",
                                fontSize: 18,
                                width: "1.1rem",
                                height: "1.1rem",
                              },
                            }}
                          />
                        }
                        label={
                          <Typography color={"#000"} fontSize={"13px"} fontWeight="bold">
                            {variant.title}
                          </Typography>
                        }
                      />
                      <Typography
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {Number(variant.price).toFixed(0)} ج.م
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          إلغاء
        </Button>
        <Button
          onClick={() => onConfirm(selectedProduct)}
          variant="contained"
          sx={{ color: "#fff" }}
          disabled={!selectedProduct || selectedProduct.variants?.length === 0}
        >
          إضافة
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddProductModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  product: PropTypes.bool,
};

export default AddProductModal;
