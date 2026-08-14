import React, { useCallback } from "react";
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

const PHONE_INPUT_PROPS = { dir: "ltr" } as const;

/** بيانات العميل — الاسم والهاتف (تطابق customer في الـ API). */
export default function CustomerSection({ customer, onChange }: CustomerSectionProps) {
  const changeFirstName = useCallback((value: string) => onChange("firstName", value), [onChange]);
  const changeLastName = useCallback((value: string) => onChange("lastName", value), [onChange]);
  const changePhone = useCallback((value: string) => onChange("phone", value), [onChange]);

  return (
    <SectionCard title="بيانات العميل" subtitle="اسم العميل ورقم التواصل" icon={<PersonOutlineOutlinedIcon />} iconBg={HX.blueLight} iconColor={HX.blue} required>
      <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <TextInput label="الاسم الأول" required value={customer.firstName} onChange={changeFirstName} />
        <TextInput label="اسم العائلة" value={customer.lastName} onChange={changeLastName} />
        <TextInput label="رقم الهاتف" required value={customer.phone} onChange={changePhone} inputProps={PHONE_INPUT_PROPS} />
      </Box>
    </SectionCard>
  );
}
