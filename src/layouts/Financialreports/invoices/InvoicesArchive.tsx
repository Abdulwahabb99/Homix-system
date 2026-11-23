/**
 * أرشيف فواتير الصناع (جدول) — فلاتر الحالة/الإيصال/المستحق/التواريخ + إجراءات جماعية.
 * البائع يرى فواتيره فقط (reviewed/transferred) والـ BE يفرض ذلك؛ الإجراءات الجماعية للمالية فقط.
 */
import React, { useCallback, useState } from "react";
import { Box } from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  InvoiceListParams, InvoiceStatus, downloadReceipt, useBulkTransition, useInvoicesList, useVendorOptions,
} from "query/financialInvoices";
import { money } from "../utils/calc";
import { arNum } from "../utils/format";
import { FONT } from "../utils/styles";
import {
  EmptyState, StatusPill, STATUS_META, btnGhostSx, btnPrimarySx, cardBoxSx, fmtDate, inputSx, tdSx, thSx,
} from "./shared";
import { DebouncedTextField, VendorSelect } from "./FilterFields";

const PAGE_SIZE = 25;
/** الأرشيف لا يعرض المسودات — تظهر في «الفواتير الجارية» فقط */
export const ARCHIVE_STATUSES: InvoiceStatus[] = ["reviewed", "frozen", "transferred"];
const STATUS_ORDER = ARCHIVE_STATUSES;

interface Props {
  isVendor: boolean;
  canSettle: boolean;
  onOpen: (invoiceId: number) => void;
}

