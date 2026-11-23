/**
 * «دمج فواتير» → فاتورة شاملة: اختر صانعاً ثم فاتورتين أو أكثر من فواتيره المفتوحة (معلّقة / تمت المراجعة)
 * فيُقاصّ المستحق له بالمستحق عليه في صافٍ موقّع واحد. المعاينة هنا للمستخدم فقط؛ الخادم يعيد كل التحققات
 * تحت قفل الصفوف ويرفض بسبب عربي (409) ما لا يصلح.
 */
import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { InvoiceSummary, useConsolidateInvoices, useInvoicesList, useVendorOptions } from "query/financialInvoices";
import { money } from "../utils/calc";
import { FONT } from "../utils/styles";
import { VendorSelect } from "./FilterFields";
import { mergeBlockReason, previewMerge } from "./consolidation";
import { EmptyState, ModalShell, StatusPill, btnGhostSx, btnPrimarySx, cardBoxSx, fmtDate } from "./shared";

const netColor = (net: number): string => (net > 0 ? HX.green : net < 0 ? HX.red : HX.tx3);
const BANK_TEXT = { vendor: "التحويل لحساب الصانع (هوميكس تدفع)", homix: "التحويل لحساب هوميكس (الصانع يدفع)", none: "لا يوجد تحويل — الصافي صفر" } as const;

interface Props {
  open: boolean;
  onClose: () => void;
  /** يفتح الفاتورة الشاملة بعد إنشائها */
  onOpenInvoice: (invoiceId: number) => void;
  /** صانع محدد مسبقاً (id كنص) */
  initialVendorId?: string;
}

export default function MergeInvoicesDialog({ open, onClose, onOpenInvoice, initialVendorId = "" }: Props) {
  const vendors = useVendorOptions(open);
  const [vendorId, setVendorId] = useState(initialVendorId);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const consolidate = useConsolidateInvoices();
  const list = useInvoicesList(
    { vendorId: vendorId ? Number(vendorId) : undefined, kind: "standard", status: ["draft", "reviewed", "frozen", "transferred"], size: 100 },
    open && Boolean(vendorId),
  );
  const items: InvoiceSummary[] = useMemo(
    () => [...(list.data?.items ?? [])].sort((a, b) => String(a.periodEnd).localeCompare(String(b.periodEnd))),
    [list.data],
  );
  const chosen = items.filter((item) => selected.has(item.id));
  const preview = previewMerge(chosen);
  const canConfirm = chosen.length >= 2 && !consolidate.isPending;

  const toggle = (id: number) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const reset = () => { setVendorId(""); setSelected(new Set()); };
  const close = () => { reset(); onClose(); };

  const confirm = () => {
    if (!canConfirm) return;
    const text = `دمج ${chosen.length} فواتير في فاتورة شاملة؟\nالصافي المجمّع: ${money(Math.abs(preview.net))} ج.م — ${preview.label}.\nتنتقل البنود والتعديلات إلى الفاتورة الشاملة ويمكن فك الدمج قبل التحويل.`;
    if (!window.confirm(text)) return;
    consolidate.mutate({ invoiceIds: chosen.map((item) => item.id) }, {
      onSuccess: (result) => { const id = result.invoice.id; close(); onOpenInvoice(id); },
    });
  };

  return (
    <ModalShell
      open={open}
      onClose={close}
      maxWidth="md"
      title="دمج فواتير — فاتورة شاملة"
      actions={(<>
        <Box component="button" type="button" disabled={!canConfirm} onClick={confirm} sx={btnPrimarySx}>{consolidate.isPending ? "جارٍ الدمج..." : "تأكيد الدمج"}</Box>
        <Box component="button" type="button" onClick={close} sx={btnGhostSx}>إلغاء</Box>
      </>)}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
        <Box sx={{ fontSize: "12px", color: HX.tx2 }}>
          يُدمج فقط فواتير «معلّقة» أو «تمت المراجعة» لنفس الصانع بلا إيصال أو تحويل، لتُقاصّ المبالغ بين الدورات في صافٍ واحد.
        </Box>
        <Box sx={{ maxWidth: 320 }}>
          <VendorSelect value={vendorId} onChange={(value) => { setVendorId(value); setSelected(new Set()); }} options={vendors.data ?? []} />
        </Box>

        {!vendorId ? <EmptyState text="اختر الصانع أولاً." />
          : list.isError ? <EmptyState text="تعذّر تحميل الفواتير." />
          : list.isLoading ? <EmptyState text="جارٍ التحميل..." />
          : items.length === 0 ? <EmptyState text="لا توجد فواتير لهذا الصانع." />
          : (
            <Box sx={cardBoxSx}>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }} data-testid="merge-candidates">
                {items.map((item) => {
                  const reason = mergeBlockReason(item);
                  return (
                    <Box component="li" key={item.id} title={reason ?? undefined} data-testid="merge-row"
                      sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", p: "9px 12px", borderBottom: `0.5px solid ${HX.border}`, opacity: reason ? 0.55 : 1 }}>
                      <input type="checkbox" aria-label={`اختيار ${item.code ?? `فاتورة ${item.id}`}`} checked={selected.has(item.id)} disabled={Boolean(reason)} onChange={() => toggle(item.id)} />
                      <Box component="span" sx={{ fontWeight: 700, color: HX.accent, minWidth: 130 }}>{item.code ?? "مسودة"}</Box>
                      <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>دورة {item.billingDay} — {fmtDate(item.periodEnd)}</Box>
                      <StatusPill status={item.status} label={item.statusLabel} />
                      <Box component="span" data-testid="merge-net" sx={{ marginInlineStart: "auto", textAlign: "end", fontWeight: 800, color: netColor(item.netAmount) }}>
                        {money(Math.abs(item.netAmount))}
                        <Box component="span" sx={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: HX.tx3 }}>
                          {item.netAmount > 0 ? "مستحق للصانع" : item.netAmount < 0 ? "مستحق لهوميكس" : "لا يوجد مستحق"}
                        </Box>
                      </Box>
                      {reason && <Box component="span" sx={{ flexBasis: "100%", fontSize: "11px", color: HX.amber }}>لا يمكن دمجها: {reason}</Box>}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

        {chosen.length > 0 && (
          <Box sx={{ ...cardBoxSx, p: "12px 16px", bgcolor: HX.accentLight, display: "flex", gap: "22px", alignItems: "center", flexWrap: "wrap" }} data-testid="merge-preview">
            <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>الفواتير المختارة</Box><b>{chosen.length}</b></Box>
            <Box>
              <Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>{preview.label}</Box>
              <b data-testid="merge-preview-net" style={{ fontSize: 18, color: netColor(preview.net) }}>{money(Math.abs(preview.net))}</b>
            </Box>
            <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>بيانات التحويل</Box><b data-testid="merge-preview-bank" style={{ fontSize: 12.5 }}>{BANK_TEXT[preview.bank]}</b></Box>
            {chosen.length < 2 && <Box sx={{ fontSize: "11.5px", color: HX.amber }}>اختر فاتورتين على الأقل.</Box>}
          </Box>
        )}
      </Box>
    </ModalShell>
  );
}
