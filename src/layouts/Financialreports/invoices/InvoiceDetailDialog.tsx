/**
 * تفاصيل فاتورة صانع: الطلبات (تعديل مباشر للغرامات/المستحقات + قائمة الطلب)، التعديلات اليدوية،
 * انتقالات الحالة، إيصال التحويل، المستند (طباعة/PDF) ومعاينة الصانع، وسجل نشاط الفاتورة.
 * التعديل متاح للمالية والفاتورة «معلّقة» فقط؛ البائع قراءة فقط لفواتيره.
 */
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { downloadOrderInvoicePdf, printElementNatively } from "layouts/Orders/utils/invoicePdf";
import { HX } from "layouts/Orders/ordersHomixTheme";
import {
  InvoiceLine, LineAction, downloadReceipt, useAddAdjustment, useAddOrderToInvoice, useInvoiceActivity, useInvoiceDetail,
  useLineAction, useOrderCandidates, useRefreshDraft, useRemoveAdjustment, useRemoveReceipt, useSetLineOverride, useSyncInvoice,
  useTransitionInvoice, useUploadReceipt,
} from "query/financialInvoices";
import { money } from "../utils/calc";
import { FONT } from "../utils/styles";
import { CostWarning } from "../components/LiveAmountCell";
import EditableAmountCell from "./EditableAmountCell";
import InvoiceDocument from "./InvoiceDocument";
import {
  ACTION_LABELS, EmptyState, FORMULA_NOTE, RECEIPT_ACCEPT, validateReceiptFile, ModalShell, describeEventDetail, StatusPill, btnDangerSx, btnGhostSx, btnPrimarySx, cardBoxSx, fmtDateTime, inputSx, tdSx, thSx,
} from "./shared";

type OverrideField = "finesOverride" | "vendorDueOverride" | "companyDueOverride" | "warehouseCostOverride" | "collectionOverride";

const ORIGINAL_KEY: Record<OverrideField, keyof InvoiceLine> = {
  collectionOverride: "originalCollection",
  companyDueOverride: "originalCompanyDue",
  finesOverride: "originalFines",
  vendorDueOverride: "originalVendorDue",
  warehouseCostOverride: "originalWarehouseCost",
};

const LINE_ACTIONS_BY_STATE: Record<string, Array<{ action: LineAction; label: string; danger?: boolean }>> = {
  included: [{ action: "defer", label: "تحويل للفاتورة الجاية" }, { action: "freeze", label: "تجميد (مش محسوب)" }, { action: "delete", label: "حذف نهائي", danger: true }],
  frozen: [{ action: "unfreeze", label: "فك التجميد" }, { action: "defer", label: "تحويل للفاتورة الجاية" }, { action: "delete", label: "حذف نهائي", danger: true }],
  deferred: [{ action: "restore", label: "رجّعه للفاتورة دي" }, { action: "delete", label: "حذف نهائي", danger: true }],
};

const STATE_TAGS: Record<string, { label: string; color: string }> = {
  frozen: { label: "مجمّد — مش محسوب", color: HX.blue },
  deferred: { label: "متحوّل للفاتورة الجاية", color: HX.amber },
  removed: { label: "محذوف", color: HX.red },
};

interface Props {
  invoiceId: number | null;
  isVendor: boolean;
  canSettle: boolean;
  onClose: () => void;
}

