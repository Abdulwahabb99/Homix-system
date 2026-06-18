import React from "react";
import { Box, Typography } from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailFinancial, ShipmentDetailInfo } from "query/shipmentDetail";
import { FONT, getPaymentBadgeColors } from "../constants";
import { fmtNum } from "../utils";
import DetailCard from "./DetailCard";
import { PlainBadge } from "./Badges";

export interface FinancialsCardProps {
  financial: ShipmentDetailFinancial;
  shipment: ShipmentDetailInfo;
}

/** Financial breakdown: sale total, shipping, payment method, amount to collect. */
export default function FinancialsCard({ financial, shipment }: FinancialsCardProps) {
  const pay = getPaymentBadgeColors(shipment.paymentStatus);
  const rows = [
    { label: "إجمالي سعر البيع", value: `${fmtNum(financial.totalPrice)} ج.م` },
    { label: "تكلفة الشحن", value: `${fmtNum(financial.shippingCost)} ج.م` },
  ];

  return (
    <DetailCard title="التفاصيل المالية" icon={<ReceiptLongOutlinedIcon />} noPad>
      {rows.map((r) => (
        <Box key={r.label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "9px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2 }}>{r.label}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>{r.value}</Typography>
        </Box>
      ))}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "9px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2 }}>طريقة الدفع</Typography>
        <PlainBadge label={shipment.paymentStatusLabel} bg={pay.bg} color={pay.color} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "11px 16px", background: `linear-gradient(135deg, ${HX.accentLight}, rgba(99,102,241,0.03))`, borderTop: `0.5px solid ${HX.accentBorder}` }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: HX.tx }}>المبلغ المطلوب تحصيله</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: HX.accent }}>{fmtNum(financial.amountToCollect)} ج.م</Typography>
      </Box>
    </DetailCard>
  );
}
