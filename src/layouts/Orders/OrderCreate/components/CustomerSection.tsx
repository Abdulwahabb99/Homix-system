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

/** بيانات العميل وعنوان الشحن — تُحفظ مع العميل في الطلب المانوال. */
export default function CustomerSection({ customer, onChange }: CustomerSectionProps) {
  const changeFirstName = useCallback((value: string) => onChange("firstName", value), [onChange]);
  const changeLastName = useCallback((value: string) => onChange("lastName", value), [onChange]);
  const changePhone = useCallback((value: string) => onChange("phone", value), [onChange]);
  const changeEmail = useCallback((value: string) => onChange("email", value), [onChange]);
  const changeAddress1 = useCallback((value: string) => onChange("address1", value), [onChange]);
  const changeAddress2 = useCallback((value: string) => onChange("address2", value), [onChange]);
  const changeCity = useCallback((value: string) => onChange("city", value), [onChange]);
  const changeProvince = useCallback((value: string) => onChange("province", value), [onChange]);
  const changeCountry = useCallback((value: string) => onChange("country", value), [onChange]);

  return (
    <SectionCard title="بيانات العميل وعنوان الشحن" subtitle="بيانات التواصل والعنوان الذي سيتم التسليم إليه" icon={<PersonOutlineOutlinedIcon />} iconBg={HX.blueLight} iconColor={HX.blue} required>
      <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <TextInput label="الاسم الأول" required value={customer.firstName} onChange={changeFirstName} />
        <TextInput label="اسم العائلة" value={customer.lastName} onChange={changeLastName} />
        <TextInput label="رقم الهاتف" required value={customer.phone} onChange={changePhone} inputProps={PHONE_INPUT_PROPS} />
        <TextInput label="البريد الإلكتروني" value={customer.email} onChange={changeEmail} inputProps={{ dir: "ltr" }} />
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <TextInput label="العنوان" value={customer.address1} onChange={changeAddress1} />
        </Box>
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <TextInput label="تفاصيل العنوان" value={customer.address2} onChange={changeAddress2} placeholder="رقم العقار، الدور، الشقة أو علامة مميزة" />
        </Box>
        <TextInput label="المدينة / المنطقة" value={customer.city} onChange={changeCity} />
        <TextInput label="المحافظة" value={customer.province} onChange={changeProvince} />
        <TextInput label="الدولة" value={customer.country} onChange={changeCountry} />
      </Box>
    </SectionCard>
  );
}
