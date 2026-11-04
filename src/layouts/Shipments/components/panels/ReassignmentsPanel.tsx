import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

export interface ReassignmentRecord {
  id: number;
  sourceOrderId: number;
  targetOrderId: number;
  sourceOrderNumber: string;
  targetOrderNumber: string;
  sourceOperationNumber?: string | null;
  targetOperationNumber?: string | null;
  sku?: string | null;
  itemTitle?: string | null;
  sellerName?: string | null;
  amount?: number | string | null;
  createdByName?: string | null;
  reason: string;
  notes: string;
  keepOldPending: boolean;
  createdAt: string;
}

export const reassignmentKey = ["shipments", "reassignments"] as const;

const CTRL: React.CSSProperties = {
  fontFamily: FONT, fontSize: 12, color: HX.tx, background: HX.surface2,
  border: `0.5px solid ${HX.border}`, borderRadius: 9, padding: "0 10px", height: 36, minWidth: 140,
};
const TH: React.CSSProperties = { textAlign: "right", padding: 12, borderBottom: `1px solid ${HX.border}`, whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: 12, borderBottom: `1px solid ${HX.border}` };

interface Filters { oldOrder: string; newOrder: string; code: string; vendorId: string; dateFrom: string; dateTo: string }
const EMPTY: Filters = { oldOrder: "", newOrder: "", code: "", vendorId: "", dateFrom: "", dateTo: "" };

export default function ReassignmentsPanel() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const { data: meta } = useShipmentsMetaQuery();

  /* حقول النص تُطبَّق بعد توقف الكتابة؛ القائمة والتواريخ فوراً. */
  useEffect(() => {
    const timer = setTimeout(() => setApplied(filters), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const params = useMemo(() => {
    const out: Record<string, string> = {};
    (Object.keys(applied) as Array<keyof Filters>).forEach((key) => {
      const value = applied[key].trim();
      if (value) out[key] = value;
    });
    return out;
  }, [applied]);

  const records = useQuery<ReassignmentRecord[]>({
    queryKey: [...reassignmentKey, "log", JSON.stringify(params)],
    queryFn: async () => (await axiosRequest.get("/shipments/reassignments", { params })).data.data,
  });
  const set = (key: keyof Filters) => (value: string) => setFilters((c) => ({ ...c, [key]: value }));
  const hasFilters = Object.values(filters).some(Boolean);
  const money = (value: ReassignmentRecord["amount"]) =>
    value == null || value === "" ? "—" : `${Number(value).toLocaleString("ar-EG")} ج.م`;

  return <Box sx={{ ...cardSx, fontFamily: FONT }}>
    <Box sx={{ p: 2, borderBottom: `1px solid ${HX.border}` }}>
      <Box sx={{ fontSize: 16, fontWeight: 800, color: HX.tx }}>إعادة التخصيص</Box>
      <Box sx={{ fontSize: 12, color: HX.tx2 }}>سجل تحويل الصنف بين الطلبات، مع السبب والملاحظات.</Box>
    </Box>
    <Box sx={{ p: "12px 16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", borderBottom: `1px solid ${HX.border}` }}>
      <input aria-label="رقم الطلب القديم" placeholder="رقم الطلب القديم" style={CTRL} value={filters.oldOrder} onChange={(e) => set("oldOrder")(e.target.value)} />
      <input aria-label="رقم الطلب الجديد" placeholder="رقم الطلب الجديد" style={CTRL} value={filters.newOrder} onChange={(e) => set("newOrder")(e.target.value)} />
      <input aria-label="كود المنتج" placeholder="كود المنتج" style={CTRL} value={filters.code} onChange={(e) => set("code")(e.target.value)} />
      <select aria-label="البائع" style={{ ...CTRL, minWidth: 160 }} value={filters.vendorId} onChange={(e) => set("vendorId")(e.target.value)}>
        <option value="">كل البائعين</option>
        {(meta?.vendors ?? []).map((v) => <option key={v.value} value={String(v.value)}>{v.label}</option>)}
      </select>
      <input aria-label="من تاريخ" title="من تاريخ" type="date" style={CTRL} value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(e) => set("dateFrom")(e.target.value)} />
      <input aria-label="إلى تاريخ" title="إلى تاريخ" type="date" style={CTRL} value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(e) => set("dateTo")(e.target.value)} />
      {hasFilters && (
        <Box component="button" type="button" onClick={() => setFilters(EMPTY)}
          sx={{ border: "none", background: "none", fontFamily: FONT, fontSize: 12, fontWeight: 700, color: HX.tx2, cursor: "pointer", "&:hover": { color: HX.red } }}>
          مسح البحث
        </Box>
      )}
    </Box>
    <Box sx={{ overflowX: "auto" }}>
      {records.isLoading ? <Box sx={{ p: 3 }}>جارٍ التحميل…</Box>
        : records.isError ? <Box sx={{ p: 3, color: HX.red }}>تعذر تحميل السجل</Box>
        : !records.data?.length ? <Box sx={{ p: 3, color: HX.tx2 }}>{hasFilters ? "لا توجد عمليات مطابقة للبحث." : "لا توجد عمليات إعادة تخصيص."}</Box>
        : <table dir="rtl" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 1050 }}>
          <thead><tr>{["التاريخ", "الطلب الأصلي", "الطلب الجديد", "كود المنتج", "الصنف", "البائع", "السبب", "القيمة", "بواسطة", "الملاحظات", "حالة القديم"].map((label) => <th key={label} style={TH}>{label}</th>)}</tr></thead>
          <tbody>{records.data.map((row) => <tr key={row.id}>
            <td style={TD}>{new Date(row.createdAt).toLocaleDateString("ar-EG")}</td>
            <td style={TD}>#{row.sourceOrderNumber || row.sourceOrderId}{row.sourceOperationNumber && <Box sx={{ fontSize: 10.5, color: HX.tx3 }}>عملية {row.sourceOperationNumber}</Box>}</td>
            <td style={TD}>#{row.targetOrderNumber || row.targetOrderId}{row.targetOperationNumber && <Box sx={{ fontSize: 10.5, color: HX.tx3 }}>عملية {row.targetOperationNumber}</Box>}</td>
            <td style={{ ...TD, fontFamily: "monospace" }}>{row.sku || "—"}</td>
            <td style={TD}>{row.itemTitle || "—"}</td>
            <td style={TD}>{row.sellerName || "—"}</td>
            <td style={TD}>{row.reason}</td>
            <td style={TD}>{money(row.amount)}</td>
            <td style={TD}>{row.createdByName || "—"}</td>
            <td style={{ ...TD, whiteSpace: "normal", maxWidth: 220 }}>{row.notes || "—"}</td>
            <td style={TD}>{row.keepOldPending ? "معلق" : "ملغي"}</td>
          </tr>)}</tbody>
        </table>}
    </Box>
  </Box>;
}
