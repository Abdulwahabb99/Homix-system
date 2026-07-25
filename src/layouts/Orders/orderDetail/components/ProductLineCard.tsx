/**
 * بطاقة سطر منتج واحد: صورة + عنوان/وصف/سعر + وسوم + بائع + وصف المنتج.
 */
import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { OD } from "../odTheme";
import { getOrderLineProductDescriptionPlainText } from "../orderDetailNormalize";
import { buildProductLineTags, formatMoney } from "../utils";
import { VENDOR_AVATAR_GRADIENT } from "../constants";
import SectionCard from "./SectionCard";

interface ProductLineCardProps {
  order: any;
  orderDetails: any;
  onPreview: (src: string) => void;
}

export default function ProductLineCard({ order, orderDetails, onPreview }: ProductLineCardProps) {
  const lineProductDescription = getOrderLineProductDescriptionPlainText(order);
  const ordervariant = order?.product?.variants?.find(
    (variant: any) => variant.shopifyId === order?.variant_id
  );
  const unitPrice = order?.product?.variants?.[0]?.price;
  const tagParts = buildProductLineTags(order);
  const image = order?.product?.image;

  return (
    <SectionCard
      icon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="تفاصيل المنتج"
      headerRight={
        orderDetails?.status === 8 ? (
          <Chip
            label="في المخزن"
            size="small"
            sx={{ height: 24, fontSize: "0.625rem", fontWeight: 700, bgcolor: OD.gl, color: "#065f46" }}
          />
        ) : null
      }
      bodySx={{ p: 2 }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75} alignItems="flex-start">
        <Box
          component="img"
          src={image}
          alt={order?.title || ""}
          onClick={() => image && onPreview(image)}
          sx={{
            width: 120,
            height: 110,
            objectFit: "cover",
            borderRadius: "10px",
            border: `0.5px solid ${OD.brd}`,
            bgcolor: OD.sur2,
            flexShrink: 0,
            cursor: image ? "zoom-in" : "default",
            transition: "opacity .15s, box-shadow .15s",
            "&:hover": image ? { opacity: 0.9, boxShadow: `0 0 0 2px ${OD.accent}` } : undefined,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: OD.tx, mb: 0.75, lineHeight: 1.4 }}>
            {order?.title}
          </Typography>
          {order?.variant?.title && order.variant.title !== "Default Title" ? (
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: OD.tx2, mb: 1, lineHeight: 1.5 }}>
              {order.variant.title}
            </Typography>
          ) : null}
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 900, color: OD.accent, mb: 1 }}>
            {unitPrice != null ? formatMoney(unitPrice) : "—"}{" "}
            <Box component="span" sx={{ fontSize: "0.75rem", fontWeight: 500, color: OD.tx3 }}>
              ج.م
            </Box>
          </Typography>
          {tagParts.length > 0 ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {tagParts.map((t) => (
                <Box
                  key={t}
                  component="span"
                  sx={{
                    fontSize: "0.66rem",
                    bgcolor: OD.sur2,
                    border: `0.5px solid ${OD.brd}`,
                    px: 1.25,
                    py: 0.375,
                    borderRadius: "6px",
                    color: OD.tx2,
                  }}
                >
                  {t}
                </Box>
              ))}
            </Stack>
          ) : null}
          {ordervariant?.title && ordervariant?.title !== "Default Title" ? (
            <Chip label={ordervariant.title} size="small" sx={{ mr: 0.5, mb: 0.5, height: 24, fontSize: "0.65rem" }} />
          ) : null}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mt: 1.25, pt: 1.25, borderTop: `0.5px solid ${OD.brd}`, flexWrap: "wrap" }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: VENDOR_AVATAR_GRADIENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.69rem",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {(order.vendorName || orderDetails.vendorName || order?.product?.type?.name || "ب").charAt(0)}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: OD.tx }}>
                {order.vendorName || orderDetails.vendorName || order?.product?.type?.name || "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>البائع</Typography>
            </Box>
            {order.sku ? (
              <Chip
                label={`كود: ${order.sku}`}
                size="small"
                sx={{ height: 24, fontSize: "0.625rem", fontWeight: 700, bgcolor: OD.al, color: OD.accent }}
              />
            ) : null}
          </Stack>
          {lineProductDescription ? (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `0.5px solid ${OD.brd}` }} textAlign="right">
              <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, mb: 0.5, fontWeight: 600 }}>
                وصف المنتج
              </Typography>
              <Typography sx={{ fontSize: "0.81rem", color: OD.tx, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {lineProductDescription}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Stack>
    </SectionCard>
  );
}