export default function InvoiceDetailDialog({ invoiceId, isVendor, canSettle, onClose }: Props) {
  const { data, isLoading, isError } = useInvoiceDetail(invoiceId);
  const transition = useTransitionInvoice();
  const sync = useSyncInvoice();
  const refresh = useRefreshDraft();
  const override = useSetLineOverride();
  const lineAction = useLineAction();
  const addAdjustment = useAddAdjustment();
  const removeAdjustment = useRemoveAdjustment();
  const upload = useUploadReceipt();
  const removeReceipt = useRemoveReceipt();
  const addOrder = useAddOrderToInvoice();

  const [vendorPreview, setVendorPreview] = useState(false);
  const [menuLine, setMenuLine] = useState<number | null>(null);
  const [adjLabel, setAdjLabel] = useState("");
  const [adjKind, setAdjKind] = useState<"addition" | "deduction">("deduction");
  const [adjAmount, setAdjAmount] = useState("");
  const [orderQuery, setOrderQuery] = useState("");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [printing, setPrinting] = useState(false);
  const docRef = useRef<HTMLDivElement | null>(null);

  const invoice = data?.invoice;
  const isDraft = invoice?.status === "draft";
  const editable = Boolean(canSettle && !isVendor && isDraft);
  const staff = canSettle && !isVendor;
  const candidates = useOrderCandidates(editable && showAddOrder ? invoiceId : null, orderQuery);
  const activity = useInvoiceActivity({ invoiceId: invoiceId ?? undefined, size: 50 }, Boolean(staff && showActivity && invoiceId));

  useEffect(() => {
    setVendorPreview(false); setMenuLine(null); setShowAddOrder(false); setShowActivity(false);
  }, [invoiceId]);

  useEffect(() => {
    if (!printing) return undefined;
    const timer = window.setTimeout(async () => {
      try {
        if (!docRef.current) throw new Error("missing document");
        await downloadOrderInvoicePdf(docRef.current, `فاتورة-${invoice?.code ?? invoiceId}`);
      } catch {
        NotificationMeassage("error", "تعذر تصدير الفاتورة — سيُفتح مربع الطباعة");
        if (docRef.current) printElementNatively(docRef.current);
      } finally { setPrinting(false); }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [printing, invoice?.code, invoiceId]);

  if (invoiceId === null) return null;

  const doTransition = (to: "draft" | "reviewed" | "frozen" | "transferred", confirmText: string, transferAmount?: number) => {
    if (!invoice || !window.confirm(confirmText)) return;
    transition.mutate({ id: invoice.id, to, transferAmount });
  };

  const askTransfer = () => {
    if (!invoice) return;
    const raw = window.prompt(`مبلغ التحويل الفعلي (المحسوب: ${Math.round(Math.abs(invoice.netAmount))} ج.م):`, String(Math.abs(invoice.netAmount)));
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount < 0) { NotificationMeassage("error", "مبلغ غير صالح"); return; }
    transition.mutate({ id: invoice.id, to: "transferred", transferAmount: amount });
  };

  const resetOverride = (line: InvoiceLine, field: OverrideField) => {
    if (!invoice) return;
    override.mutate({ id: invoice.id, lineId: line.id, patch: { [field]: null } });
  };

  const runLineAction = (line: InvoiceLine, action: LineAction) => {
    setMenuLine(null);
    if (!invoice) return;
    let reason: string | undefined;
    if (action === "delete") {
      if (!window.confirm(`حذف الطلب #${line.orderNumber} نهائيًا؟ لن يُحتسب هنا ولن يرجع لأي فاتورة جاية.`)) return;
    }
    if (action === "defer" || action === "freeze" || action === "delete") {
      const input = window.prompt("السبب (اختياري):", "");
      if (input === null) return;
      reason = input.trim() || undefined;
    }
    lineAction.mutate({ id: invoice.id, lineId: line.id, action, reason });
  };

  const overriddenTitleOf = (line: InvoiceLine, field: OverrideField) => {
    const original = line[ORIGINAL_KEY[field]];
    return ["معدّل يدوياً", typeof original === "number" ? `الأصل ${money(original)}` : null, line.overrideReason ? `السبب: ${line.overrideReason}` : null].filter(Boolean).join(" — ");
  };

  const editableCell = (line: InvoiceLine, field: OverrideField, value: number, overridden: boolean) => (
    <EditableAmountCell
      value={value}
      display={<span>{money(value)}</span>}
      editable={editable && line.state !== "deferred"}
      overridden={overridden}
      overriddenTitle={overriddenTitleOf(line, field)}
      busy={override.isPending}
      onCommit={(next) => { if (invoice) override.mutate({ id: invoice.id, lineId: line.id, patch: { [field]: next } }); }}
      onReset={editable ? () => resetOverride(line, field) : undefined}
    />
  );

  const submitAdjustment = () => {
    const amount = Number(adjAmount);
    if (!invoice || !adjLabel.trim() || !(amount > 0)) { NotificationMeassage("error", "استكمل الوصف والمبلغ"); return; }
    addAdjustment.mutate({ id: invoice.id, label: adjLabel.trim(), kind: adjKind, amount }, {
      onSuccess: () => { setAdjLabel(""); setAdjAmount(""); },
    });
  };

  const liveAdjustments = (data?.adjustments ?? []).filter((a) => !a.removedAt);
  const lines = data?.lines ?? [];

  return (
    <ModalShell
      open
      onClose={onClose}
      maxWidth="lg"
      title={invoice ? (<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {invoice.vendorName} — {invoice.code ?? "مسودة"} <StatusPill status={invoice.status} overdue={invoice.isOverdue} />
      </Box>) : "فاتورة"}
    >
      {isError ? <EmptyState text="تعذّر تحميل الفاتورة." /> : isLoading || !invoice || !data ? <EmptyState text="جارٍ التحميل..." /> : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", fontFamily: FONT }}>
          {/* شريط الإجراءات */}
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <Box component="button" type="button" disabled={printing} onClick={() => setPrinting(true)} sx={btnGhostSx}>طباعة / PDF</Box>
            {staff && <Box component="button" type="button" onClick={() => setVendorPreview((v) => !v)} sx={btnGhostSx}>{vendorPreview ? "إخفاء المعاينة" : "معاينة كصانع"}</Box>}
            {staff && <Box component="button" type="button" onClick={() => setShowActivity((v) => !v)} sx={btnGhostSx}>سجل النشاط</Box>}
            {staff && invoice.status === "draft" && (<>
              <Box component="button" type="button" disabled={sync.isPending} onClick={() => sync.mutate(invoice.id, { onSuccess: (r) => NotificationMeassage("success", r.added ? `اتضافت ${r.added} طلبات` : "لا توجد طلبات جديدة") })} sx={btnGhostSx}>مزامنة الطلبات</Box>
              <Box component="button" type="button" onClick={() => setShowAddOrder((v) => !v)} sx={btnGhostSx}>إضافة طلب</Box>
              <Box component="button" type="button" disabled={refresh.isPending} title="يعيد حساب أرقام النظام ويحتفظ بتعديلاتك اليدوية"
                onClick={() => { if (window.confirm("تحديث المسودة بأحدث أرقام النظام؟ تعديلاتك اليدوية وحالات الطلبات والتعديلات على الفاتورة ستبقى كما هي.")) refresh.mutate(invoice.id, { onSuccess: (r) => NotificationMeassage("success", r.refreshed ? `تم تحديث ${r.refreshed} طلب` : "الأرقام محدّثة بالفعل") }); }}
                sx={btnGhostSx}>تحديث المسودة</Box>
              <Box component="button" type="button" disabled={transition.isPending} onClick={() => doTransition("reviewed", "تأكيد المراجعة؟ الأرقام هتتقفل من التعديل.")} sx={btnPrimarySx}>تمت المراجعة</Box>
            </>)}
            {staff && invoice.status === "reviewed" && (<>
              <Box component="button" type="button" disabled={transition.isPending} onClick={askTransfer} sx={btnPrimarySx}>تم التحويل</Box>
              <Box component="button" type="button" disabled={transition.isPending} onClick={() => doTransition("frozen", "تجميد الفاتورة؟ عداد الأيام هيقف.")} sx={btnGhostSx}>تجميد</Box>
              <Box component="button" type="button" disabled={transition.isPending} onClick={() => doTransition("draft", "إرجاع الفاتورة لمعلّقة؟")} sx={btnGhostSx}>رجوع لمعلّقة</Box>
            </>)}
            {staff && invoice.status === "frozen" && (
              <Box component="button" type="button" disabled={transition.isPending} onClick={() => doTransition("reviewed", "فك التجميد؟")} sx={btnPrimarySx}>فك التجميد</Box>
            )}
            {staff && invoice.status === "transferred" && (
              <Box component="button" type="button" disabled={transition.isPending} onClick={() => doTransition("reviewed", "التراجع عن التحويل؟ الفاتورة هترجع «تمت المراجعة».")} sx={btnDangerSx}>تراجع عن التحويل</Box>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: "18px", flexWrap: "wrap", fontSize: "12px", color: HX.tx2 }}>
            <span>الدورة: {invoice.billingDay}</span>
            <span>راجعها: {fmtDateTime(invoice.reviewedAt)}</span>
            {invoice.transferredAt && <span>حُوّلت: {fmtDateTime(invoice.transferredAt)} — {money(invoice.transferAmount ?? 0)}</span>}
            {invoice.daysCounter !== null && <span>العداد: {invoice.daysCounter} يوم</span>}
          </Box>

          {vendorPreview && data && (
            <Box sx={{ ...cardBoxSx, p: 1.5, overflowX: "auto", bgcolor: HX.surface3 }}>
              <Box sx={{ fontSize: "11.5px", color: HX.tx2, mb: 1 }}>هذا ما يراه الصانع (الطلبات المحسوبة فقط، بدون ملاحظات داخلية).</Box>
              <InvoiceDocument detail={data} />
            </Box>
          )}

          {showAddOrder && editable && (
            <Box sx={{ ...cardBoxSx, p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <Box component="input" placeholder="ابحث برقم العملية أو الطلب (طلبات مسلّمة لهذا الصانع غير مفوترة)" value={orderQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderQuery(e.target.value)} sx={inputSx} />
              {(candidates.data ?? []).map((c) => (
                <Box key={c.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
                  <span>{c.code || `OP-${c.id}`} — #{c.orderNumber}</span>
                  <Box component="button" type="button" disabled={addOrder.isPending} onClick={() => addOrder.mutate({ id: invoice.id, orderId: c.id })} sx={btnPrimarySx}>إضافة</Box>
                </Box>
              ))}
              {orderQuery.trim().length >= 2 && candidates.data?.length === 0 && <Box sx={{ fontSize: "12px", color: HX.tx3 }}>لا توجد نتائج.</Box>}
            </Box>
          )}

          {/* الطلبات */}
          <Box sx={cardBoxSx}>
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  {["رقم العملية", "رقم الطلب", "كود المنتج", "سعر التكلفة", ...(isVendor ? [] : ["التحصيل"]), "الغرامات", "المستحق للبائع", ...(isVendor ? [] : ["المستحق للشركة"]), ...(editable || staff ? ["الحالة", ""] : [])].map((h, i) => <Box component="th" key={`${h}-${i}`} sx={thSx}>{h}</Box>)}
                </tr></thead>
                <tbody>
                  {lines.length === 0 && <tr><Box component="td" colSpan={10} sx={{ ...tdSx, textAlign: "center", color: HX.tx3 }}>لا توجد طلبات.</Box></tr>}
                  {lines.map((line) => {
                    const tag = STATE_TAGS[line.state];
                    const muted = line.state !== "included";
                    return (
                      <Box component="tr" key={line.id} sx={{ opacity: muted ? 0.6 : 1 }}>
                        <Box component="td" sx={{ ...tdSx, color: HX.accent, fontWeight: 700 }}>{line.operationNumber || `OP-${line.orderId}`}</Box>
                        <Box component="td" sx={{ ...tdSx, color: HX.tx2 }}>#{line.orderNumber}</Box>
                        <Box component="td" sx={tdSx}>{line.productCode || "—"}</Box>
                        <Box component="td" sx={{ ...tdSx, fontWeight: 700 }}>
                          {editableCell(line, "warehouseCostOverride", line.warehouseCost, line.warehouseCostOverride != null)}
                          {!(line.warehouseCost > 0) && line.warehouseCostOverride == null && <CostWarning />}
                        </Box>
                        {!isVendor && <Box component="td" sx={{ ...tdSx, fontWeight: 700 }}>{editableCell(line, "collectionOverride", line.collectionTotal, line.collectionOverride != null)}</Box>}
                        <Box component="td" sx={{ ...tdSx, color: line.fines > 0 ? HX.red : HX.tx3 }}>{editableCell(line, "finesOverride", line.fines, line.finesOverride != null)}</Box>
                        <Box component="td" sx={{ ...tdSx, color: HX.green, fontWeight: 700 }}>{editableCell(line, "vendorDueOverride", line.vendorDue, line.vendorDueOverride != null)}</Box>
                        {!isVendor && <Box component="td" sx={{ ...tdSx, color: HX.accent, fontWeight: 700 }}>{editableCell(line, "companyDueOverride", line.companyDue, line.companyDueOverride != null)}</Box>}
                        {(editable || staff) && (
                          <Box component="td" sx={tdSx}>
                            {tag && <Box component="span" sx={{ color: tag.color, fontSize: "11px", fontWeight: 700 }}>{tag.label}</Box>}
                            {line.stateReason ? <Box component="span" sx={{ color: HX.tx3, fontSize: "11px" }}> — {line.stateReason}</Box> : null}
                          </Box>
                        )}
                        {(editable || staff) && (
                          <Box component="td" sx={{ ...tdSx, position: "relative" }}>
                            {editable && LINE_ACTIONS_BY_STATE[line.state] && (
                              <>
                                <Box component="button" type="button" aria-label="قائمة الطلب" onClick={() => setMenuLine(menuLine === line.id ? null : line.id)} sx={{ ...btnGhostSx, height: 26, px: "8px" }}>⋮</Box>
                                {menuLine === line.id && (
                                  <Box sx={{ position: "absolute", insetInlineEnd: 8, top: "100%", zIndex: 5, bgcolor: HX.surface, border: `0.5px solid ${HX.border2}`, borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", p: "4px", minWidth: 190 }}>
                                    {LINE_ACTIONS_BY_STATE[line.state].map((a) => (
                                      <Box key={a.action} component="button" type="button" onClick={() => runLineAction(line, a.action)}
                                        sx={{ all: "unset", display: "block", width: "100%", boxSizing: "border-box", cursor: "pointer", p: "7px 10px", borderRadius: "7px", fontSize: "12px", color: a.danger ? HX.red : HX.tx, "&:hover": { bgcolor: HX.surface2 } }}>{a.label}</Box>
                                    ))}
                                  </Box>
                                )}
                              </>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </tbody>
              </Box>
            </Box>
          </Box>

          <Box sx={{ fontSize: "11.5px", color: HX.tx2 }}>{FORMULA_NOTE}</Box>

          {/* التعديلات اليدوية */}
          <Box sx={{ ...cardBoxSx, p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ fontSize: "12.5px", fontWeight: 800 }}>التعديلات اليدوية</Box>
            {liveAdjustments.length === 0 && <Box sx={{ fontSize: "12px", color: HX.tx3 }}>لا توجد تعديلات.</Box>}
            {liveAdjustments.map((a) => (
              <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
                <span>{a.label}</span>
                <Box component="span" sx={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                  <b style={{ color: a.kind === "addition" ? HX.green : HX.red }}>{a.kind === "addition" ? "+" : "−"}{money(a.amount)}</b>
                  {editable && <Box component="button" type="button" onClick={() => { if (window.confirm("حذف التعديل؟")) removeAdjustment.mutate({ id: invoice.id, adjustmentId: a.id }); }} sx={{ ...btnDangerSx, height: 24, px: "8px" }}>حذف</Box>}
                </Box>
              </Box>
            ))}
            {editable && (
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <Box component="input" placeholder="الوصف" value={adjLabel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjLabel(e.target.value)} sx={{ ...inputSx, flex: 1, minWidth: 160 }} />
                <Box component="select" value={adjKind} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAdjKind(e.target.value as "addition" | "deduction")} sx={inputSx}>
                  <option value="deduction">خصم (يقلّل مستحق الصانع)</option>
                  <option value="addition">إضافة (يزوّد مستحق الصانع)</option>
                </Box>
                <Box component="input" type="number" min={0} placeholder="المبلغ ج.م" value={adjAmount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjAmount(e.target.value)} sx={{ ...inputSx, width: 120 }} />
                <Box component="button" type="button" disabled={addAdjustment.isPending} onClick={submitAdjustment} sx={btnPrimarySx}>إضافة</Box>
              </Box>
            )}
          </Box>

          {/* الإجماليات */}
          <Box sx={{ ...cardBoxSx, p: "12px 16px", display: "flex", gap: "22px", flexWrap: "wrap", alignItems: "center", bgcolor: HX.accentLight }}>
            <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>عدد الطلبات</Box><b>{invoice.ordersCount}</b></Box>
            <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>مستحق البائع</Box><b style={{ color: HX.green }}>{money(invoice.vendorDueTotal)}</b></Box>
            {!isVendor && <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>مستحق الشركة</Box><b style={{ color: HX.accent }}>{money(invoice.companyDueTotal)}</b></Box>}
            <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>الغرامات</Box><b style={{ color: HX.red }}>{money(invoice.finesTotal)}</b></Box>
            <Box><Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>التعديلات</Box><b>{money(invoice.adjustmentsTotal)}</b></Box>
            <Box sx={{ marginInlineStart: "auto", textAlign: "end" }}>
              <Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>{invoice.dueParty === "vendor" ? "الصافي المستحق للصانع" : "الصافي المستحق لهوميكس"}</Box>
              <b style={{ fontSize: 18 }}>{money(Math.abs(invoice.netAmount))}</b>
            </Box>
          </Box>

          {/* إيصال التحويل */}
          {invoice.status === "transferred" && (
            <Box sx={{ ...cardBoxSx, p: 1.5, display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <Box sx={{ fontSize: "12.5px", fontWeight: 800 }}>إيصال التحويل</Box>
              {invoice.hasReceipt ? (
                <>
                  <span style={{ fontSize: 12 }}>{invoice.receiptName} — {fmtDateTime(invoice.receiptUploadedAt)}</span>
                  <Box component="button" type="button" onClick={() => downloadReceipt(invoice.id, invoice.receiptName).catch(() => NotificationMeassage("error", "تعذّر تحميل الإيصال"))} sx={btnGhostSx}>عرض / تحميل</Box>
                  {staff && <Box component="button" type="button" onClick={() => { if (window.confirm("إزالة الإيصال؟")) removeReceipt.mutate(invoice.id); }} sx={btnDangerSx}>إزالة</Box>}
                </>
              ) : <span style={{ fontSize: 12, color: HX.amber }}>لسه مفيش إيصال مرفوع</span>}
              {staff && (
                <Box component="label" sx={{ ...btnPrimarySx, cursor: "pointer" }}>
                  {invoice.hasReceipt ? "استبدال الإيصال" : "رفع إيصال التحويل"}
                  <input type="file" accept={RECEIPT_ACCEPT} hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const problem = validateReceiptFile(file);
                    if (problem) { NotificationMeassage("error", problem); return; }
                    upload.mutate({ id: invoice.id, file });
                  }} />
                </Box>
              )}
            </Box>
          )}

          {staff && showActivity && (
            <Box sx={{ ...cardBoxSx, p: 1.5, display: "flex", flexDirection: "column", gap: "6px" }}>
              <Box sx={{ fontSize: "12.5px", fontWeight: 800 }}>سجل نشاط الفاتورة</Box>
              {(activity.data?.rows ?? []).map((e) => (
                <Box key={e.id} sx={{ fontSize: "12px", display: "flex", justifyContent: "space-between", gap: 1, borderBottom: `0.5px solid ${HX.border}`, pb: "4px" }}>
                  <span><b>{ACTION_LABELS[e.action] ?? e.action}</b> — {e.actorName ?? "—"}{describeEventDetail(e.detail ?? {}) ? ` — ${describeEventDetail(e.detail ?? {})}` : ""}</span>
                  <span style={{ color: HX.tx3 }}>{fmtDateTime(e.createdAt)}</span>
                </Box>
              ))}
              {activity.data?.rows.length === 0 && <Box sx={{ fontSize: "12px", color: HX.tx3 }}>لا يوجد نشاط.</Box>}
            </Box>
          )}
        </Box>
      )}
      {printing && data && (
        <div style={{ position: "fixed", left: "-10000px", top: 0 }}><InvoiceDocument ref={docRef} detail={data} /></div>
      )}
    </ModalShell>
  );
}
