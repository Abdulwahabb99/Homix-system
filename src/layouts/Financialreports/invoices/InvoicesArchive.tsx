/**
 * أرشيف فواتير الصناع (جدول) — فلاتر الحالة/الإيصال/المستحق/التواريخ + إجراءات جماعية.
 * البائع يرى فواتيره فقط (reviewed/transferred) والـ BE يفرض ذلك؛ الإجراءات الجماعية للمالية فقط.
 */
import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  downloadFirstReceipt, useBulkTransition, useInvoiceMonths, useInvoicesList, useVendorOptions,
} from "query/financialInvoices";
import { money } from "../utils/calc";
import { arNum } from "../utils/format";
import { FONT } from "../utils/styles";
import {
  ConsolidatedBadge, EmptyState, StatusPill, btnGhostSx, btnPrimarySx, cardBoxSx, fmtDate, inputSx, tdSx, thSx,
} from "./shared";
import { DebouncedTextField, OptionSelect, VendorSelect } from "./FilterFields";
import MergeInvoicesDialog from "./MergeInvoicesDialog";
import {
  ARCHIVE_STATUSES, ArchiveFilters, StatusChip, chipCounts, isFiltered, monthLabel, parseArchiveFilters, toListParams, writeArchiveFilters,
} from "./archiveFilters";

export { ARCHIVE_STATUSES };

const PAGE_SIZE = 25;

const CYCLE_OPTIONS = [{ value: "", label: "كل الدورات" }, { value: "13", label: "دورة 13" }, { value: "28", label: "دورة 28" }];
const DIRECTION_OPTIONS = [
  { value: "both", label: "لهوميكس وللمورد" },
  { value: "homix", label: "مستحق لهوميكس" },
  { value: "vendor", label: "مستحق للمورد" },
];

interface Props {
  isVendor: boolean;
  canSettle: boolean;
  onOpen: (invoiceId: number) => void;
}

