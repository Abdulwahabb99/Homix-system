import React from "react";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

export interface ReassignmentRecord {
  id: number;
  sourceOrderId: number;
  targetOrderId: number;
  sourceOrderNumber: string;
  targetOrderNumber: string;
  reason: string;
  notes: string;
  keepOldPending: boolean;
  createdAt: string;
}

export const reassignmentKey = ["shipments", "reassignments"] as const;

export default function ReassignmentsPanel() {
  const records = useQuery<ReassignmentRecord[]>({
    queryKey: reassignmentKey,
    queryFn: async () => (await axiosRequest.get("/shipments/reassignments")).data.data,
  });
  return <Box sx={{ ...cardSx, overflowX: "auto", fontFamily: "'Cairo', sans-serif" }}>
    <Box sx={{ p: 2, borderBottom: `1px solid ${HX.border}` }}>
      <Box sx={{ fontSize: 16, fontWeight: 800, color: HX.tx }}>إعادة التخصيص</Box>
      <Box sx={{ fontSize: 12, color: HX.tx2 }}>سجل تحويل الصنف بين الطلبات، مع السبب والملاحظات.</Box>
    </Box>
    {records.isLoading ? <Box sx={{ p: 3 }}>جارٍ التحميل…</Box>
      : records.isError ? <Box sx={{ p: 3, color: HX.red }}>تعذر تحميل السجل</Box>
      : !records.data?.length ? <Box sx={{ p: 3, color: HX.tx2 }}>لا توجد عمليات إعادة تخصيص.</Box>
      : <table dir="rtl" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 650 }}>
        <thead><tr>{["التاريخ", "الطلب الأصلي", "الطلب الجديد", "السبب", "الملاحظات", "حالة القديم"].map((label) => <th key={label} style={{ textAlign: "right", padding: 12, borderBottom: `1px solid ${HX.border}` }}>{label}</th>)}</tr></thead>
        <tbody>{records.data.map((row) => <tr key={row.id}>
          <td style={{ padding: 12, borderBottom: `1px solid ${HX.border}` }}>{new Date(row.createdAt).toLocaleDateString("ar-EG")}</td>
          <td style={{ padding: 12, borderBottom: `1px solid ${HX.border}` }}>#{row.sourceOrderNumber || row.sourceOrderId}</td>
          <td style={{ padding: 12, borderBottom: `1px solid ${HX.border}` }}>#{row.targetOrderNumber || row.targetOrderId}</td>
          <td style={{ padding: 12, borderBottom: `1px solid ${HX.border}` }}>{row.reason}</td>
          <td style={{ padding: 12, borderBottom: `1px solid ${HX.border}` }}>{row.notes || "—"}</td>
          <td style={{ padding: 12, borderBottom: `1px solid ${HX.border}` }}>{row.keepOldPending ? "معلق" : "ملغي"}</td>
        </tr>)}</tbody>
      </table>}
  </Box>;
}
