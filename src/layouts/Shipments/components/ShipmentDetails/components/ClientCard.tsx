import React from "react";
import { Box, Typography } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailCustomer, ShipmentDetailInfo } from "query/shipmentDetail";
import { FONT } from "../constants";
import { getInitial } from "../utils";
import DetailCard from "./DetailCard";
import InfoRow from "./InfoRow";

export interface ClientCardProps {
  customer: ShipmentDetailCustomer;
  shipment: ShipmentDetailInfo;
}

/** Customer summary: avatar + name, phone and address. */
export default function ClientCard({ customer, shipment }: ClientCardProps) {
  const name = customer?.name || shipment.customerName || "—";
  return (
    <DetailCard title="بيانات العميل" icon={<PersonOutlineOutlinedIcon />}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px", pb: "12px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)", flexShrink: 0 }}>
          {getInitial(name)}
        </Box>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 800, color: HX.tx }}>{name}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>عميل</Typography>
        </Box>
      </Box>
      <InfoRow icon={<PhoneOutlinedIcon />} iconBg={HX.greenLight} iconColor={HX.green} label="الهاتف" value={customer?.phoneNumber || shipment.customerPhone || "—"} valueSx={{ fontFamily: "monospace", fontSize: "12px", color: HX.tx2 }} />
      <InfoRow icon={<PlaceOutlinedIcon />} iconBg={HX.amberLight} iconColor={HX.amber} label="العنوان" value={customer?.address || "—"} valueSx={{ fontSize: "11.5px" }} />
    </DetailCard>
  );
}
