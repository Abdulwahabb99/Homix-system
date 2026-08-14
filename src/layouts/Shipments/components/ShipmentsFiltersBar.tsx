import React, { useEffect, useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { SHIPMENT_STATUS_VALUES, SHIPMENT_TYPE_VALUES } from "shared/utils/constants";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentsMeta } from "query/shipmentsMeta";
import ShippingCompanySelect from "./ShipmentEdit/ShippingCompanySelect";
import MultiSelect from "components/MultiSelect/MultiSelect";

const FONT = "'Cairo', sans-serif";

export interface FilterValues {
  operationCode: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shipmentStatus: string;
  paymentStatus: string;
  shipmentType: string;
  deliveryBy: string;
  shippingCompany: string;
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
  const normalizedOptions = options.map((option) => ({
    label: option.label,
    value: String(option.value),
  }));
  const selectedValues = value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography component="label" sx={{
        display: "block", mb: "4px", color: HX.tx2,
        fontFamily: FONT, fontSize: "11px", fontWeight: 600,
      }}>
        {label}
      </Typography>
      <MultiSelect<string>
        value={selectedValues}
        onChange={(next) => onChange(next.join(","))}
        options={normalizedOptions}
        placeholder="الكل"
      />
    </Box>
  );
}

export default function ShipmentsFiltersBar({
  defaultValues,
  meta,
  isVendor,
  onApply,
  onReset,
}: ShipmentsFiltersBarProps) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<FilterValues>(defaultValues);

  // أعِد المزامنة عند تغيّر القيم الخارجية (إعادة ضبط / تنقّل بالرابط)
  const defKey = JSON.stringify(defaultValues);
  useEffect(() => {
    setVals(defaultValues);
  }, [defKey]);

  const setSelect = (field: keyof FilterValues) => (v: any) => {
    const next = { ...vals, [field]: v };
    setVals(next);
  };
  const setText = (field: keyof FilterValues) => (v: any) => {
    const next = { ...vals, [field]: v };
    setVals(next);
  };
  const handleDatesChange = (start: any, end: any) => {
    const next = { ...vals, startDate: start, endDate: end };
    setVals(next);
  };
  const handleDateReset = () => {
    const next = { ...vals, startDate: null, endDate: null };
    setVals(next);
  };

  const handleReset = () => {
    const empty: FilterValues = {
      operationCode: "", orderNumber: "", customerName: "", customerPhone: "",
      shipmentStatus: "", paymentStatus: "", shipmentType: "",
      deliveryBy: "", shippingCompany: "", scheduleStatus: "", vendorName: "",
      startDate: null, endDate: null,
    };
    setVals(empty);
    onReset();
  };

  const handleApply = () => onApply(vals);

  const shipmentStatuses = meta?.shipmentStatuses ?? SHIPMENT_STATUS_VALUES;
  const shipmentTypes    = meta?.shipmentTypes    ?? SHIPMENT_TYPE_VALUES;
  const paymentStatuses  = meta?.paymentStatuses  ?? [
    { value: 1, label: "الدفع عند الاستلام" },
    { value: 2, label: "مدفوع" },
  ];
  const deliveryByOptions = meta?.deliveryByOptions ?? [];
  const scheduleStatuses  = meta?.scheduleStatuses  ?? [];

  const selectedCount = (value: string) => value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
  const activeCount =
    [vals.operationCode, vals.orderNumber, vals.customerName, vals.customerPhone, vals.vendorName]
      .filter(Boolean).length
    + selectedCount(vals.shipmentStatus)
    + selectedCount(vals.paymentStatus)
    + (isVendor ? 0 : selectedCount(vals.shipmentType))
    + selectedCount(vals.deliveryBy)
    + selectedCount(vals.shippingCompany)
    + selectedCount(vals.scheduleStatus)
    + (vals.startDate || vals.endDate ? 1 : 0);

  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        overflow: "hidden",
      }}
    >
      {/* Collapsible header */}
      <Box
        onClick={() => setOpen((p) => !p)}
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          p: "12px 16px", cursor: "pointer", userSelect: "none",
          borderBottom: open ? `0.5px solid ${HX.border}` : "none",
          "&:hover": { bgcolor: HX.surface2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FilterAltIcon sx={{ fontSize: 15, color: HX.accent }} />
          <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
            الفلاتر
          </Box>
          {activeCount > 0 && (
            <Box component="span" sx={{
              fontSize: "10.5px", bgcolor: HX.accent, color: "#fff",
              px: "9px", py: "2px", borderRadius: "10px", fontWeight: 700, fontFamily: FONT,
            }}>
              {activeCount} فلتر نشط
            </Box>
          )}
        </Box>
        <Box sx={{
          width: 22, height: 22, borderRadius: "50%", bgcolor: HX.surface2,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: ".25s", transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <KeyboardArrowDownIcon sx={{ fontSize: 15, color: HX.tx3 }} />
        </Box>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
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
              onChange={setText("operationCode")}
            />
            <FilterInput
              placeholder="بحث برقم الطلب..."
              value={vals.orderNumber}
              onChange={setText("orderNumber")}
            />
            <FilterInput
              placeholder="بحث باسم العميل..."
              value={vals.customerName}
              onChange={setText("customerName")}
            />
            <FilterInput
              placeholder="بحث برقم هاتف العميل..."
              value={vals.customerPhone}
              onChange={setText("customerPhone")}
            />

            <FilterSelect
              label="كل الحالات"
              value={vals.shipmentStatus}
              options={shipmentStatuses}
              onChange={setSelect("shipmentStatus")}
            />

            <FilterSelect
              label="حالة الدفع"
              value={vals.paymentStatus}
              options={paymentStatuses}
              onChange={setSelect("paymentStatus")}
            />

            {!isVendor && (
              <FilterSelect
                label="نوع الشحنة"
                value={vals.shipmentType}
                options={shipmentTypes}
                onChange={setSelect("shipmentType")}
              />
            )}

            <FilterSelect
              label="التوصيل بواسطة"
              value={vals.deliveryBy}
              options={deliveryByOptions}
              onChange={setSelect("deliveryBy")}
            />

            <ShippingCompanySelect
              value={vals.shippingCompany}
              onChange={setSelect("shippingCompany")}
              sx={{
                "& .MuiOutlinedInput-root": { minHeight: "38px", height: 38 },
                "& .MuiOutlinedInput-root .MuiAutocomplete-input": { py: 0 },
              }}
            />

            <FilterSelect
              label="حالة الجدولة"
              value={vals.scheduleStatus}
              options={scheduleStatuses}
              onChange={setSelect("scheduleStatus")}
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

          {/* Row 2: all draft filters are committed only from the apply button. */}
          <Box sx={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button
              size="small"
              onClick={handleReset}
              startIcon={<RestartAltIcon sx={{ fontSize: "14px !important" }} />}
              sx={{
                px: "14px", height: 34, borderRadius: "8px",
                border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
                color: HX.tx2, fontSize: "12.5px", textTransform: "none",
                fontFamily: FONT, fontWeight: 600, whiteSpace: "nowrap",
                transition: ".15s", "&:hover": { bgcolor: HX.surface3, borderColor: HX.accent, color: HX.accent },
              }}
            >
              إعادة ضبط
            </Button>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={handleApply}
              startIcon={<FilterAltIcon sx={{ fontSize: "14px !important" }} />}
              sx={{
                px: "16px", height: 34, borderRadius: "8px",
                bgcolor: HX.accent, color: "#fff", fontSize: "12.5px",
                fontFamily: FONT, fontWeight: 600, textTransform: "none",
                "&:hover": { bgcolor: "#5254e0" },
              }}
            >
              تطبيق الفلاتر
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
