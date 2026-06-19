import React from "react";
import { Box } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { DELIVERY_BY_OPTIONS, PAYMENT_OPTIONS } from "../constants";
import SectionCard from "./SectionCard";
import { Field, SelectInput, TextInput } from "./FormField";

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
  const grid2 = { display: "grid", gap: "12px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mb: "14px" } as const;
  return (
    <SectionCard title="الشحن والدفع" subtitle="تفاصيل الدفع والتوصيل والمبالغ" icon={<LocalShippingOutlinedIcon />} iconBg={HX.tealLight} iconColor={HX.teal}>
      <Box sx={grid2}>
        <Field label="طريقة الدفع" required>
          <SelectInput value={props.paymentStatus} onChange={props.setPaymentStatus} options={PAYMENT_OPTIONS} />
        </Field>
        <Field label="التوصيل بواسطة">
          <SelectInput value={props.deliveryBy} onChange={props.setDeliveryBy} options={DELIVERY_BY_OPTIONS} />
        </Field>
      </Box>

      <Box sx={grid2}>
        <Field label="تاريخ الطلب">
          <TextInput value={props.orderDate} onChange={props.setOrderDate} type="date" />
        </Field>
        <Field label="تاريخ التسليم المتوقع">
          <TextInput value={props.expectedDeliveryDate} onChange={props.setExpectedDeliveryDate} type="date" />
        </Field>
      </Box>

      <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
        <Field label="تكلفة الشحن">
          <TextInput value={props.shippingFees} onChange={props.setShippingFees} placeholder="0" type="number" />
        </Field>
        <Field label="جدية الشراء (المقدم)">
          <TextInput value={props.downPayment} onChange={props.setDownPayment} placeholder="0" type="number" />
        </Field>
        <Field label="المبلغ المطلوب تحصيله">
          <TextInput value={props.toBeCollected} onChange={props.setToBeCollected} placeholder="يُحسب تلقائياً" type="number" />
        </Field>
      </Box>
    </SectionCard>
  );
}
