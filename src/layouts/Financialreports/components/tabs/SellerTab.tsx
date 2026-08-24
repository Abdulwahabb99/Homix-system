/**
 * تبويب «تسويات البائع» — التحصيل والمستحق للبائع والغرامات لكل مورّد.
 * عند التوسيع يعرض الطلبات الفعلية التابعة للصانع خلال دورة الفوترة.
 */
import React, { useEffect, useRef, useState } from "react";
import { money } from "../../utils/calc";
import { BillingDay, SellerTotals, SettlementSeller } from "../../utils/types";
import { exportFinancialReport, type FinancialCycle } from "query/financialReport";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { downloadOrderInvoicePdf, printElementNatively } from "layouts/Orders/utils/invoicePdf";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTotalsRow from "../DetailTotalsRow";
import DetailTable from "../DetailTable";
import { Amount, AmountFine, FineCell, Money, Muted, OpId, PayBadge, ProdCode } from "../SettlementCells";
import SellerSettlementInvoiceDocument from "../../vendorInvoice/SellerSettlementInvoiceDocument";

const GRID = "34px 1fr 100px 120px 115px 115px 115px 100px 40px";

export default function SellerTab({
  sellers, billingDay, cycle,
}: { sellers: SettlementSeller[]; billingDay: BillingDay; cycle: FinancialCycle | null }) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [printSeller, setPrintSeller] = useState<{ seller: SettlementSeller; totals: SellerTotals } | null>(null);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);
  const printContainerRef = useRef<HTMLDivElement | null>(null);

  const handleExport = (vendorId: string) => {
    if (exportingId) return;
    setExportingId(vendorId);
    exportFinancialReport(billingDay, vendorId)
      .catch(() => NotificationMeassage("error", "حدث خطأ أثناء تصدير فاتورة المورّد"))
      .finally(() => setExportingId(null));
  };

  const handlePrintInvoice = (seller: SettlementSeller, totals: SellerTotals) => {
    if (isPrintingInvoice) return;
    setIsPrintingInvoice(true);
    setPrintSeller({ seller, totals });
  };

  useEffect(() => {
    if (!printSeller) return;
    const timer = window.setTimeout(async () => {
      try {
        if (!printContainerRef.current) throw new Error("missing invoice element");
        await downloadOrderInvoicePdf(printContainerRef.current, `فاتورة-تسوية-بائع-${printSeller.seller.name}`);
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
    <Amount key="orders">{t.orders} طلبات</Amount>,
    <Amount key="collect">{money(t.collect)}</Amount>,
    <Amount key="shipping">{money(t.vendorShippingCost)}</Amount>,
    <Amount key="due" tone="green">{money(t.dueSeller)}</Amount>,
    <Amount key="company" tone="accent">{money(t.dueComp)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar
        title={`تفاصيل تسويات البائع — ${s.name}`}
        onPrint={() => handlePrintInvoice(s, t)}
        onExport={() => handleExport(s.id)}
        exporting={exportingId === s.id}
      />
      <DetailTable
        columns={[
          { label: "رقم العملية" },
          { label: "رقم الطلب" },
          { label: "كود المنتج" },
          { label: "سعر التكلفة" },
          { label: "شحن البائع" },
          { label: "المبلغ المطلوب تحصيله" },
          { label: "طريقة الدفع" },
          { label: "المستحق للبائع" },
          { label: "المستحق للشركة" },
          { label: "الغرامات" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation" to={`/orders/${order.orderId || order.id}`}>{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order" to={`/orders/${order.orderId || order.id}`}>#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product" to={order.productId ? `/products/${order.productId}` : undefined}>{order.productCode || "—"}</ProdCode>,
          <Money key="cost" value={order.warehouseCost} />,
          <Money key="shipping" value={order.vendorShippingCost} />,
          <Money key="collection" value={order.collectionTotal} bold />,
          <PayBadge key="payment" pay={order.paymentStatus === 1 ? "cod" : "online"} />,
          <Money key="vendorDue" value={order.vendorDue} tone="green" bold />,
          <Money key="companyDue" value={order.companyDue} tone="accent" bold />,
          <FineCell key="fine" value={order.fines} />,
        ])}
      />
      <DetailTotalsRow
        items={[
          { label: "إجمالي التحصيل", value: money(t.collect) },
          { label: "إجمالي تكلفة المنتجات", value: money(t.cost) },
          { label: "إجمالي شحن البائع", value: money(t.vendorShippingCost) },
          { label: "المستحق للبائع", value: money(t.dueSeller), tone: "green" },
          { label: "المستحق للشركة", value: money(t.dueComp), tone: "accent" },
          { label: "الغرامات", value: money(t.fine), tone: "red" },
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
          { label: "المستحق للبائع", align: "end" }, { label: "المستحق للشركة", align: "end" },
          { label: "الغرامات", align: "end" }, { label: "" },
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