export default function InvoicesArchive({ isVendor, canSettle, onOpen }: Props) {
  // الرابط هو مصدر حالة الفلاتر الوحيد: التحديث/المشاركة يحفظان الفلتر
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseArchiveFilters(searchParams, isVendor), [searchParams, isVendor]);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const vendors = useVendorOptions(!isVendor);
  const months = useInvoiceMonths();
  const bulk = useBulkTransition();

  /** أي تغيير في الفلتر يعيد الصفحة 1 ويمسح التحديد؛ تغيير الصفحة وحده يحتفظ بالباقي */
  const update = useCallback((patch: Partial<ArchiveFilters>) => {
    setSearchParams((prev) => {
      const current = parseArchiveFilters(prev, isVendor);
      return writeArchiveFilters(prev, { ...current, page: 1, ...patch });
    }, { replace: true });
    setSelected(new Set());
  }, [setSearchParams, isVendor]);
  const reset = () => update({ ...parseArchiveFilters(new URLSearchParams(), isVendor) });

  const params = toListParams(filters, { isVendor, pageSize: PAGE_SIZE });
  const { data, isLoading, isError } = useInvoicesList(params);
  const items = data?.items ?? [];
  const chips = chipCounts(data?.filteredCounts);
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const monthOptions = [{ value: "", label: "كل الشهور" }, ...(months.data ?? []).map((m) => ({ value: m.month, label: monthLabel(m.month) }))];
  if (filters.month && !monthOptions.some((o) => o.value === filters.month)) monthOptions.push({ value: filters.month, label: monthLabel(filters.month) });

  const onSearch = useCallback((value: string) => update({ search: value }), [update]);
  const onVendorId = useCallback((value: string) => update({ vendorId: value }), [update]);
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

  const chip = (key: StatusChip, label: string, count?: number) => {
    const active = filters.chip === key;
    return (
      <Box key={key} component="button" type="button" aria-pressed={active} onClick={() => update({ chip: key })}
        sx={{ ...btnGhostSx, height: 30, borderRadius: "20px", bgcolor: active ? HX.accent : HX.surface2, color: active ? "#fff" : HX.tx2, borderColor: active ? HX.accent : HX.border }}>
        {label}{count !== undefined ? ` (${arNum(count)})` : ""}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
      <Box sx={{ ...cardBoxSx, p: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <OptionSelect label="الشهر" value={filters.month} onChange={(month) => update({ month })} options={monthOptions} />
          <OptionSelect label="الدورة" value={filters.cycle} onChange={(cycle) => update({ cycle: cycle as ArchiveFilters["cycle"] })} options={CYCLE_OPTIONS} />
          <OptionSelect label="المستحق" value={filters.direction} onChange={(direction) => update({ direction: direction as ArchiveFilters["direction"] })} options={DIRECTION_OPTIONS} />
          {!isVendor && <VendorSelect value={filters.vendorId} onChange={onVendorId} options={vendors.data ?? []} />}
          <DebouncedTextField label="بحث" placeholder="ابحث باسم المورد أو رقم الفاتورة" value={filters.search} onChange={onSearch} />
        </Box>
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {chip("all", "الكل", chips.all)}
          {chip("open", "مفتوحة", chips.open)}
          {chip("paid", "مسددة", chips.paid)}
          {chip("consolidated", "الفواتير الشاملة")}
          {isFiltered(filters) && (
            <Box component="button" type="button" onClick={reset} sx={btnGhostSx}>إعادة ضبط</Box>
          )}
          {canSettle && !isVendor && (
            <Box component="button" type="button" onClick={() => setMergeOpen(true)} sx={{ ...btnPrimarySx, marginInlineStart: "auto" }}>دمج فواتير</Box>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", fontSize: "12px", color: HX.tx2 }}>
          <Box component="select" value={filters.receipt} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update({ receipt: e.target.value as ArchiveFilters["receipt"] })} sx={inputSx}>
            <option value="">كل الإيصالات</option>
            <option value="uploaded">إيصال مرفوع</option>
            <option value="missing">إيصال ناقص</option>
          </Box>
          <label>تاريخ الفاتورة من</label>
          <Box component="input" type="date" value={filters.invoiceFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ invoiceFrom: e.target.value })} sx={inputSx} />
          <label>إلى</label>
          <Box component="input" type="date" value={filters.invoiceTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ invoiceTo: e.target.value })} sx={inputSx} />
          <label>تاريخ المحاسبة من</label>
          <Box component="input" type="date" value={filters.transferredFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ transferredFrom: e.target.value })} sx={inputSx} />
          <label>إلى</label>
          <Box component="input" type="date" value={filters.transferredTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ transferredTo: e.target.value })} sx={inputSx} />
          {!isVendor && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <input type="checkbox" checked={filters.overdue} onChange={(e) => update({ overdue: e.target.checked })} /> المتأخرة فقط
            </label>
          )}
        </Box>
        <Box data-testid="archive-summary" sx={{ fontSize: "12px", color: HX.tx2, fontWeight: 700 }}>عدد الفواتير: {arNum(total)}</Box>
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
          <EmptyState text={isFiltered(filters) ? "لا توجد فواتير تطابق الفلاتر." : isVendor ? "لا توجد فواتير بعد." : "لا توجد فواتير. أصدر فواتير دورة مغلقة من «الفواتير الجارية» أولاً."} />
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
                    <Box component="td" sx={{ ...tdSx, color: HX.accent, fontWeight: 700 }}>
                      {inv.code ?? "—"} {inv.kind === "consolidated" && <ConsolidatedBadge />}
                    </Box>
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
                        <Box component="button" type="button" onClick={() => downloadFirstReceipt(inv.id).catch(() => NotificationMeassage("error", "تعذّر تحميل الإيصال"))} sx={{ ...btnGhostSx, height: 26, px: "9px", color: HX.green }}>{(inv.receiptsCount ?? 1) > 1 ? `عرض (${inv.receiptsCount})` : "عرض"}</Box>
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
            <Box component="button" type="button" disabled={filters.page <= 1} onClick={() => update({ page: filters.page - 1 })} sx={btnGhostSx}>السابق</Box>
            <span>{filters.page} / {pages}</span>
            <Box component="button" type="button" disabled={filters.page >= pages} onClick={() => update({ page: filters.page + 1 })} sx={btnGhostSx}>التالي</Box>
          </Box>
        )}
      </Box>
      {canSettle && !isVendor && <MergeInvoicesDialog open={mergeOpen} onClose={() => setMergeOpen(false)} onOpenInvoice={onOpen} />}
    </Box>
  );
}
