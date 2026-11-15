/**
 * جدول تفاصيل عام (thead + tbody) مدفوع بإعداد الأعمدة والصفوف.
 * يُستخدم في التبويبات الثلاثة بأعمدة مختلفة.
 */
import React from "react";
import { Box } from "@mui/material";
import { detailTableSx, toneColor, Tone } from "../utils/styles";

export interface DetailColumn {
  label: string;
  /** تلميح يشرح معنى العمود */
  tip?: string;
  /** لون اختياري لترويسة العمود (مثل الأخضر/الأزرق في الفاتورة الشاملة) */
  tone?: Tone;
}

interface DetailTableProps {
  columns: DetailColumn[];
  /** كل صف = مصفوفة خلايا بعدد الأعمدة */
  rows: React.ReactNode[][];
  /** صفوف باهتة (طلبات غير محسوبة في الفاتورة) — فهرس الصف */
  mutedRows?: ReadonlySet<number>;
}

export default function DetailTable({ columns, rows, mutedRows }: DetailTableProps) {
  return (
    <Box component="table" sx={detailTableSx}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} title={c.tip} style={c.tone ? { color: toneColor(c.tone) } : undefined}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, ri) => (
          <tr key={ri} style={mutedRows?.has(ri) ? { opacity: 0.55 } : undefined}>
            {cells.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Box>
  );
}
