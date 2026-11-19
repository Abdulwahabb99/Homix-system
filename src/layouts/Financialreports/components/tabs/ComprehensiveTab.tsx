/**
 * تبويب «الفاتورة الشاملة» — المستحق للبائع والشركة معاً + ملخّص متدرّج لكل مورّد.
 * عند التوسيع يعرض الطلبات الفعلية التابعة للصانع خلال دورة الفوترة.
 */
import React, { useEffect, useRef, useState } from "react";
import { money } from "../../utils/calc";
import { arNum } from "../../utils/format";
import { COMPREHENSIVE_NOTE } from "../../utils/constants";
import { BillingDay, SellerTotals, SettlementSeller } from "../../utils/types";
import { exportFinancialReport, type FinancialCycle, type FinancialDateRange } from "query/financialReport";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { downloadOrderInvoicePdf, printElementNatively } from "layouts/Orders/utils/invoicePdf";
import SettlementSection from "../SettlementSection";
import { LiveInvoiceHeaderStatus } from "../LiveInvoice";
import { LineStateTag } from "../LiveAmountCell";
import LiveAmountCell from "../LiveAmountCell";
import { COMPANY_DUE_LABEL, COMPANY_DUE_TIP } from "../../utils/companyDue";
import { forPrint, isCounted } from "../../utils/liveOverlay";
import DetailHeaderBar from "../DetailHeaderBar";
import ComprehensiveSummary from "../ComprehensiveSummary";
import DetailTable from "../DetailTable";
import { Amount, AmountFine, Muted, OpId, ProdCode } from "../SettlementCells";
import VendorSettlementInvoiceDocument from "../../vendorInvoice/VendorSettlementInvoiceDocument";

const GRID = "34px 1fr 100px 120px 120px 120px 110px 40px";

export default function ComprehensiveTab({
  sellers, billingDay, cycle, referenceDate, range,
}: { sellers: SettlementSeller[]; billingDay: BillingDay; cycle: FinancialCycle | null; referenceDate?: string; range?: FinancialDateRange }) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [printSeller, setPrintSeller] = useState<{ seller: SettlementSeller; totals: SellerTotals } | null>(null);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  const handleExport = (vendorId: string) => {
    if (exportingId) return;
    setExportingId(vendorId);
    exportFinancialReport(billingDay, vendorId, referenceDate, range)
      .catch(() => NotificationMeassage("error", "حدث خطأ أثناء تصدير فاتورة المورّد"))
      .finally(() => setExportingId(null));
  };

  const handlePrintInvoice = (seller: SettlementSeller, totals: SellerTotals) => {
    if (isPrintingInvoice) return;
    setIsPrintingInvoice(true);
    setPrintSeller({ seller: forPrint(seller), totals });
  };

  useEffect(() => {
    if (!printSeller) return;
    const timer = window.setTimeout(async () => {
      try {
        if (!printContainerRef.current) throw new Error("missing invoice element");
        await downloadOrderInvoicePdf(printContainerRef.current, `فاتورة-مورد-${printSeller.seller.name}`);
        NotificationMeassage("success", "تم تحميل الفاتورة");
      } catch (e) {
        console.error(e);
        NotificationMeassage("error", "تعذر تصدير الفاتورة — سيُفتح مربع الطباعة");
        if (printContainerRef.current) printElementNatively(printContainerRef.current);
      } finally {
        setIsPrintingInvoice(false);
        setPrintSeller(null);
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [printSeller]);

  const renderCells = (_s: SettlementSeller, t: SellerTotals): React.ReactNode[] => [
    <Amount key="orders">{arNum(t.orders)} طلبات</Amount>,
    <Amount key="seller" tone="green">{money(t.dueSeller)}</Amount>,
    <Amount key="company" tone="accent">{money(t.dueComp)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar
        title={`الفاتورة الشاملة — ${s.name}`}
        status={<LiveInvoiceHeaderStatus seller={s} />}
        onPrint={() => handlePrintInvoice(s, t)}
        onExport={() => handleExport(s.id)}
        exporting={exportingId === s.id}
      />
      <DetailTable
        mutedRows={new Set(s.row.orders.flatMap((order, index) => (isCounted(order) ? [] : [index])))}
        columns={[
          { label: "رقم العملية" },
          { label: "رقم الطلب" },
          { label: "كود المنتج" },
          { label: "المستحق للبائع", tone: "green" },
          { label: COMPANY_DUE_LABEL, tone: "accent", tip: COMPANY_DUE_TIP },
          { label: "الغرامات" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation" to={`/orders/${order.orderId || order.id}`}>{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order" to={`/orders/${order.orderId || order.id}`}>#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product" to={order.productId ? `/products/${order.productId}` : undefined}>{order.productCode || "—"}</ProdCode>,
          <LiveAmountCell key="vendor" seller={s} order={order} field="vendorDueOverride" tone="green" bold />,
          <LiveAmountCell key="company" seller={s} order={order} field="companyDueOverride" tone="accent" bold />,
          <LiveAmountCell key="fine" seller={s} order={order} field="finesOverride" />,
        ])}
      />
      <ComprehensiveSummary
        items={[
          { label: "عدد الطلبات", value: arNum(t.orders) },
          { label: "إجمالي مستحق البائع", value: money(t.dueSeller), tone: "green" },
          { label: "إجمالي المستحق لهوميكس", value: money(t.dueComp), tone: "accent" },
          { label: "إجمالي الغرامات", value: money(t.fine), tone: "red" },
          // تعديلات الفاتورة اليدوية موجودة في الأرشيف — نعرضها هنا كي لا يختلف الصافي بين العرضين
          ...(s.invoice && s.invoice.adjustmentsTotal !== 0
            ? [
              { label: "تعديلات يدوية على الفاتورة", value: money(s.invoice.adjustmentsTotal) },
              { label: "صافي مستحق الصانع بعد التعديلات", value: money(t.dueSeller + s.invoice.adjustmentsTotal), tone: "green" as const },
            ]
            : []),
        ]}
        note={COMPREHENSIVE_NOTE}
      />
    </>
  );

  return (
    <>
      <SettlementSection
        sellers={sellers}
        gridTemplate={GRID}
        header={[
          { label: "" }, { label: "الصانع" },
          { label: "عدد الطلبات", align: "end" }, { label: "المستحق للبائع", align: "end" },
          { label: COMPANY_DUE_LABEL, align: "end", tip: COMPANY_DUE_TIP },
          { label: "الغرامات", align: "end" }, { label: "" },
        ]}
        renderCells={renderCells}
        renderDetail={renderDetail}
      />
      {printSeller && (
        <div style={{ position: "fixed", left: "-10000px", top: 0 }}>
          <VendorSettlementInvoiceDocument
            ref={printContainerRef}
            seller={printSeller.seller}
            totals={printSeller.totals}
            cycle={cycle}
          />
        </div>
      )}
    </>
  );
}
