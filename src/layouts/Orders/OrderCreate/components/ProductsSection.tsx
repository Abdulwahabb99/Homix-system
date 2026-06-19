import React from "react";
import { Box, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { OrderLineItem } from "../types";
import { FONT } from "../constants";
import { formatMoney, isImageUrl } from "../utils";
import SectionCard from "./SectionCard";

export interface ProductsSectionProps {
  lineItems: OrderLineItem[];
  onOpenPicker: () => void;
  onRemove: (key: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
}

function Thumb({ image }: { image?: string | null }) {
  return (
    <Box sx={{
      width: 48, height: 48, borderRadius: "9px", bgcolor: HX.surface3, border: `0.5px solid ${HX.border}`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, overflow: "hidden",
    }}>
      {isImageUrl(image) ? <Box component="img" src={image as string} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
    </Box>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ fontFamily: FONT, fontSize: "10.5px", color: HX.tx2, bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, px: "8px", py: "2px", borderRadius: "5px" }}>
      {children}
    </Box>
  );
}

/** المنتجات — قائمة بنود الطلب (line_items). */
export default function ProductsSection({ lineItems, onOpenPicker, onRemove, onQuantityChange }: ProductsSectionProps) {
  return (
    <SectionCard title="المنتجات" subtitle="ابحث وأضف منتجات الطلب" icon={<Inventory2OutlinedIcon />} iconBg={HX.purpleLight} iconColor={HX.purple} required>
      {lineItems.map((li) => (
        <Box key={li.key} sx={{ display: "flex", alignItems: "center", gap: "12px", p: "12px 14px", bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, borderRadius: "10px", mb: "8px" }}>
          <Thumb image={li.image} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>{li.title}</Typography>
            <Box sx={{ display: "flex", gap: "6px", mt: "4px", flexWrap: "wrap" }}>
              {li.productCode && <Tag>كود: {li.productCode}</Tag>}
              {li.variantTitle && <Tag>{li.variantTitle}</Tag>}
            </Box>
          </Box>

          {/* Quantity stepper */}
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: "4px", border: `0.5px solid ${HX.border}`, borderRadius: "8px", bgcolor: HX.surface, px: "4px", height: 30, flexShrink: 0 }}>
            <Box component="button" type="button" aria-label="إنقاص" onClick={() => onQuantityChange(li.key, li.quantity - 1)} sx={{ border: "none", bgcolor: "transparent", cursor: "pointer", color: HX.tx2, display: "flex", "&:hover": { color: HX.accent } }}>
              <RemoveIcon sx={{ fontSize: 14 }} />
            </Box>
            <Box component="span" sx={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: HX.tx, minWidth: 18, textAlign: "center" }}>{li.quantity}</Box>
            <Box component="button" type="button" aria-label="زيادة" onClick={() => onQuantityChange(li.key, li.quantity + 1)} sx={{ border: "none", bgcolor: "transparent", cursor: "pointer", color: HX.tx2, display: "flex", "&:hover": { color: HX.accent } }}>
              <AddIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>

          <Box sx={{ textAlign: "left", flexShrink: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "14px", fontWeight: 900, color: HX.accent }}>{formatMoney(li.price * li.quantity)} ج.م</Typography>
          </Box>

          <Box component="button" type="button" aria-label="إزالة المنتج" onClick={() => onRemove(li.key)} sx={{ width: 28, height: 28, borderRadius: "7px", border: "none", bgcolor: HX.redLight, color: HX.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "&:hover": { bgcolor: HX.red, color: "#fff" } }}>
            <CloseIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      ))}

      <Box
        component="button"
        type="button"
        onClick={onOpenPicker}
        sx={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%",
          p: "11px 14px", border: `1px dashed ${HX.border2}`, borderRadius: "10px", cursor: "pointer",
          bgcolor: "transparent", color: HX.tx3, fontFamily: FONT, fontSize: "12.5px", fontWeight: 600,
          transition: ".15s", "&:hover": { borderColor: HX.accent, color: HX.accent, bgcolor: HX.accentLight },
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
        {lineItems.length === 0 ? "إضافة منتج" : "إضافة منتج آخر"}
      </Box>
    </SectionCard>
  );
}
