/**
 * جدول تفاصيل عام (thead + tbody) مدفوع بإعداد الأعمدة والصفوف.
 * يُستخدم في التبويبات الثلاثة بأعمدة مختلفة.
 */
import React from "react";
import { Box } from "@mui/material";
import { detailTableSx, toneColor, Tone } from "../utils/styles";

export interface DetailColumn {
  label: string;
  /** لون اختياري لترويسة العمود (مثل الأخضر/الأزرق في الفاتورة الشاملة) */
  tone?: Tone;
}

interface DetailTableProps {
  columns: DetailColumn[];
  /** كل صف = مصفوفة خلايا بعدد الأعمدة */
  rows: React.ReactNode[][];
}

export default function DetailTable({ columns, rows }: DetailTableProps) {
  return (
    <Box component="table" sx={detailTableSx}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} style={c.tone ? { color: toneColor(c.tone) } : undefined}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, ri) => (
          <tr key={ri}>
            {cells.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Box>
  );
}
