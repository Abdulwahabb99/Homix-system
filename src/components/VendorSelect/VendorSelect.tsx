import React, { useMemo } from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useVendorOptions, type VendorOption } from "query/vendors";

const FONT = "'Cairo', sans-serif";

/** نفس مظهر ShippingCompanySelect: زوايا 10px، نص 12px، حد يتحوّل accent عند التركيز. */
const acSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: FONT,
    fontSize: "12px",
    bgcolor: HX.surface,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiInputBase-input": { fontSize: "12px", fontFamily: FONT, color: "#000" },
  "& .MuiInputLabel-root": {
    fontFamily: FONT,
    fontSize: "12px",
    color: "#000",
    "&.MuiInputLabel-shrink": { fontSize: "11px" },
    "&.Mui-focused": { color: HX.accent },
  },
} as const;

export interface VendorSelectProps {
  /** معرّف المورد المختار كنص، أو "" لعدم التحديد. */
  value: string;
  /** تُستدعى بالمعرّف والخيار كاملاً — بعض الـ APIs تنتظر الاسم لا المعرّف. */
  onChange: (value: string, option: VendorOption | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** أنماط إضافية تُدمج فوق المظهر الافتراضي (لتصغير الارتفاع داخل أشرطة الفلاتر). */
  sx?: SxProps<Theme>;
}

/**
 * قائمة اختيار المورد المشتركة مع بحث — تجلب `GET /vendors` عبر useVendorOptions.
 * استخدمها في أي مكان يحتاج اختيار مورد بدل تكرار Autocomplete + الجلب.
 */
export default function VendorSelect({
  value,
  onChange,
  label = "اسم البائع",
  placeholder,
  disabled,
  sx,
}: VendorSelectProps) {
  const { options, isLoading } = useVendorOptions();

  // القيمة قد تكون معرّفاً أو اسماً (مثلاً فلتر قديم محفوظ) — طابقها على الاثنين.
  const selected = useMemo<VendorOption | null>(() => {
    if (!value) return null;
    return (
      options.find((o) => o.value === String(value)) ??
      options.find((o) => o.label === value) ??
      null
    );
  }, [options, value]);

  return (
    <Autocomplete<VendorOption>
      fullWidth
      size="small"
      disabled={disabled}
      loading={isLoading}
      options={options}
      value={selected}
      getOptionLabel={(o) => o?.label ?? ""}
      isOptionEqualToValue={(o, v) => o.value === v?.value}
      onChange={(_, opt) => onChange(opt ? opt.value : "", opt)}
      noOptionsText="لا يوجد موردون"
      loadingText="جارٍ التحميل…"
      sx={[acSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])] as SxProps<Theme>}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputLabelProps={{ shrink: true }}
        />
      )}
    />
  );
}
