/**
 * «الطلبات المفوترة» — الطلبات المحسوبة داخل فواتير مُراجَعة/مجمّدة/محوّلة (للبائع: فواتيره فقط).
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useInvoicedLines } from "query/financialInvoices";
import { money } from "../utils/calc";
import { FONT } from "../utils/styles";
import { EmptyState, StatusPill, btnGhostSx, cardBoxSx, fmtDate, inputSx, tdSx, thSx } from "./shared";

const PAGE_SIZE = 50;

export default function InvoicedOrdersView({ onOpenInvoice }: { onOpenInvoice: (id: number) => void }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useInvoicedLines({ q: q.trim() || undefined, page, size: PAGE_SIZE });
  const items = data?.items ?? [];
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
      <Box sx={{ ...cardBoxSx, p: "12px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
        <Box component="input" placeholder="رقم العملية / رقم الطلب / كود المنتج / رقم الفاتورة" value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQ(e.target.value); setPage(1); }} sx={{ ...inputSx, flex: 1, maxWidth: 420 }} />
        <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{data?.total ?? 0} طلب</Box>
      </Box>
      <Box sx={cardBoxSx}>
        {isError ? <EmptyState text="تعذّر تحميل الطلبات المفوترة." /> : isLoading ? <EmptyState text="جارٍ التحميل..." /> : items.length === 0 ? (
          <EmptyState text="لا توجد طلبات مفوترة بعد." />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["الصانع", "الفاتورة", "تاريخ الفاتورة", "رقم العملية", "رقم الطلب", "كود المنتج", "المستحق للبائع", "المستحق للشركة", "الغرامات", "الحالة"].map((h) => <Box component="th" key={h} sx={thSx}>{h}</Box>)}</tr></thead>
              <tbody>
                {items.map((row) => (
                  <tr key={`${row.invoiceCode}-${row.id}`}>
                    <Box component="td" sx={{ ...tdSx, fontWeight: 700 }}>{row.vendorName}</Box>
                    <Box component="td" sx={tdSx}>
                      <Box component="button" type="button" onClick={() => onOpenInvoice(row.invoiceId)} sx={{ all: "unset", cursor: "pointer", color: HX.accent, fontWeight: 700 }}>{row.invoiceCode ?? "—"}</Box>
                    </Box>
                    <Box component="td" sx={tdSx}>{fmtDate(row.periodEnd)}</Box>
                    <Box component="td" sx={tdSx}><Link to={`/orders/${row.orderId}`} style={{ color: HX.accent, fontWeight: 700 }}>{row.operationNumber || `OP-${row.orderId}`}</Link></Box>
                    <Box component="td" sx={{ ...tdSx, color: HX.tx2 }}>#{row.orderNumber}</Box>
                    <Box component="td" sx={tdSx}>{row.productCode || "—"}</Box>
                    <Box component="td" sx={{ ...tdSx, color: HX.green, fontWeight: 700 }}>{money(row.vendorDue)}</Box>
                    <Box component="td" sx={{ ...tdSx, color: HX.accent, fontWeight: 700 }}>{money(row.companyDue)}</Box>
                    <Box component="td" sx={{ ...tdSx, color: row.fines > 0 ? HX.red : HX.tx3 }}>{row.fines > 0 ? money(row.fines) : "لا يوجد"}</Box>
                    <Box component="td" sx={tdSx}><StatusPill status={row.invoiceStatus} /></Box>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
        {pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", p: "10px", borderTop: `0.5px solid ${HX.border}`, fontSize: "12px" }}>
            <Box component="button" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} sx={btnGhostSx}>السابق</Box>
            <span>{page} / {pages}</span>
            <Box component="button" type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} sx={btnGhostSx}>التالي</Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
