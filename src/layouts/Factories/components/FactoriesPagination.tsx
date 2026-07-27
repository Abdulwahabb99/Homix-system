/**
 * ترقيم صفحة الصنّاع — «عرض س–ص من ن» + أزرار الصفحات (مطابق لـ .pg).
 * يعرض حتى 5 أرقام حول الصفحة الحالية حتى لا يتمدّد الشريط.
 */
import React from "react";
import { Box } from "@mui/material";
import { FACTORIES_PAGE_SIZE } from "query/factoriesList";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { fmt } from "../utils/calc";
import { pageBtnSx, paginationBarSx, FONT } from "../utils/styles";

const MAX_NUMBERS = 5;

/** نافذة أرقام حول الصفحة الحالية مع الالتصاق بالحدود */
function pageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_NUMBERS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(MAX_NUMBERS / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + MAX_NUMBERS - 1);
  start = Math.max(1, end - MAX_NUMBERS + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface FactoriesPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (p: number) => void;
}

export default function FactoriesPagination({
  page, totalPages, totalCount, onPageChange,
}: FactoriesPaginationProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * FACTORIES_PAGE_SIZE + 1;
  const to = Math.min(page * FACTORIES_PAGE_SIZE, totalCount);
  const numbers = pageWindow(page, totalPages);

  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <Box sx={paginationBarSx}>
      <Box sx={{ fontSize: "11.5px", color: HX.tx2, fontFamily: FONT }}>
        عرض {fmt(from)}–{fmt(to)} من {fmt(totalCount)} صانع
      </Box>

      <Box sx={{ display: "flex", gap: "3px" }}>
        <Box
          component="button"
          type="button"
          disabled={atStart}
          onClick={() => onPageChange(page - 1)}
          sx={pageBtnSx(false, atStart)}
        >
          ‹
        </Box>

        {numbers.map((n) => (
          <Box
            key={n}
            component="button"
            type="button"
            onClick={() => onPageChange(n)}
            sx={pageBtnSx(n === page)}
          >
            {n}
          </Box>
        ))}

        <Box
          component="button"
          type="button"
          disabled={atEnd}
          onClick={() => onPageChange(page + 1)}
          sx={pageBtnSx(false, atEnd)}
        >
          ›
        </Box>
      </Box>
    </Box>
  );
}
