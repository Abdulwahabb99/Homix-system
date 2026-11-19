/**
 * مستند الفاتورة المحفوظة (للطباعة / PDF / معاينة الصانع) — يُبنى من لقطة الفاتورة في الـ BE،
 * فلا يتغيّر بعد المراجعة مهما تغيّرت الطلبات. يعرض الطلبات المحسوبة فقط.
 * محوّل رفيع إلى «كشف تسوية مورد» (نفس تصميم الفاتورة الحية)؛ أعمدة التكلفة/التحصيل داخلية ولا تُطبع.
 */
import React, { useMemo } from "react";
import type { InvoiceDetail } from "query/financialInvoices";
import SettlementStatement from "../vendorInvoice/SettlementStatement";
import { statementFromInvoice } from "../vendorInvoice/statementFormat";

const InvoiceDocument = React.forwardRef<HTMLDivElement, { detail: InvoiceDetail }>(({ detail }, ref) => {
  const data = useMemo(() => statementFromInvoice(detail), [detail]);
  return <SettlementStatement ref={ref} data={data} />;
});
InvoiceDocument.displayName = "InvoiceDocument";
export default InvoiceDocument;
