import React from "react";
import { Box, Typography } from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailInfo, ShipmentDetailVendor } from "query/shipmentDetail";
import { FONT } from "../constants";
import { getInitial } from "../utils";
import DetailCard from "./DetailCard";

export interface SellerCardProps {
  vendor: ShipmentDetailVendor;
  shipment: ShipmentDetailInfo;
}

/** Vendor/seller summary card. */
export default function SellerCard({ vendor, shipment }: SellerCardProps) {
  const name = vendor?.name || shipment.sellerName || "—";
  return (
    <DetailCard title="البائع" icon={<StorefrontOutlinedIcon />}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Box sx={{ width: 38, height: 38, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg,#8c7355,#5a4530)", flexShrink: 0 }}>
          {getInitial(name)}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>{name}</Typography>
        </Box>
      </Box>
    </DetailCard>
  );
}
