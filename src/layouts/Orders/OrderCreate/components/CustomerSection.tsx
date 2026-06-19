import React from "react";
import { Box } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { CustomerForm } from "../types";
import SectionCard from "./SectionCard";
import { Field, TextInput } from "./FormField";

export interface CustomerSectionProps {
  customer: CustomerForm;
  onChange: (field: keyof CustomerForm, value: string) => void;
}

/** بيانات العميل — الاسم والهاتف (تطابق customer في الـ API). */
export default function CustomerSection({ customer, onChange }: CustomerSectionProps) {
  return (
    <SectionCard title="بيانات العميل" subtitle="اسم العميل ورقم التواصل" icon={<PersonOutlineOutlinedIcon />} iconBg={HX.blueLight} iconColor={HX.blue} required>
      <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <Field label="الاسم الأول" required>
          <TextInput value={customer.firstName} onChange={(v) => onChange("firstName", v)} placeholder="الاسم الأول" />
        </Field>
        <Field label="اسم العائلة">
          <TextInput value={customer.lastName} onChange={(v) => onChange("lastName", v)} placeholder="اسم العائلة" />
        </Field>
        <Field label="رقم الهاتف" required>
          <TextInput value={customer.phone} onChange={(v) => onChange("phone", v)} placeholder="01xxxxxxxxx" type="tel" />
        </Field>
      </Box>
    </SectionCard>
  );
}
