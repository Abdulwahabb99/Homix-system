/**
 * بطاقة جدول المستخدمين: ترويسة (عنوان + عدّاد + تصدير) + جدول + ترقيم.
 * التحديد (checkboxes) محلي على الصفحة الحالية (لإجراءات مجمّعة مستقبلاً).
 */
import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  tableCardSx, tableHeadBarSx, exportBtnSx, tableSx,
  paginationBarSx, pageBtnSx, FONT,
} from "../utils/styles";
import { PAGE_SIZE } from "../utils/constants";
import { AppUser } from "../utils/types";
import UserTableRow from "./UserTableRow";

interface UsersTableProps {
  rows: AppUser[];
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onView: (user: AppUser) => void;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
  onExport?: () => void;
}

const COLS = 6;

export default function UsersTable({
  rows, total, page, pageCount, onPageChange, isLoading, onView, onEdit, onDelete, onExport,
}: UsersTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pageIds = useMemo(() => rows.map((u) => String(u.id)), [rows]);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <Box sx={tableCardSx}>
      <Box sx={tableHeadBarSx}>
        <Box>
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>قائمة المستخدمين</Box>
          <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, mt: "1px" }}>{total} مستخدم</Box>
        </Box>
        <Box component="button" type="button" onClick={onExport} sx={exportBtnSx}>تصدير</Box>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box component="table" sx={tableSx}>
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: "center" }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="تحديد الكل" />
              </th>
              <th>المستخدم</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>آخر دخول</th>
              <th aria-label="إجراءات" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={COLS} style={{ textAlign: "center", padding: "28px", color: HX.tx3, fontFamily: FONT }}>جارٍ التحميل…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={COLS} style={{ textAlign: "center", padding: "28px", color: HX.tx3, fontFamily: FONT }}>لا يوجد مستخدمون</td></tr>
            ) : (
              rows.map((u) => (
                <UserTableRow
                  key={String(u.id)}
                  user={u}
                  checked={selected.has(String(u.id))}
                  onToggle={() => toggleOne(String(u.id))}
                  onView={() => onView(u)}
                  onEdit={() => onEdit(u)}
                  onDelete={() => onDelete(u)}
                />
              ))
            )}
          </tbody>
        </Box>
      </Box>

      <Box sx={paginationBarSx}>
        <Box sx={{ fontSize: "11.5px", color: HX.tx2, fontFamily: FONT }}>
          عرض {from}–{to} من {total} مستخدم
        </Box>
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
