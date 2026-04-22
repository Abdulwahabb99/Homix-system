/* eslint-disable react/prop-types */
import React from "react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const navigateToProduct = () => {
    navigate(`/products/${product.id}`);
  };

  const price = Number(product?.variants?.at(0)?.price);
  const priceLabel = Number.isFinite(price) ? price.toFixed(0) : "—";

  return (
    <Card
      elevation={0}
      onClick={navigateToProduct}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToProduct();
        }
      }}
      aria-label={`عرض ${product?.title}`}
      sx={{
        height: "100%",
        maxHeight: 420,
        cursor: "pointer",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 6px 20px rgba(0,0,0,0.3)"
              : "0 8px 24px rgba(6, 49, 70, 0.12)",
          borderColor: "primary.light",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          flexShrink: 0,
          pt: 1.25,
          px: 1.25,
        }}
      >
        <Box
          component="div"
          sx={{
            width: "100%",
            minHeight: 220,
            height: 220,
            borderRadius: 2,
            bgcolor: (t) => (t.palette.mode === "dark" ? "action.hover" : "grey.100"),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={product?.image}
            alt={product?.title || ""}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
              borderRadius: 1.5,
            }}
          />
        </Box>
      </Box>
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          textAlign: "start",
          gap: 0.5,
          py: 1.25,
          px: 1.5,
          "&:last-child": { pb: 1.25 },
        }}
      >
        <Typography
          component="h3"
          color="text.primary"
          title={product?.title}
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 32,
            maxHeight: 38,
            m: 0,
            width: "100%",
          }}
        >
          {product?.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "flex-start",
            gap: 0.4,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Typography
            component="span"
            sx={{ fontSize: "0.875rem", fontWeight: 800, color: "primary.main", lineHeight: 1.2 }}
          >
            {priceLabel}
          </Typography>
          <Typography component="span" variant="caption" color="text.secondary" fontSize="0.7rem">
            ج.م
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          fontSize="0.7rem"
          sx={{ opacity: 0.85, textAlign: "start", width: "100%" }}
        >
          {product.vendor?.name}
        </Typography>
        {product?.type?.name && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 0.5, width: "100%" }}>
            <Chip
              label={product.type.name}
              size="small"
              sx={{
                height: 22,
                maxWidth: "100%",
                fontSize: "0.65rem",
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: "rgba(6, 49, 70, 0.07)",
                color: "primary.main",
                border: "1px solid",
                borderColor: "rgba(6, 49, 70, 0.15)",
                "& .MuiChip-label": { px: 1, overflow: "hidden", textOverflow: "ellipsis" },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
