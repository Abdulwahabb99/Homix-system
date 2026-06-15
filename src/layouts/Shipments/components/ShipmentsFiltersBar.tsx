import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { SHIPMENT_STATUS_VALUES, SHIPMENT_TYPE_VALUES, GOVERNORATES_VALUES } from "shared/utils/constants";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

function FilterInput({
  placeholder,
  value,
  onChange,
  leadingIcon,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  leadingIcon?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        bgcolor: HX.surface,
        border: `0.5px solid ${HX.border2}`,
        borderRadius: "10px",
        px: "10px",
        height: 38,
        "&:focus-within": {
          borderColor: HX.accent,
          boxShadow: `0 0 0 2px ${HX.accentLight}`,
        },
      }}
    >
      {leadingIcon && (
        <Box sx={{ color: HX.tx3, display: "flex", alignItems: "center", fontSize: 16, flexShrink: 0 }}>
          {leadingIcon}
        </Box>
      )}
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
          fontSize: "12.5px",
          fontFamily: FONT,
          color: HX.tx,
          bgcolor: "transparent",
          "&::placeholder": { color: HX.tx3 },
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
    <FormControl size="small" fullWidth>
      <InputLabel sx={{ fontFamily: FONT, fontSize: "12.5px", "&.MuiInputLabel-shrink": { fontSize: "12px" } }}>
        {label}
      </InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label={label}
        sx={{
          fontFamily: FONT,
          fontSize: "12.5px",
          height: 38,
          bgcolor: HX.surface,
          borderRadius: "10px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
        }}
        MenuProps={{ PaperProps: { sx: { fontFamily: FONT } } }}
      >
        <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12.5px" }}>
          الكل
        </MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={String(opt.value)} sx={{ fontFamily: FONT, fontSize: "12.5px" }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export interface ShipmentsFiltersBarProps {
  selectedShipmentStatus: string;
  selectedShipmentType: string;
  selectedGovernorate: string;
  orderNumber: string;
  shippingCompany: string;
  isVendor: boolean;
  startDate: any;
  endDate: any;
  onStatusChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onGovernorateChange: (v: string) => void;
  onOrderNumberChange: (v: string) => void;
  onShippingCompanyChange: (v: string) => void;
  onDatesChange: (start: any, end: any) => void;
  onDateReset?: () => void;
  onReset: () => void;
}

export default function ShipmentsFiltersBar({
  selectedShipmentStatus,
  selectedShipmentType,
  selectedGovernorate,
  orderNumber,
  shippingCompany,
  isVendor,
  startDate,
  endDate,
  onStatusChange,
  onTypeChange,
  onGovernorateChange,
  onOrderNumberChange,
  onShippingCompanyChange,
  onDatesChange,
  onDateReset,
  onReset,
}: ShipmentsFiltersBarProps) {
  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        p: "14px 16px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <Box sx={{ minWidth: 140, flex: "1 1 140px" }}>
        <FilterInput
          placeholder="رقم الشحنة"
          value={orderNumber}
          onChange={onOrderNumberChange}
          leadingIcon={<SearchIcon sx={{ fontSize: 16 }} />}
        />
      </Box>

      <Box sx={{ minWidth: 140, flex: "1 1 140px" }}>
        <FilterInput
          placeholder="شركة الشحن"
          value={shippingCompany}
          onChange={onShippingCompanyChange}
        />
      </Box>

      <Box sx={{ minWidth: 140, flex: "1 1 140px" }}>
        <FilterSelect
          label="حالة الشحنة"
          value={selectedShipmentStatus}
          options={SHIPMENT_STATUS_VALUES}
          onChange={onStatusChange}
        />
      </Box>

      {!isVendor && (
        <Box sx={{ minWidth: 130, flex: "1 1 130px" }}>
          <FilterSelect
            label="نوع الشحنة"
            value={selectedShipmentType}
            options={SHIPMENT_TYPE_VALUES}
            onChange={onTypeChange}
          />
        </Box>
      )}

      {!isVendor && (
        <Box sx={{ minWidth: 130, flex: "1 1 130px" }}>
          <FilterSelect
            label="المحافظة"
            value={selectedGovernorate}
            options={GOVERNORATES_VALUES}
            onChange={onGovernorateChange}
          />
        </Box>
      )}

      <Box sx={{ minWidth: 200, flex: "1 1 200px" }}>
        <DateRangePickerWrapper
          startDate={startDate}
          endDate={endDate}
          allowPastDays={true}
          allowFutureDays={false}
          useDefaultPresets={true}
          handleDatesChange={onDatesChange}
          onReset={onDateReset}
        />
      </Box>

      <Box
        component="button"
        type="button"
        onClick={onReset}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          px: "14px",
          height: 38,
          borderRadius: "10px",
          border: `1px solid ${HX.border2}`,
          bgcolor: HX.surface,
          color: HX.tx2,
          cursor: "pointer",
          fontSize: "12.5px",
          fontFamily: FONT,
          fontWeight: 600,
          whiteSpace: "nowrap",
          flexShrink: 0,
          transition: ".15s",
          "&:hover": { bgcolor: HX.surface3, borderColor: HX.accent, color: HX.accent },
        }}
      >
        <RestartAltIcon sx={{ fontSize: 16 }} />
        إعادة ضبط
      </Box>
    </Box>
  );
}
