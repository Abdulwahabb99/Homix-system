/* eslint-disable react/prop-types */
import React from "react";
import { Card, CardContent, CardMedia, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const navigateToProduct = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card
      sx={{
        maxWidth: 370,
        maxHeight: 450,
        minHeight: 450,
        "@media (max-width: 600px)": {
          maxHeight: "none",
        },
        cursor: "pointer",
        boxShadow: "none",
      }}
      onClick={navigateToProduct}
    >
      <CardMedia
        component="img"
        image={product?.image}
        alt={product?.title}
        sx={{ objectFit: "fill", maxHeight: "200px" }}
      />
      <CardContent>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{ fontSize: "15px", fontWeight: 800 }}
        >
          {product?.title}
        </Typography>
        <Typography variant="h6" color="black">
          {Number(product?.variants.at(0)?.price).toFixed(0) || 0}
          <span style={{ margin: "0 2px" }}> ج.م</span>
        </Typography>
        <Typography sx={{ fontSize: "12px" }} color="text.secondary">
          {product.vendor.name}
        </Typography>
        {product?.type?.name && (
          <Chip
            style={{ fontSize: "12px" }}
            label={product?.type?.name}
            color="primary"
            variant="filled"
            size="small"
            sx={{
              backgroundColor: "#f0f0f0",
              margin: "2px 2px 2px 0",
              border: "1px solid #00000099",
              color: "#00000099",
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
