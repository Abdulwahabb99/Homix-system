/**
 * شريط التحديد الجماعي — يظهر لاصقاً أعلى الجدول عند تحديد صفوف.
 * كل حقل اختياري ويُرسل فقط ما اختاره المستخدم عبر PUT /shipments/bulk-update.
 * خيارات القوائم تأتي من الـ meta فتظهر أي حالة جديدة تلقائياً.
 */
import { BULK_CLEAR as CLEAR, buildShipmentsBulkPayload } from "./shipmentsBulkPayload";
import React, { useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import type { BulkUpdateShipmentPayload } from "query/shipmentEdit";
import type { ShipmentsMeta, ShipmentsMetaOption } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

const CTRL: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 12,
  color: HX.tx,
  background: HX.surface2,
  border: `0.5px solid ${HX.border}`,
  borderRadius: 9,
  padding: "0 10px",
  height: 36,
};

export interface ShipmentsBulkBarProps {
  selectedCount: number;
  meta?: ShipmentsMeta;
  isSaving: boolean;
  /** عدد المحدد منها شحنات أُعيد تخصيصها (لا تتغير حالة الشحنة لها) */
  reassignedSelectedCount?: number;
  onApply: (data: BulkUpdateShipmentPayload, onDone: () => void) => void | Promise<void>;
  onExportSelected: () => void;
  onClear: () => void;
}

export default function ShipmentsBulkBar({
  selectedCount,
  meta,
  isSaving,
  reassignedSelectedCount = 0,
  onApply,
  onExportSelected,
  onClear,
}: ShipmentsBulkBarProps) {
  const [sched, setSched] = useState("");
  const [date, setDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [carrier, setCarrier] = useState("");
  const [status, setStatus] = useState("");

  if (selectedCount === 0) return null;

  const handleApply = () => {
    const data: BulkUpdateShipmentPayload = buildShipmentsBulkPayload({ sched, date, deliveryDate, carrier, status });
    if (Object.keys(data).length === 0) {
      NotificationMeassage("error", "اختر حاجة واحدة على الأقل لتطبيقها");
      return;
    }
    // تأكيد قبل التطبيق مع ملخص التغييرات.
    const label = (opts: ShipmentsMetaOption[] | undefined, v: string) => opts?.find((o) => String(o.value) === v)?.label ?? v;
    const lines: string[] = [];
    if (sched) lines.push(`حالة الجدولة: ${sched === CLEAR ? "تفريغ" : label(meta?.scheduleStatuses, sched)}`);
    if (date) lines.push(`تاريخ الجدولة: ${date}`);
    if (deliveryDate) lines.push(`تاريخ التوصيل: ${deliveryDate}`);
    if (carrier) lines.push(`شركة الشحن: ${carrier === CLEAR ? "بدون شركة" : label(meta?.shippingCompanies, carrier)}`);
    if (status) lines.push(`حالة الشحنة: ${label(meta?.shipmentStatuses, status)}`);
    const skipNote = status && reassignedSelectedCount
      ? `\n\n${reassignedSelectedCount} شحنة أُعيد تخصيصها لن تتغير حالة الشحنة لها.` : "";
    if (!window.confirm(`تطبيق على ${selectedCount} شحنة:\n• ${lines.join("\n• ")}${skipNote}`)) return;
    // كما في التصميم: تحديد موعد بدون حالة جدولة صريحة يضبط الحالة «مجدول» إن وُجدت.
    if (date && !sched) {
      const scheduled = (meta?.scheduleStatuses ?? []).find((o) => /^مجدول/.test(o.label));
      if (scheduled) data.scheduleStatus = Number(scheduled.value);
    }
    onApply(data, () => {
      setSched("");
      setDate("");
      setDeliveryDate("");
      setCarrier("");
      setStatus("");
    });
  };

  const btn = (primary: boolean): React.CSSProperties => ({
    fontFamily: FONT,
    fontSize: 12.5,
    fontWeight: 700,
    height: 36,
    padding: "0 16px",
    borderRadius: 9,
    cursor: isSaving ? "default" : "pointer",
    opacity: isSaving ? 0.6 : 1,
    border: primary ? "none" : `1px solid ${HX.border2}`,
    background: primary ? HX.accent : HX.surface,
    color: primary ? "#fff" : HX.tx2,
  });

  return (
    <Box
      role="region"
      aria-label="تعديل الشحنات المحددة"
      sx={{
        position: "sticky", top: 0, zIndex: 30,
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px",
        bgcolor: HX.surface,
        border: `0.5px solid ${HX.accent}`,
        boxShadow: "0 6px 18px rgba(0,0,0,.06)",
        borderRadius: "12px", p: "10px 14px",
        fontFamily: FONT,
      }}
    >
      <Box sx={{ fontSize: "12.5px", color: HX.tx2, pl: "6px", borderLeft: `0.5px solid ${HX.border}`, ml: "4px" }}>
        <Box component="b" sx={{ color: HX.accent, fontSize: "15px" }}>{selectedCount}</Box> شحنة محددة
      </Box>
      <select aria-label="حالة الجدولة" style={CTRL} value={sched} onChange={(e) => setSched(e.target.value)}>
        <option value="">حالة الجدولة…</option>
        <option value={CLEAR}>— تفريغ الحالة —</option>
        {(meta?.scheduleStatuses ?? []).map((o) => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
      </select>
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: HX.tx2, fontWeight: 700 }}>
        <span>تاريخ الجدولة</span>
        <input aria-label="تاريخ الجدولة" type="date" style={CTRL} value={date} onChange={(e) => setDate(e.target.value)} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: HX.tx2, fontWeight: 700 }}>
          <span>تاريخ التوصيل</span>
          <input aria-label="تاريخ التوصيل" type="date" style={CTRL} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
        </Box>
        <Box component="span" sx={{ fontSize: "10.5px", color: HX.tx2, fontWeight: 400 }}>يحدد دورة الفاتورة للشحنات المتسلّمة</Box>
      </Box>
      <select aria-label="شركة الشحن" style={CTRL} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
        <option value="">شركة الشحن…</option>
        <option value={CLEAR}>— بدون شركة —</option>
        {(meta?.shippingCompanies ?? []).map((o) => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
      </select>
      <select aria-label="حالة الشحنة" style={CTRL} value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">حالة الشحنة…</option>
        {(meta?.shipmentStatuses ?? []).map((o) => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
      </select>
      <button type="button" style={btn(true)} disabled={isSaving} onClick={handleApply}>
        {isSaving ? "جارٍ التطبيق..." : "تطبيق على المحدد"}
      </button>
      <button type="button" style={btn(false)} onClick={onExportSelected}>تصدير المحدد</button>
      <Box
        component="button"
        type="button"
        onClick={onClear}
        sx={{
          mr: "auto", border: "none", background: "none", fontFamily: FONT,
          fontSize: "12px", fontWeight: 700, color: HX.tx2, cursor: "pointer",
          "&:hover": { color: HX.red },
        }}
      >
        إلغاء التحديد
      </Box>
    </Box>
  );
}
