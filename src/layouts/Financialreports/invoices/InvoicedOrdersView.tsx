/**
 * «الطلبات المفوترة» — الطلبات المحسوبة داخل فواتير مُراجَعة/مجمّدة/محوّلة (للبائع: فواتيره فقط).
 */
import React, { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useInvoicedLines, useVendorOptions } from "query/financialInvoices";
import { money } from "../utils/calc";
import { arNum } from "../utils/format";
import { COMPANY_DUE_LABEL, COMPANY_DUE_TIP, countsTowardCompanyDue } from "../utils/companyDue";
import { FONT } from "../utils/styles";
import { NetValue } from "../components/SettlementCells";
import { EmptyState, StatusPill, btnGhostSx, cardBoxSx, fmtDate, tdSx, thSx } from "./shared";
import { DebouncedTextField, VendorSelect } from "./FilterFields";

const PAGE_SIZE = 50;
const EMPTY = { invoiceCode: "", operationNumber: "", orderNumber: "", productCode: "", vendorId: "" };

export default function InvoicedOrdersView({ onOpenInvoice, isVendor = false }: { onOpenInvoice: (id: number) => void; isVendor?: boolean }) {
  const [filters, setFilters] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const vendors = useVendorOptions(!isVendor);
  const setKey = useCallback((key: keyof typeof EMPTY) => (value: string) => { setFilters((prev) => ({ ...prev, [key]: value })); setPage(1); }, []);
  const onOperation = useMemo(() => setKey("operationNumber"), [setKey]);
  const onOrder = useMemo(() => setKey("orderNumber"), [setKey]);
  const onProduct = useMemo(() => setKey("productCode"), [setKey]);
  const onVendor = useMemo(() => setKey("vendorId"), [setKey]);
  const onInvoice = useMemo(() => setKey("invoiceCode"), [setKey]);
  const { data, isLoading, isError } = useInvoicedLines({
    invoiceCode: filters.invoiceCode.trim() || undefined,
    operationNumber: filters.operationNumber.trim() || undefined,
    orderNumber: filters.orderNumber.trim() || undefined,
    page,
    productCode: filters.productCode.trim() || undefined,
    size: PAGE_SIZE,
    vendorId: isVendor ? undefined : filters.vendorId || undefined,
  });
  const items = data?.items ?? [];
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
      <Box sx={{ ...cardBoxSx, p: "12px 14px", display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <DebouncedTextField label="رقم العملية" value={filters.operationNumber} onChange={onOperation} />
        <DebouncedTextField label="رقم الطلب" value={filters.orderNumber} onChange={onOrder} />
        <DebouncedTextField label="كود المنتج" value={filters.productCode} onChange={onProduct} />
        <DebouncedTextField label="رقم الفاتورة" value={filters.invoiceCode} onChange={onInvoice} />
        {!isVendor && <VendorSelect value={filters.vendorId} onChange={onVendor} options={vendors.data ?? []} />}
        <Box component="button" type="button" disabled={!hasFilters} onClick={() => { setFilters(EMPTY); setPage(1); }}
          sx={{ ...btnGhostSx, height: 38 }}>إعادة ضبط</Box>
        <Box component="span" sx={{ fontSize: "12px", color: HX.tx2, alignSelf: "center" }}>{arNum(data?.total ?? 0)} طلب</Box>
      </Box>
      <Box sx={cardBoxSx}>
        {isError ? <EmptyState text="تعذّر تحميل الطلبات المفوترة." /> : isLoading ? <EmptyState text="جارٍ التحميل..." /> : items.length === 0 ? (
          <EmptyState text="لا توجد طلبات مفوترة بعد." />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["الصانع", "الفاتورة", "تاريخ الفاتورة", "رقم العملية", "رقم الطلب", "كود المنتج", "مستحق البائع", COMPANY_DUE_LABEL, "الغرامات", "الصافي", "الحالة"].map((h) => <Box component="th" key={h} title={h === COMPANY_DUE_LABEL ? COMPANY_DUE_TIP : undefined} sx={thSx}>{h}</Box>)}</tr></thead>
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
                    <Box component="td" sx={{ ...tdSx, color: HX.accent, fontWeight: 700 }}>{countsTowardCompanyDue(row) ? money(row.companyDue) : "—"}</Box>
                    <Box component="td" sx={{ ...tdSx, color: row.fines > 0 ? HX.red : HX.tx3 }}>{row.fines > 0 ? money(row.fines) : "لا يوجد"}</Box>
                    <Box component="td" sx={tdSx}><NetValue value={row.netAmount ?? (row.vendorDue - (countsTowardCompanyDue(row) ? row.companyDue : 0) - row.fines)} /></Box>
                    <Box component="td" sx={tdSx}><StatusPill status={row.invoiceStatus} label={row.invoiceStatusLabel} /></Box>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
        {pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", p: "10px", borderTop: `0.5px solid ${HX.border}`, fontSize: "12px" }}>
            <Box component="button" type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} sx={btnGhostSx}>السابق</Box>
            <span>{arNum(page)} / {arNum(pages)}</span>
            <Box component="button" type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} sx={btnGhostSx}>التالي</Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