export default function InvoicesArchive({ isVendor, canSettle, onOpen }: Props) {
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [invoiceCode, setInvoiceCode] = useState("");
  const [vendorId, setVendorId] = useState("");
  const vendors = useVendorOptions(!isVendor);
  const [receipt, setReceipt] = useState<"" | "uploaded" | "missing">("");
  const [dueParty, setDueParty] = useState<"" | "vendor" | "homix">("");
  const [invoiceFrom, setInvoiceFrom] = useState("");
  const [invoiceTo, setInvoiceTo] = useState("");
  const [transferredFrom, setTransferredFrom] = useState("");
  const [transferredTo, setTransferredTo] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const bulk = useBulkTransition();

  const params: InvoiceListParams = {
    status: status === "all" ? ARCHIVE_STATUSES : [status],
    invoiceCode: invoiceCode.trim() || undefined,
    vendorId: !isVendor && vendorId ? Number(vendorId) : undefined,
    receipt: receipt || undefined,
    dueParty: dueParty || undefined,
    invoiceFrom: invoiceFrom || undefined,
    invoiceTo: invoiceTo || undefined,
    transferredFrom: transferredFrom || undefined,
    transferredTo: transferredTo || undefined,
    overdue: overdue || undefined,
    page,
    size: PAGE_SIZE,
  };
  const { data, isLoading, isError } = useInvoicesList(params);
  const items = data?.items ?? [];
  const counts: Record<string, number> = { ...(data?.counts ?? {}) } as Record<string, number>;
  const totalCount = ARCHIVE_STATUSES.reduce((total, key) => total + (counts[key] ?? 0), 0);
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const visibleStatuses = isVendor ? STATUS_ORDER.filter((s) => s === "reviewed" || s === "transferred") : STATUS_ORDER;

  const onInvoiceCode = useCallback((value: string) => { setInvoiceCode(value); setPage(1); setSelected(new Set()); }, []);
  const onVendorId = useCallback((value: string) => { setVendorId(value); setPage(1); setSelected(new Set()); }, []);
  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); setSelected(new Set()); };
  const toggle = (id: number) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allChecked = items.length > 0 && items.every((i) => selected.has(i.id));

  const runBulk = (to: "reviewed" | "frozen" | "transferred", label: string) => {
    const ids = [...selected];
    if (!ids.length) return;
    const note = to === "transferred" ? "\nسيُسجَّل المبلغ المحسوب لكل فاتورة كمبلغ التحويل." : "";
    if (!window.confirm(`${label} ${ids.length} فاتورة؟${note}`)) return;
    bulk.mutate({ ids, to }, {
      onSuccess: (res) => {
        const failed = res.results.filter((r) => !r.ok);
        if (failed.length === 0) NotificationMeassage("success", `تم تنفيذ العملية على ${res.succeeded} فاتورة`);
        else NotificationMeassage("error", `نجحت ${res.succeeded} وفشلت ${failed.length}: ${failed[0].error ?? ""}`);
        setSelected(new Set());
      },
    });
  };

  const chip = (key: InvoiceStatus | "all", label: string, count?: number) => {
    const active = status === key;
    return (
      <Box key={key} component="button" type="button" onClick={() => resetPage(setStatus)(key)}
        sx={{ ...btnGhostSx, height: 30, borderRadius: "20px", bgcolor: active ? HX.accent : HX.surface2, color: active ? "#fff" : HX.tx2, borderColor: active ? HX.accent : HX.border }}>
        {label}{count !== undefined ? ` (${arNum(count)})` : ""}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
      <Box sx={{ ...cardBoxSx, p: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {chip("all", "الكل", totalCount)}
          {visibleStatuses.map((s) => chip(s, STATUS_META[s].label, counts[s] ?? 0))}
        </Box>
        <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <DebouncedTextField label="رقم الفاتورة" value={invoiceCode} onChange={onInvoiceCode} />
          {!isVendor && <VendorSelect value={vendorId} onChange={onVendorId} options={vendors.data ?? []} />}
        </Box>
        <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", fontSize: "12px", color: HX.tx2 }}>
          <Box component="select" value={dueParty} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => resetPage(setDueParty)(e.target.value as "" | "vendor" | "homix")} sx={inputSx}>
            <option value="">كل المستحقات</option>
            <option value="vendor">مستحق للصانع</option>
            <option value="homix">مستحق لهوميكس</option>
          </Box>
          <Box component="select" value={receipt} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => resetPage(setReceipt)(e.target.value as "" | "uploaded" | "missing")} sx={inputSx}>
            <option value="">كل الإيصالات</option>
            <option value="uploaded">إيصال مرفوع</option>
            <option value="missing">إيصال ناقص</option>
          </Box>
          <label>تاريخ الفاتورة من</label>
          <Box component="input" type="date" value={invoiceFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => resetPage(setInvoiceFrom)(e.target.value)} sx={inputSx} />
          <label>إلى</label>
          <Box component="input" type="date" value={invoiceTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => resetPage(setInvoiceTo)(e.target.value)} sx={inputSx} />
          <label>تاريخ المحاسبة من</label>
          <Box component="input" type="date" value={transferredFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => resetPage(setTransferredFrom)(e.target.value)} sx={inputSx} />
          <label>إلى</label>
          <Box component="input" type="date" value={transferredTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => resetPage(setTransferredTo)(e.target.value)} sx={inputSx} />
          {!isVendor && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <input type="checkbox" checked={overdue} onChange={(e) => resetPage(setOverdue)(e.target.checked)} /> المتأخرة فقط
            </label>
          )}
        </Box>
      </Box>

      {canSettle && selected.size > 0 && (
        <Box sx={{ ...cardBoxSx, p: "10px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", bgcolor: HX.accentLight }}>
          <Box component="span" sx={{ fontWeight: 700, fontSize: "12.5px" }}>{selected.size} محددة</Box>
          <Box component="button" type="button" disabled={bulk.isPending} onClick={() => runBulk("reviewed", "تأكيد مراجعة")} sx={btnPrimarySx}>تمت المراجعة</Box>
          <Box component="button" type="button" disabled={bulk.isPending} onClick={() => runBulk("frozen", "تجميد")} sx={btnGhostSx}>تجميد</Box>
          <Box component="button" type="button" disabled={bulk.isPending} onClick={() => runBulk("transferred", "تحويل")} sx={btnGhostSx}>تحويل المحدد</Box>
          <Box component="button" type="button" onClick={() => setSelected(new Set())} sx={btnGhostSx}>إلغاء التحديد</Box>
        </Box>
      )}

      <Box sx={cardBoxSx}>
        {isError ? (
          <EmptyState text="تعذّر تحميل الفواتير — حاول مرة أخرى." />
        ) : isLoading ? (
          <EmptyState text="جارٍ التحميل..." />
        ) : items.length === 0 ? (
          <EmptyState text={isVendor ? "لا توجد فواتير بعد." : "لا توجد فواتير. أصدر فواتير دورة مغلقة من «الفواتير الجارية» أولاً."} />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {canSettle && (
                    <Box component="th" sx={{ ...thSx, width: 34 }}>
                      <input type="checkbox" checked={allChecked} aria-label="تحديد الكل"
                        onChange={(e) => setSelected(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())} />
                    </Box>
                  )}
                  {["الصانع", "تاريخ الفاتورة", "الدورة", "رقم الفاتورة", "المبلغ", "تاريخ المحاسبة", "العداد", "الإيصال", "الحالة"].map((h) => (
                    <Box component="th" key={h} sx={thSx}>{h}</Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((inv) => (
                  <Box component="tr" key={inv.id} onClick={() => onOpen(inv.id)} sx={{ cursor: "pointer", "&:hover td": { bgcolor: "rgba(99,102,241,.03)" } }}>
                    {canSettle && (
                      <Box component="td" sx={tdSx} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggle(inv.id)} aria-label={`تحديد ${inv.vendorName}`} />
                      </Box>
                    )}
                    <Box component="td" sx={{ ...tdSx, fontWeight: 700 }}>{inv.vendorName}</Box>
                    <Box component="td" sx={tdSx}>{fmtDate(inv.periodEnd)}</Box>
                    <Box component="td" sx={tdSx}>دورة {inv.billingDay}</Box>
                    <Box component="td" sx={{ ...tdSx, color: HX.accent, fontWeight: 700 }}>{inv.code ?? "—"}</Box>
                    <Box component="td" sx={tdSx}>
                      <Box component="span" data-testid="archive-amount" sx={{ fontWeight: 800, color: inv.dueParty === "vendor" ? HX.green : inv.dueParty === "homix" ? HX.red : HX.tx3 }}>{money(inv.amount)}</Box>
                      <Box component="span" sx={{ display: "block", fontSize: "10.5px", color: HX.tx3 }}>{inv.dueParty === "vendor" ? "مستحق للصانع" : inv.dueParty === "homix" ? "مستحق لهوميكس" : "لا يوجد مستحق"}</Box>
                    </Box>
                    <Box component="td" sx={tdSx}>{fmtDate(inv.transferredAt)}</Box>
                    <Box component="td" sx={{ ...tdSx, color: inv.isOverdue ? HX.red : HX.tx, fontWeight: inv.isOverdue ? 700 : 400 }}>
                      {inv.daysCounter === null ? "—" : `${inv.daysCounter} يوم`}
                    </Box>
                    <Box component="td" sx={tdSx} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      {inv.status !== "transferred" ? "—" : inv.hasReceipt ? (
                        <Box component="button" type="button" onClick={() => downloadReceipt(inv.id, inv.receiptName).catch(() => NotificationMeassage("error", "تعذّر تحميل الإيصال"))} sx={{ ...btnGhostSx, height: 26, px: "9px", color: HX.green }}>عرض</Box>
                      ) : (
                        <Box component="span" sx={{ color: HX.amber, fontWeight: 700, fontSize: "11.5px" }}>ناقص</Box>
                      )}
                    </Box>
                    <Box component="td" sx={tdSx}><StatusPill status={inv.status} overdue={inv.isOverdue} label={inv.statusLabel} /></Box>
                  </Box>
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
