/**
 * كشف تسوية المورّد للفاتورة الحية (تبويب «الفاتورة الشاملة») — يُلتقط إلى PDF عبر html2pdf.
 * محوّل رفيع: يبني `StatementData` من بيانات التبويب ويرسمه `SettlementStatement`.
 * (مستندا البائع/المخزن ما زالا بالتصميم القديم وملف `VendorSettlementInvoice.module.css`.)
 */
import React, { useMemo } from "react";
import type { FinancialCycle } from "query/financialReport";
import type { SellerTotals, SettlementSeller } from "../utils/types";
import SettlementStatement from "./SettlementStatement";
import { statementFromLive } from "./statementFormat";

interface Props {
  seller: SettlementSeller;
  totals: SellerTotals;
  cycle: FinancialCycle | null;
}

const VendorSettlementInvoiceDocument = React.forwardRef<HTMLDivElement, Props>(({ seller, totals, cycle }, ref) => {
  const data = useMemo(() => statementFromLive(seller, totals, cycle), [seller, totals, cycle]);
  return <SettlementStatement ref={ref} data={data} />;
});

VendorSettlementInvoiceDocument.displayName = "VendorSettlementInvoiceDocument";

export default VendorSettlementInvoiceDocument;
