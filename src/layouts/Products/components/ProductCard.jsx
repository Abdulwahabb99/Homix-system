/* eslint-disable react/prop-types */
// src/components/ProductCard.js
import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

const ProductCard = ({ product }) => {
  console.log(product);
  return (
    <Card
      sx={{
        maxWidth: 345,
        maxHeight: 387,
        minHeight: 370,
        "@media (max-width: 600px)": {
          maxHeight: "none",
        },
      }}
    >
      <CardMedia
        component="img"
        image={product?.image}
        alt={product?.title}
        sx={{ objectFit: "cover", maxHeight: "200px" }}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {product?.title}
        </Typography>
        <Typography variant="h6" color="black">
          {Number(product?.variants.at(0).price).toFixed(0)}
          <span style={{ margin: "0 2px" }}> ج.م</span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.vendor.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
