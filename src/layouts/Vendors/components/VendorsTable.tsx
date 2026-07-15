/**
 * بطاقة جدول الموردين: ترويسة (عنوان + عدّاد + Excel) + جدول + ترقيم.
 */
import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { tableCardSx, tableHeadBarSx, topGhostBtnSx, tableSx, paginationBarSx, pageBtnSx, FONT } from "../utils/styles";
import { PAGE_SIZE } from "../utils/constants";
import { Vendor } from "../utils/types";
import VendorTableRow from "./VendorTableRow";

interface VendorsTableProps {
  rows: Vendor[];
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onToggleStatus: (v: Vendor) => void;
  onView: (v: Vendor) => void;
  onEdit: (v: Vendor) => void;
  onDelete: (v: Vendor) => void;
  onExport?: () => void;
}

const COLS = 7;

export default function VendorsTable({
  rows, total, page, pageCount, onPageChange, isLoading, onToggleStatus, onView, onEdit, onDelete, onExport,
}: VendorsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pageIds = useMemo(() => rows.map((v) => String(v.id)), [rows]);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleAll = () => setSelected((prev) => {
    const next = new Set(prev);
    if (allChecked) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    return next;
  });
  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <Box sx={tableCardSx}>
      <Box sx={tableHeadBarSx}>
        <Box>
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>قائمة الموردين</Box>
          <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, mt: "1px" }}>{total} مورد</Box>
        </Box>
        <Box component="button" type="button" onClick={onExport} sx={{ ...(topGhostBtnSx as object), height: 28, fontSize: "11.5px" }}>Excel</Box>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box component="table" sx={tableSx}>
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: "center" }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="تحديد الكل" />
              </th>
              <th>اسم المورد</th>
              <th>البريد الإلكتروني</th>
              <th>مدة الشحن</th>
              <th>الاكونت مانجر</th>
              <th style={{ textAlign: "center" }}>الحالة</th>
              <th aria-label="إجراءات" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={COLS} style={{ textAlign: "center", padding: "28px", color: HX.tx3, fontFamily: FONT }}>جارٍ التحميل…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={COLS} style={{ textAlign: "center", padding: "28px", color: HX.tx3, fontFamily: FONT }}>لا يوجد موردون</td></tr>
            ) : (
              rows.map((v) => (
                <VendorTableRow
                  key={String(v.id)}
                  vendor={v}
                  checked={selected.has(String(v.id))}
                  onToggleSelect={() => toggleOne(String(v.id))}
                  onToggleStatus={() => onToggleStatus(v)}
                  onView={() => onView(v)}
                  onEdit={() => onEdit(v)}
                  onDelete={() => onDelete(v)}
                />
              ))
            )}
          </tbody>
        </Box>
      </Box>

      <Box sx={paginationBarSx}>
        <Box sx={{ fontSize: "11.5px", color: HX.tx2, fontFamily: FONT }}>عرض {from}–{to} من {total} مورد</Box>
        <Box sx={{ display: "flex", gap: "3px" }}>
          <Box sx={pageBtnSx(false, page <= 1)} onClick={() => page > 1 && onPageChange(page - 1)}>‹</Box>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Box key={p} sx={pageBtnSx(p === page)} onClick={() => onPageChange(p)}>{p}</Box>
          ))}
          <Box sx={pageBtnSx(false, page >= pageCount)} onClick={() => page < pageCount && onPageChange(page + 1)}>›</Box>
        </Box>
      </Box>
    </Box>
  );
}
