import React from "react";
import { Box } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { CustomerForm } from "../types";
import SectionCard from "./SectionCard";
import { TextInput } from "./FormField";

export interface CustomerSectionProps {
  customer: CustomerForm;
  onChange: (field: keyof CustomerForm, value: string) => void;
}

/** بيانات العميل — الاسم والهاتف (تطابق customer في الـ API). */
export default function CustomerSection({ customer, onChange }: CustomerSectionProps) {
  return (
    <SectionCard title="بيانات العميل" subtitle="اسم العميل ورقم التواصل" icon={<PersonOutlineOutlinedIcon />} iconBg={HX.blueLight} iconColor={HX.blue} required>
      <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <TextInput label="الاسم الأول" required value={customer.firstName} onChange={(v) => onChange("firstName", v)} />
        <TextInput label="اسم العائلة" value={customer.lastName} onChange={(v) => onChange("lastName", v)} />
        <TextInput label="رقم الهاتف" required value={customer.phone} onChange={(v) => onChange("phone", v)} inputProps={{ dir: "ltr" }} />
      </Box>
    </SectionCard>
  );
}
