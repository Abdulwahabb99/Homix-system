import React, { useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { SHIPMENT_STATUS_VALUES, SHIPMENT_TYPE_VALUES } from "shared/utils/constants";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentsMeta } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

export interface FilterValues {
  operationCode: string;
  customerName: string;
  customerPhone: string;
  shipmentStatus: string;
  paymentStatus: string;
  shipmentType: string;
  deliveryBy: string;
  scheduleStatus: string;
  vendorName: string;
  startDate: any;
  endDate: any;
}

export interface ShipmentsFiltersBarProps {
  defaultValues: FilterValues;
  meta: ShipmentsMeta | undefined;
  isVendor: boolean;
  onApply: (values: FilterValues) => void;
  onReset: () => void;
}

function FilterInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        bgcolor: HX.surface,
        border: `1px solid ${HX.border}`,
        borderRadius: "10px",
        px: "11px",
        height: 38,
        width: "100%",
        minWidth: 0,
        "&:focus-within": {
          borderColor: HX.accent,
          boxShadow: `0 0 0 2px ${HX.accentLight}`,
        },
      }}
    >
      <Box sx={{ color: HX.tx3, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <SearchIcon sx={{ fontSize: 15 }} />
      </Box>
      <Box
        component="input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
          border: "none",
          outline: "none",
          flex: 1,
          minWidth: 0,
          fontSize: "12px",
          fontFamily: FONT,
          color: "#000",
          bgcolor: "transparent",
          "&::placeholder": { color: HX.tx3, fontSize: "12px" },
        }}
      />
    </Box>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string | number }[];
  onChange: (v: string) => void;
}) {
  return (
    <FormControl size="small" sx={{ width: "100%", minWidth: 0 }}>
      <InputLabel
        sx={{
          fontFamily: FONT, fontSize: "12px", color: "#000",
          "&.MuiInputLabel-shrink": { fontSize: "11px" },
          "&.Mui-focused": { color: HX.accent },
        }}
      >
        {label}
      </InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label={label}
        sx={{
          fontFamily: FONT, fontSize: "12px", height: 38,
          bgcolor: HX.surface, borderRadius: "10px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
          "& .MuiSelect-select": { fontSize: "12px", fontFamily: FONT, color: "#000" },
        }}
        MenuProps={{ PaperProps: { sx: { fontFamily: FONT } } }}
      >
        <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>الكل</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={String(opt.value)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function ShipmentsFiltersBar({
  defaultValues,
  meta,
  isVendor,
  onApply,
  onReset,
}: ShipmentsFiltersBarProps) {
  const [vals, setVals] = useState<FilterValues>(defaultValues);

  const set = (field: keyof FilterValues) => (v: any) =>
    setVals((prev) => ({ ...prev, [field]: v }));

  const handleDatesChange = (start: any, end: any) =>
    setVals((prev) => ({ ...prev, startDate: start, endDate: end }));

  const handleDateReset = () =>
    setVals((prev) => ({ ...prev, startDate: null, endDate: null }));

  const handleApply = () => onApply(vals);

  const handleReset = () => {
    const empty: FilterValues = {
      operationCode: "", customerName: "", customerPhone: "",
      shipmentStatus: "", paymentStatus: "", shipmentType: "",
      deliveryBy: "", scheduleStatus: "", vendorName: "", startDate: null, endDate: null,
    };
    setVals(empty);
    onReset();
  };

  const shipmentStatuses = meta?.shipmentStatuses ?? SHIPMENT_STATUS_VALUES;
  const shipmentTypes    = meta?.shipmentTypes    ?? SHIPMENT_TYPE_VALUES;
  const paymentStatuses  = meta?.paymentStatuses  ?? [
    { value: 1, label: "الدفع عند الاستلام" },
    { value: 2, label: "مدفوع" },
  ];
  const deliveryByOptions = meta?.deliveryByOptions ?? [];
  const scheduleStatuses  = meta?.scheduleStatuses  ?? [];

  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        p: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Row 1: text inputs + selects — 8 per row on large screens */}
      <Box
        sx={{
          display: "grid",
          gap: "8px",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(4, 1fr)",
            md: "repeat(8, 1fr)",
          },
        }}
      >
        <FilterInput
          placeholder="بحث برقم العملية..."
          value={vals.operationCode}
          onChange={set("operationCode")}
        />
        <FilterInput
          placeholder="بحث باسم العميل..."
          value={vals.customerName}
          onChange={set("customerName")}
        />
        <FilterInput
          placeholder="بحث برقم هاتف العميل..."
          value={vals.customerPhone}
          onChange={set("customerPhone")}
        />

        <FilterSelect
          label="كل الحالات"
          value={vals.shipmentStatus}
          options={shipmentStatuses}
          onChange={set("shipmentStatus")}
        />

        <FilterSelect
          label="حالة الدفع"
          value={vals.paymentStatus}
          options={paymentStatuses}
          onChange={set("paymentStatus")}
        />

        {!isVendor && (
          <FilterSelect
            label="نوع الشحنة"
            value={vals.shipmentType}
            options={shipmentTypes}
            onChange={set("shipmentType")}
          />
        )}

        <FilterSelect
          label="التوصيل بواسطة"
          value={vals.deliveryBy}
          options={deliveryByOptions}
          onChange={set("deliveryBy")}
        />

        <FilterSelect
          label="حالة الجدولة"
          value={vals.scheduleStatus}
          options={scheduleStatuses}
          onChange={set("scheduleStatus")}
        />


        {/* Date range — part of the same grid, spans 2 cols on large screens */}
        <Box sx={{ gridColumn: { xs: "span 2", sm: "span 4", md: "span 2" } }}>
          <DateRangePickerWrapper
            startDate={vals.startDate}
            endDate={vals.endDate}
            allowPastDays={true}
            allowFutureDays={false}
            useDefaultPresets={true}
            handleDatesChange={handleDatesChange}
            onReset={handleDateReset}
          />
        </Box>
      </Box>

      {/* Row 2: action buttons */}
      <Box sx={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <Box
          component="button"
          type="button"
          onClick={handleReset}
          sx={{
            display: "flex", alignItems: "center", gap: "5px",
            px: "14px", height: 38, borderRadius: "10px",
            border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
            color: HX.tx2, cursor: "pointer", fontSize: "13px",
            fontFamily: FONT, fontWeight: 600, whiteSpace: "nowrap",
            transition: ".15s", "&:hover": { bgcolor: HX.surface3, borderColor: HX.accent, color: HX.accent },
          }}
        >
          <RestartAltIcon sx={{ fontSize: 16 }} />
          إعادة ضبط
        </Box>

        <Box
          component="button"
          type="button"
          onClick={handleApply}
          sx={{
            display: "flex", alignItems: "center", gap: "5px",
            px: "18px", height: 38, borderRadius: "10px",
            border: "none", bgcolor: HX.accent, color: "#fff",
            cursor: "pointer", fontSize: "13px", fontFamily: FONT,
            fontWeight: 700, whiteSpace: "nowrap",
            transition: ".15s", "&:hover": { bgcolor: "#4f46e5" },
          }}
        >
          <FilterAltIcon sx={{ fontSize: 16 }} />
          تطبيق
        </Box>
      </Box>
    </Box>
  );
}
