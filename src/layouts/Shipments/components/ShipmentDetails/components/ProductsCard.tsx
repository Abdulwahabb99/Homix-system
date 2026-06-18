import React from "react";
import { Box, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailProduct } from "query/shipmentDetail";
import { FONT } from "../constants";
import { fmtNum, isImageUrl } from "../utils";
import DetailCard from "./DetailCard";

function ProductThumb({ image }: { image: string | null }) {
  return (
    <Box sx={{
      width: 52, height: 52, borderRadius: "10px", bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, overflow: "hidden",
    }}>
      {isImageUrl(image) ? <Box component="img" src={image as string} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
    </Box>
  );
}

function ProdTag({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{
      fontFamily: FONT, fontSize: "10.5px", color: HX.tx2,
      bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, px: "8px", py: "2px", borderRadius: "5px",
    }}>
      {children}
    </Box>
  );
}

/** Card listing every product line in the shipment. */
export default function ProductsCard({ products }: { products: ShipmentDetailProduct[] }) {
  return (
    <DetailCard
      title="المنتجات في هذه الشحنة"
      icon={<Inventory2OutlinedIcon />}
      extra={<Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx3 }}>{products.length} منتج</Typography>}
      noPad
    >
      {products.map((p, i) => (
        <Box key={i} sx={{
          display: "flex", alignItems: "center", gap: "12px", p: "12px 16px",
          borderBottom: i < products.length - 1 ? `0.5px solid ${HX.border}` : "none",
          transition: ".15s", "&:hover": { bgcolor: HX.surface2 },
        }}>
          <ProductThumb image={p.image} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx, mb: "3px" }}>{p.productName}</Typography>
            <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {p.productCode && <ProdTag>كود: {p.productCode}</ProdTag>}
              {p.size && <ProdTag>📐 {p.size}</ProdTag>}
              {p.color && <ProdTag>🎨 {p.color}</ProdTag>}
              {p.vendorName && <ProdTag>بائع: {p.vendorName}</ProdTag>}
              {p.quantity > 1 && <ProdTag>الكمية: {p.quantity}</ProdTag>}
            </Box>
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: HX.accent, flexShrink: 0 }}>
            {fmtNum(p.price)} ج.م
          </Typography>
        </Box>
      ))}
      {products.length === 0 && (
        <Box sx={{ p: "24px", textAlign: "center", fontFamily: FONT, fontSize: "12px", color: HX.tx3 }}>لا توجد منتجات</Box>
      )}
    </DetailCard>
  );
}
