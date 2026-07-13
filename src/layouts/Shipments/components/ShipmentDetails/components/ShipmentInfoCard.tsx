import React from "react";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailInfo } from "query/shipmentDetail";
import { fmtDate } from "../utils";
import DetailCard from "./DetailCard";
import InfoRow from "./InfoRow";

/** Card with the shipment's key logistic fields. */
export default function ShipmentInfoCard({ shipment }: { shipment: ShipmentDetailInfo }) {
  return (
    <DetailCard title="تفاصيل الشحنة" icon={<LocalShippingOutlinedIcon />}>
      <InfoRow icon={<Inventory2OutlinedIcon />} iconBg={HX.accentLight} iconColor={HX.accent} label="رقم الشحنة" value={shipment.shipmentNumber || `SH-${shipment.id}`} valueSx={{ color: HX.accent, fontWeight: 800 }} />
      <InfoRow icon={<ReceiptLongOutlinedIcon />} iconBg={HX.greenLight} iconColor={HX.green} label="رقم الطلب" value={`#${shipment.orderNumber}`} />
      <InfoRow icon={<LocalShippingOutlinedIcon />} iconBg={HX.blueLight} iconColor={HX.blue} label="شركة الشحن" value={shipment.shippingCompany || "—"} valueSx={{ fontWeight: 800 }} />
      <InfoRow icon={<LocalShippingOutlinedIcon />} iconBg={HX.tealLight} iconColor={HX.teal} label="التوصيل بواسطة" value={shipment.deliveryBy || "—"} />
      <InfoRow icon={<AccessTimeIcon />} iconBg={HX.amberLight} iconColor={HX.amber} label="تاريخ الاستلام" value={fmtDate(shipment.receivedInWarehouseDate)} />
      <InfoRow icon={<CalendarTodayOutlinedIcon />} iconBg={HX.tealLight} iconColor={HX.teal} label="موعد الجدولة" value={fmtDate(shipment.scheduledDeliveryDate)} />
      <InfoRow icon={<CheckRoundedIcon />} iconBg={HX.greenLight} iconColor={HX.green} label="تاريخ التسليم" value={shipment.deliveryDate ? fmtDate(shipment.deliveryDate) : "لم يتم بعد"} valueSx={!shipment.deliveryDate ? { color: HX.tx3 } : {}} />
      <InfoRow icon={<PlaceOutlinedIcon />} iconBg={HX.purpleLight} iconColor={HX.purple} label="المحافظة" value={shipment.governorate || "—"} />
    </DetailCard>
  );
}
