import React, { useCallback, useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { CustomerForm } from "../types";
import SectionCard from "./SectionCard";
import { TextInput } from "./FormField";
import { useCustomersQuery, type CustomerListItem } from "query/customers";

export interface CustomerSectionProps {
  customer: CustomerForm;
  onChange: (field: keyof CustomerForm, value: string) => void;
  onSelect: (customer: CustomerListItem) => void;
}

const PHONE_INPUT_PROPS = { dir: "ltr" } as const;

/** بيانات العميل وعنوان الشحن — تُحفظ مع العميل في الطلب المانوال. */
export default function CustomerSection({ customer, onChange, onSelect }: CustomerSectionProps) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const timer = setTimeout(() => setDebounced(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
  const matches = useCustomersQuery({ search: debounced, page: 1, size: 8 }, debounced.length >= 2);
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
      <Box sx={{ mb: 2 }}>
        <TextField fullWidth size="small" label="ابحث عن عميل موجود" placeholder="الاسم أو رقم الهاتف أو البريد الإلكتروني" value={search} onChange={(event) => setSearch(event.target.value)} />
        {debounced.length >= 2 && <Box role="listbox" aria-label="نتائج بحث العملاء" sx={{ mt: 1, maxHeight: 210, overflowY: "auto", border: `1px solid ${HX.border}`, borderRadius: 2 }}>
          {matches.isLoading ? <Box sx={{ p: 1.5, fontSize: 12 }}>جارٍ البحث…</Box>
            : !matches.data?.items.length ? <Box sx={{ p: 1.5, fontSize: 12 }}>لا يوجد عميل مطابق؛ يمكنك إدخال بيانات عميل جديد.</Box>
            : matches.data.items.map((item) => <Box key={item.id} component="button" type="button" role="option" aria-selected={customer.existingCustomerId === item.id}
              onClick={() => { onSelect(item); setSearch(""); setDebounced(""); }}
              sx={{ display: "block", width: "100%", textAlign: "right", p: 1.25, bgcolor: customer.existingCustomerId === item.id ? HX.accentLight : HX.surface, border: "none", borderBottom: `1px solid ${HX.border}`, cursor: "pointer", fontFamily: "'Cairo', sans-serif", "&:hover": { bgcolor: HX.accentLight } }}>
              <strong>{`${item.firstName} ${item.lastName}`.trim()}</strong> · {item.phoneNumber || item.email || "—"}
            </Box>)}
        </Box>}
        {customer.existingCustomerId && <Box sx={{ mt: 1, fontSize: 12, color: HX.green }}>تم اختيار عميل موجود #{customer.existingCustomerId}. تعديل البيانات أدناه يلغي الاختيار ويُنشئ عميلًا جديدًا.</Box>}
      </Box>
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
