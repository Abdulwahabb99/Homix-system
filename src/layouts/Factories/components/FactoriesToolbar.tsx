/**
 * شريط الفلاتر + مبدّل العرض (جدول / بطاقات).
 * الفلاتر تُطبَّق مباشرة عند التغيير كما في التصميم؛ زر «تطبيق» يعيد التطبيق
 * فوراً (مفيد بعد الكتابة) و«إعادة ضبط» يُفرّغ الكل.
 */
import React from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { SPEC_OPTIONS, STATUS_OPTIONS } from "../utils/constants";
import {
  filterBarSx, filterBtnSx, filterFieldSx, filterSepSx,
  viewToggleBtnSx, viewToggleSx, FONT,
} from "../utils/styles";
import { FactoriesView, FactoryFilters, FactorySpec, FactoryStatus } from "../utils/types";

export interface FactoriesToolbarProps {
  filters: FactoryFilters;
  onFilterChange: <K extends keyof FactoryFilters>(key: K, value: FactoryFilters[K]) => void;
  onReset: () => void;
  view: FactoriesView;
  onViewChange: (v: FactoriesView) => void;
}

const VIEWS: { key: FactoriesView; label: string; icon: React.ReactNode }[] = [
  { key: "table", label: "جدول", icon: <TableRowsOutlinedIcon /> },
  { key: "cards", label: "بطاقات", icon: <GridViewOutlinedIcon /> },
];

export default function FactoriesToolbar({
  filters, onFilterChange, onReset, view, onViewChange,
}: FactoriesToolbarProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <Box sx={filterBarSx}>
        <TextField
          size="small"
          placeholder="بحث باسم المصنع أو العنوان..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          sx={{ ...filterFieldSx, width: { xs: "100%", sm: 220 } }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ fontSize: 14, color: HX.tx3, marginInlineEnd: "6px", flexShrink: 0 }} />
            ),
          }}
        />

        <Box sx={filterSepSx} />

        <TextField
          select
          size="small"
          value={filters.spec}
          onChange={(e) => onFilterChange("spec", e.target.value as FactorySpec | "")}
          sx={{ ...filterFieldSx, minWidth: 150 }}
        >
          <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>كل التخصصات</MenuItem>
          {SPEC_OPTIONS.map((s) => (
            <MenuItem key={s} value={s} sx={{ fontFamily: FONT, fontSize: "12px" }}>{s}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={filters.status === "" ? "" : String(filters.status)}
          onChange={(e) =>
            onFilterChange("status", e.target.value === "" ? "" : (Number(e.target.value) as FactoryStatus))
          }
          sx={{ ...filterFieldSx, minWidth: 130 }}
        >
          <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>كل الحالات</MenuItem>
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={String(o.value)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={filterSepSx} />

        <Box
          component="button"
          type="button"
          onClick={() => onFilterChange("search", filters.search)}
          sx={filterBtnSx(true)}
        >
          تطبيق
        </Box>
        <Box component="button" type="button" onClick={onReset} sx={filterBtnSx(false)}>
          إعادة ضبط
        </Box>
      </Box>

      <Box sx={viewToggleSx}>
        {VIEWS.map((v) => (
          <Box
            key={v.key}
            component="button"
            type="button"
            onClick={() => onViewChange(v.key)}
            sx={viewToggleBtnSx(view === v.key)}
          >
            {v.icon}
            {v.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
