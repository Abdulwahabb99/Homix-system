/* eslint-disable react/prop-types */
import { Box, Skeleton } from "@mui/material";
import React from "react";

/** نفس تخطيط منطقة الصورة في تفاصيل المنتج + الـ skeleton */
export const productDetailsImageFrameSx = {
  position: "relative",
  width: "100%",
  maxWidth: 420,
  mx: "auto",
  minHeight: 0,
  flexShrink: 0,
  aspectRatio: "1 / 1",
  maxHeight: 420,
  bgcolor: (t) => (t.palette.mode === "dark" ? "action.selected" : "action.hover"),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  lineHeight: 0,
  boxSizing: "border-box",
};

export function ProductDetailsImageFrame({ children, sx = undefined, ...rest }) {
  return (
    <Box component="div" sx={[productDetailsImageFrameSx, sx]} {...rest}>
      {children}
    </Box>
  );
}

export function ProductDetailsImageFrameSkeleton() {
  return (
    <Box
      component="div"
      role="img"
      aria-label="جاري تحميل صورة المنتج"
      sx={productDetailsImageFrameSx}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: 0,
        }}
      />
    </Box>
  );
}

export function ProductDetailsProductImage({ src, alt, title: titleAttr }) {
  return (
    <ProductDetailsImageFrame>
      <Box
        component="img"
        src={src}
        alt={alt}
        title={titleAttr}
        loading="lazy"
        decoding="async"
        sx={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
        }}
      />
    </ProductDetailsImageFrame>
  );
}
