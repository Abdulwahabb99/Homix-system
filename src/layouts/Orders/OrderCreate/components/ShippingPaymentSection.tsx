import React from "react";
import { Box } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { DELIVERY_BY_OPTIONS, PAYMENT_OPTIONS } from "../constants";
import SectionCard from "./SectionCard";
import { SelectInput, TextInput } from "./FormField";

export interface ShippingPaymentSectionProps {
  orderDate: string;
  setOrderDate: (v: string) => void;
  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (v: string) => void;
  paymentStatus: number;
  setPaymentStatus: (v: number) => void;
  deliveryBy: number;
  setDeliveryBy: (v: number) => void;
  downPayment: string;
  setDownPayment: (v: string) => void;
  shippingFees: string;
  setShippingFees: (v: string) => void;
  toBeCollected: string;
  setToBeCollected: (v: string) => void;
}

/** الشحن والدفع — يطابق حقول الـ API (paymentStatus, deliveryBy, dates, fees…). */
export default function ShippingPaymentSection(props: ShippingPaymentSectionProps) {
  const grid2 = { display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mb: "14px" } as const;
  return (
    <SectionCard title="الشحن والدفع" subtitle="تفاصيل الدفع والتوصيل والمبالغ" icon={<LocalShippingOutlinedIcon />} iconBg={HX.tealLight} iconColor={HX.teal}>
      <Box sx={grid2}>
        <SelectInput label="طريقة الدفع" required value={props.paymentStatus} onChange={props.setPaymentStatus} options={PAYMENT_OPTIONS} />
        <SelectInput label="شركات الشحن" value={props.deliveryBy} onChange={props.setDeliveryBy} options={DELIVERY_BY_OPTIONS} />
      </Box>

      <Box sx={grid2}>
        <TextInput label="تاريخ الطلب" value={props.orderDate} onChange={props.setOrderDate} type="date" />
        <TextInput label="تاريخ التسليم المتوقع" value={props.expectedDeliveryDate} onChange={props.setExpectedDeliveryDate} type="date" />
      </Box>

      <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
        <TextInput label="تكلفة الشحن" value={props.shippingFees} onChange={props.setShippingFees} type="number" inputProps={{ min: 0 }} />
        <TextInput label="جدية الشراء (المقدم)" value={props.downPayment} onChange={props.setDownPayment} type="number" inputProps={{ min: 0 }} />
        <TextInput label="المبلغ المطلوب تحصيله" value={props.toBeCollected} onChange={props.setToBeCollected} type="number" inputProps={{ min: 0 }} />
      </Box>
    </SectionCard>
  );
}
