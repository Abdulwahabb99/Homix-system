import React from "react";
import { Box, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailInfo } from "query/shipmentDetail";
import { FONT, getPaymentBadgeColors, getTypeBadgeColors } from "../constants";
import { fmtDate } from "../utils";
import { StatusBadge, PlainBadge } from "./Badges";

/** The summary strip under the top bar: number + badges on one side, days counter on the other. */
export default function ShipmentHeaderStrip({ shipment }: { shipment: ShipmentDetailInfo }) {
  const shipNumber = shipment.shipmentNumber || `SH-${shipment.id}`;
  const pay = getPaymentBadgeColors(shipment.paymentStatus);
  const type = getTypeBadgeColors(shipment.shipmentType);

  return (
    <Box sx={{
      bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`,
      p: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "10px", color: HX.tx3, mb: "2px" }}>رقم الشحنة</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: "20px", fontWeight: 900, color: HX.accent, lineHeight: 1.1 }}>
            {shipNumber}
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, mt: "3px" }}>
            {shipment.operationNumber ? `OP-${shipment.operationNumber}` : ""} {shipment.orderNumber ? `· طلب #${shipment.orderNumber}` : ""}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <StatusBadge status={shipment.shipmentStatus} label={shipment.shipmentStatusLabel} />
            <PlainBadge label={shipment.paymentStatusLabel} bg={pay.bg} color={pay.color} />
            <PlainBadge label={shipment.shipmentTypeLabel} bg={type.bg} color={type.color} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>
            استلام المخزن: {fmtDate(shipment.receivedInWarehouseDate)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>عداد الأيام</Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px", bgcolor: HX.amberLight, color: "#92400e", px: "14px", py: "6px", borderRadius: "8px", fontFamily: FONT, fontSize: "14px", fontWeight: 800 }}>
          <AccessTimeIcon sx={{ fontSize: 15 }} /> {shipment.daysCounter ?? 0} يوم
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: "10px", color: HX.tx3 }}>
          موعد التسليم: {fmtDate(shipment.scheduledDeliveryDate)}
        </Typography>
      </Box>
    </Box>
  );
}
