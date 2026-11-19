/**
 * فاتورة تسوية البائع (تبويب «تسويات البائع») — يُلتقط إلى PDF عبر html2pdf.
 * محوّل رفيع إلى «كشف تسوية بائع»: نفس تصميم كشف المورّد المعتمد، بإجماليات تسليمات البائع.
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

const SellerSettlementInvoiceDocument = React.forwardRef<HTMLDivElement, Props>(({ seller, totals, cycle }, ref) => {
  const data = useMemo(() => statementFromLive(seller, totals, cycle, "seller"), [seller, totals, cycle]);
  return <SettlementStatement ref={ref} data={data} />;
});

SellerSettlementInvoiceDocument.displayName = "SellerSettlementInvoiceDocument";

export default SellerSettlementInvoiceDocument;
