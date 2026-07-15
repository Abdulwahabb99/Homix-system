/**
 * شريط فلاتر الموردين: بحث + فلتر الحالة + (تطبيق/إعادة ضبط).
 * الفلترة فورية من جانب العميل؛ «تطبيق» موجود للتوافق مع التصميم.
 */
import React from "react";
import { Box } from "@mui/material";
import { filterBarSx, searchInputSx, selectSx, filterSepSx, filterBtnSx } from "../utils/styles";
import { STATUS_FILTERS } from "../utils/constants";
import { VendorStatusFilter } from "../utils/types";

interface VendorsFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  status: VendorStatusFilter;
  onStatus: (v: VendorStatusFilter) => void;
  onReset: () => void;
}

export default function VendorsFilterBar({ search, onSearch, status, onStatus, onReset }: VendorsFilterBarProps) {
  return (
    <Box sx={filterBarSx}>
      <Box
        component="input"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        placeholder="بحث باسم المورد أو الإيميل..."
        sx={searchInputSx}
      />
      <Box sx={filterSepSx} />
      <Box
        component="select"
        value={status}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStatus(e.target.value as VendorStatusFilter)}
        sx={selectSx}
      >
        {STATUS_FILTERS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </Box>
      <Box sx={filterSepSx} />
      <Box component="button" type="button" onClick={() => { /* الفلترة فورية */ }} sx={filterBtnSx(true)}>تطبيق</Box>
      <Box component="button" type="button" onClick={onReset} sx={filterBtnSx(false)}>إعادة ضبط</Box>
    </Box>
  );
}
