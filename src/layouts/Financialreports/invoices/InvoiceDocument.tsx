/* eslint-disable react/prop-types */
/**
 * مستند الفاتورة المحفوظة (للطباعة / PDF / معاينة الصانع) — يُبنى من لقطة الفاتورة في الـ BE،
 * فلا يتغيّر بعد المراجعة مهما تغيّرت الطلبات. يعرض الطلبات المحسوبة فقط.
 */
import React from "react";
import logo from "../../../assets/images/homix.png";
import type { InvoiceDetail } from "query/financialInvoices";
import { money } from "../utils/calc";
import { MARGIN_LABEL, OWES_LABEL, splitCompanyDue } from "../utils/companyDue";
import { FORMULA_NOTE, fmtDate } from "./shared";

const companyDueKindOfLine = (l: Parameters<typeof splitCompanyDue>[0][number]) => l.companyDueKind ?? (l.isWarehouseDelivery ? "margin" : "vendorOwes");

const cell = { padding: "7px 8px", borderBottom: "1px solid #e5e7eb", textAlign: "start" as const, fontSize: 12 };
const head = { ...cell, background: "#f3f4f6", fontWeight: 700, color: "#374151" };

const InvoiceDocument = React.forwardRef<HTMLDivElement, { detail: InvoiceDetail }>(({ detail }, ref) => {
  const { invoice, lines, adjustments } = detail;
  const counted = lines.filter((l) => l.state === "included");
  const split = splitCompanyDue(counted);
  const liveAdjustments = adjustments.filter((a) => !a.removedAt);
  return (
    <div ref={ref} dir="rtl" lang="ar" style={{ width: 794, padding: 32, background: "#fff", color: "#111827", fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <img src={logo} alt="HOMIX" style={{ height: 44 }} />
        <div style={{ textAlign: "end" }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>فاتورة تسوية الصانع</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{invoice.code ?? "مسودة — غير مرقّمة"}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 16 }}>
        <div><b>الصانع:</b> {invoice.vendorName}</div>
        <div><b>الدورة:</b> دورة {invoice.billingDay}</div>
        <div><b>الفترة:</b> {fmtDate(invoice.periodStart)} — {fmtDate(invoice.periodEnd)}</div>
        <div><b>الحالة:</b> {invoice.statusLabel}</div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
        <thead>
          <tr>{["رقم العملية", "رقم الطلب", "كود المنتج", "سعر التكلفة", "التحصيل", "الغرامات", "المستحق للبائع", MARGIN_LABEL, OWES_LABEL].map((h) => <th key={h} style={head}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {counted.map((l) => (
            <tr key={l.id}>
              <td style={cell}>{l.operationNumber || `OP-${l.orderId}`}</td>
              <td style={cell}>#{l.orderNumber}</td>
              <td style={cell}>{l.productCode || "—"}</td>
              <td style={cell}>{money(l.warehouseCost)}{l.warehouseCost > 0 ? "" : " ⚠ التكلفة غير مسجلة"}</td>
              <td style={cell}>{money(l.collectionTotal)}</td>
              <td style={cell}>{l.fines > 0 ? money(l.fines) : "—"}</td>
              <td style={cell}>{money(l.vendorDue)}</td>
              <td style={cell}>{companyDueKindOfLine(l) === "margin" ? money(l.companyDue) : "—"}</td>
              <td style={cell}>{companyDueKindOfLine(l) === "vendorOwes" ? money(l.companyDue) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 12 }}>{FORMULA_NOTE}</div>
      {liveAdjustments.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
          <thead><tr><th style={head}>تعديلات يدوية</th><th style={head}>النوع</th><th style={head}>المبلغ</th></tr></thead>
          <tbody>
            {liveAdjustments.map((a) => (
              <tr key={a.id}><td style={cell}>{a.label}</td><td style={cell}>{a.kind === "addition" ? "إضافة" : "خصم"}</td><td style={cell}>{a.kind === "addition" ? "+" : "−"}{money(a.amount)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ borderTop: "2px solid #111827", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>عدد الطلبات</span><b>{invoice.ordersCount}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>إجمالي مستحق البائع</span><b>{money(invoice.vendorDueTotal)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>{MARGIN_LABEL}</span><b>{money(split.homixMargin)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>{OWES_LABEL}</span><b>{money(split.vendorOwes)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>صافي التعديلات اليدوية</span><b>{money(invoice.adjustmentsTotal)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginTop: 4 }}>
          <span>{invoice.dueParty === "vendor" ? "الصافي المستحق للصانع" : "الصافي المستحق لهوميكس"}</span>
          <b>{money(Math.abs(invoice.netAmount))}</b>
        </div>
      </div>
    </div>
  );
});
InvoiceDocument.displayName = "InvoiceDocument";
export default InvoiceDocument;
