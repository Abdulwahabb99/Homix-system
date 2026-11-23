/**
 * تبويب «تسويات البائع» — التحصيل والمستحق للبائع والغرامات لكل مورّد.
 * عند التوسيع يعرض الطلبات الفعلية التابعة للصانع خلال دورة الفوترة.
 */
import React, { useEffect, useRef, useState } from "react";
import { money, orderNet } from "../../utils/calc";
import { netLabelOf, netToneOf } from "../../utils/netDirection";
import { arNum } from "../../utils/format";
import { BillingDay, SellerTotals, SettlementSeller } from "../../utils/types";
import { exportFinancialReport, type FinancialCycle, type FinancialDateRange } from "query/financialReport";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { STATEMENT_PDF_OPTIONS, downloadOrderInvoicePdf, printElementNatively } from "layouts/Orders/utils/invoicePdf";
import SettlementSection from "../SettlementSection";
import { LiveInvoiceHeaderStatus } from "../LiveInvoice";
import LiveAmountCell, { LineStateTag } from "../LiveAmountCell";
import { COMPANY_DUE_LABEL, COMPANY_DUE_TIP, companyDueKindOf } from "../../utils/companyDue";
import { forPrint, isCounted } from "../../utils/liveOverlay";
import { LiveOrderMenu } from "../LiveOrderActions";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTotalsRow from "../DetailTotalsRow";
import DetailTable from "../DetailTable";
import { Amount, AmountFine, Money, Muted, NetValue, OpId, PayBadge, ProdCode } from "../SettlementCells";
import SellerSettlementInvoiceDocument from "../../vendorInvoice/SellerSettlementInvoiceDocument";

const GRID = "34px 1fr 100px 120px 115px 115px 115px 100px 130px 40px";

export default function SellerTab({
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
        await downloadOrderInvoicePdf(printContainerRef.current, `فاتورة-تسوية-بائع-${printSeller.seller.name}`, STATEMENT_PDF_OPTIONS);
        NotificationMeassage("success", "تم تحميل الفاتورة");
      } catch (e) {
        console.error(e);
        NotificationMeassage("error", "تعذر تصدير الفاتورة — سيُفتح مربع الطباعة");
        if (printContainerRef.current) printElementNatively(printContainerRef.current, { fullBleed: true });
      } finally {
        setIsPrintingInvoice(false);
        setPrintSeller(null);
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [printSeller]);

  const renderCells = (_s: SettlementSeller, t: SellerTotals): React.ReactNode[] => [
    <Amount key="orders">{arNum(t.orders)} طلبات</Amount>,
    <Amount key="collect">{money(t.collect)}</Amount>,
    <Amount key="shipping">{money(t.vendorShippingCost)}</Amount>,
    <Amount key="due" tone="green">{money(t.dueSeller)}</Amount>,
    <Amount key="company" tone="accent">{money(t.dueComp)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
    <Amount key="net"><NetValue value={t.net} /></Amount>,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar
        title={`تفاصيل تسليمات البائع — ${s.name}`}
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
          { label: "سعر التكلفة" },
          { label: "شحن البائع" },
          { label: "المبلغ المطلوب تحصيله" },
          { label: "طريقة الدفع" },
          { label: "مستحق البائع" },
          { label: COMPANY_DUE_LABEL, tip: COMPANY_DUE_TIP },
          { label: "الغرامات" },
          { label: "الصافي" },
          { label: "" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation" to={`/orders/${order.orderId || order.id}`}>{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order" to={`/orders/${order.orderId || order.id}`}>#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product" to={order.productId ? `/products/${order.productId}` : undefined}>{order.productCode || "—"}</ProdCode>,
          <LiveAmountCell key="cost" seller={s} order={order} field="warehouseCostOverride" />,
          // شحن البائع ينطبق على تسليمات البائع فقط — تسليم المخزن يبقى للقراءة
          companyDueKindOf(order) === "vendorOwes"
            ? <LiveAmountCell key="shipping" seller={s} order={order} field="vendorShippingCostOverride" />
            : <Money key="shipping" value={order.vendorShippingCost} />,
          <LiveAmountCell key="collection" seller={s} order={order} field="collectionOverride" bold />,
          <PayBadge key="payment" pay={order.paymentStatus === 1 ? "cod" : "online"} />,
          <LiveAmountCell key="vendorDue" seller={s} order={order} field="vendorDueOverride" tone="green" bold />,
          <LiveAmountCell key="companyDue" seller={s} order={order} field="companyDueOverride" tone="accent" bold />,
          <LiveAmountCell key="fine" seller={s} order={order} field="finesOverride" />,
          isCounted(order) ? <NetValue key="net" value={orderNet(order)} /> : <Muted key="net">—</Muted>,
          <LiveOrderMenu key="actions" seller={s} order={order} />,
        ])}
      />
      <DetailTotalsRow
        items={[
          { label: "إجمالي التحصيل", value: money(t.collect) },
          { label: "إجمالي تكلفة المنتجات", value: money(t.cost) },
          { label: "إجمالي شحن البائع", value: money(t.vendorShippingCost) },
          { label: "مستحق البائع", value: money(t.dueSeller), tone: "green" },
          { label: COMPANY_DUE_LABEL, value: money(t.dueComp), tone: "accent" },
          { label: "الغرامات", value: money(t.fine), tone: "red" },
          { label: netLabelOf(t.net), value: money(Math.abs(t.net)), tone: netToneOf(t.net) },
        ]}
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
          { label: "عدد الطلبات", align: "end" }, { label: "إجمالي التحصيل", align: "end" },
          { label: "إجمالي شحن البائع", align: "end" },
          { label: "مستحق البائع", align: "end" }, { label: COMPANY_DUE_LABEL, align: "end", tip: COMPANY_DUE_TIP },
          { label: "الغرامات", align: "end" }, { label: "الصافي", align: "end", tip: "مستحق البائع − مستحق هوميكس − الغرامات (أخضر: للبائع، أحمر: لهوميكس)" }, { label: "" },
        ]}
        renderCells={renderCells}
        renderDetail={renderDetail}
      />
      {printSeller && (
        <div style={{ position: "fixed", left: "-10000px", top: 0 }}>
          <SellerSettlementInvoiceDocument
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
