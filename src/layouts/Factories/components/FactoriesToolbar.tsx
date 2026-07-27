/**
 * شريط الفلاتر + مبدّل العرض. خيارات التخصّص والحالة من `GET /factories/meta`،
 * والفلترة تُرسل للخادم (القوائم فوراً، البحث بعد تهدئة الكتابة).
 */
import React from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { FactoriesMeta } from "query/factoriesMeta";
import { ALL_SPECIALTIES_LABEL, ALL_STATUSES_LABEL } from "../utils/constants";
import {
  filterBarSx, filterBtnSx, filterFieldSx, filterSepSx,
  viewToggleBtnSx, viewToggleSx, FONT,
} from "../utils/styles";
import { FactoriesView, FactoryFilters } from "../utils/types";

export interface FactoriesToolbarProps {
  meta: FactoriesMeta | undefined;
  filters: FactoryFilters;
  onFilterChange: <K extends keyof FactoryFilters>(key: K, value: FactoryFilters[K]) => void;
  onApply: () => void;
  onReset: () => void;
  view: FactoriesView;
  onViewChange: (v: FactoriesView) => void;
}

const VIEWS: { key: FactoriesView; label: string; icon: React.ReactNode }[] = [
  { key: "table", label: "جدول", icon: <TableRowsOutlinedIcon /> },
  { key: "cards", label: "بطاقات", icon: <GridViewOutlinedIcon /> },
];

export default function FactoriesToolbar({
  meta, filters, onFilterChange, onApply, onReset, view, onViewChange,
}: FactoriesToolbarProps) {
  const specialties = meta?.specialties ?? [];
  const statuses = meta?.statuses ?? [];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <Box sx={filterBarSx}>
        <TextField
          size="small"
          placeholder="بحث بالاسم، العنوان، المسؤول أو رقمه..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          sx={{ ...filterFieldSx, width: { xs: "100%", sm: 260 } }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ fontSize: 14, color: HX.tx3, marginInlineEnd: "6px", flexShrink: 0 }} />
            ),
          }}
        />

        <Box sx={filterSepSx} />

        {/*
          displayEmpty + renderValue يضمنان ظهور «الكل» كقيمة افتراضية في كل
          الحالات — حتى قبل وصول الـ meta حين لا يوجد خيار مطابق للقيمة الفارغة.
        */}
        <TextField
          select
          size="small"
          value={filters.factoryCategory}
          onChange={(e) => onFilterChange("factoryCategory", e.target.value)}
          sx={{ ...filterFieldSx, minWidth: 160 }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (v) =>
              v ? (
                <Box component="span" sx={{ color: HX.tx }}>{String(v)}</Box>
              ) : (
                <Box component="span" sx={{ color: HX.tx2 }}>{ALL_SPECIALTIES_LABEL}</Box>
              ),
          }}
        >
          <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>
            {ALL_SPECIALTIES_LABEL}
          </MenuItem>
          {specialties.map((s) => (
            <MenuItem key={s.id} value={s.value} sx={{ fontFamily: FONT, fontSize: "12px" }}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={filters.status === "" ? "" : String(filters.status)}
          onChange={(e) =>
            onFilterChange("status", e.target.value === "" ? "" : Number(e.target.value))
          }
          sx={{ ...filterFieldSx, minWidth: 140 }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (v) => {
              if (v === "" || v == null) {
                return <Box component="span" sx={{ color: HX.tx2 }}>{ALL_STATUSES_LABEL}</Box>;
              }
              const match = statuses.find((s) => String(s.value) === String(v));
              return <Box component="span" sx={{ color: HX.tx }}>{match?.label ?? String(v)}</Box>;
            },
          }}
        >
          <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>
            {ALL_STATUSES_LABEL}
          </MenuItem>
          {statuses.map((o) => (
            <MenuItem key={o.value} value={String(o.value)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={filterSepSx} />

        <Box component="button" type="button" onClick={onApply} sx={filterBtnSx(true)}>
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
