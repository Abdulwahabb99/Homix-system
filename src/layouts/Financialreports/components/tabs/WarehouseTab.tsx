/**
 * تبويب «تسويات المخزن» — تكلفة المخزن والغرامات لكل مورّد.
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
import { Amount, AmountFine, FineCell, Money, Muted, OpId, ProdCode } from "../SettlementCells";
import WarehouseSettlementInvoiceDocument from "../../vendorInvoice/WarehouseSettlementInvoiceDocument";

const GRID = "34px 1fr 120px 120px 120px 40px";

export default function WarehouseTab({
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
        await downloadOrderInvoicePdf(printContainerRef.current, `فاتورة-تسوية-مخزن-${printSeller.seller.name}`);
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
    <Amount key="cost">{money(t.cost)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar
        title={`تفاصيل تسويات المخزن — ${s.name}`}
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
          { label: "الغرامات" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation" to={`/shipments/${order.shipmentId || order.id}`}>{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order" to={`/shipments/${order.shipmentId || order.id}`}>#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product" to={order.productId ? `/products/${order.productId}` : undefined}>{order.productCode || "—"}</ProdCode>,
          <Money key="cost" value={order.warehouseCost} bold />,
          <FineCell key="fine" value={order.fines} />,
        ])}
      />
      <DetailTotalsRow
        items={[
          { label: "عدد الطلبات", value: String(t.orders) },
          { label: "إجمالي التكلفة", value: money(t.cost) },
          { label: "إجمالي الغرامات", value: money(t.fine), tone: "red" },
          { label: "الصافي المطلوب", value: money(t.netRequired), tone: "accent" },
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
          { label: "عدد الطلبات", align: "end" }, { label: "تكلفة المخزن", align: "end" },
          { label: "الغرامات", align: "end" }, { label: "" },
        ]}
        renderCells={renderCells}
        renderDetail={renderDetail}
      />
      {printSeller && (
        <div style={{ position: "fixed", left: "-10000px", top: 0 }}>
          <WarehouseSettlementInvoiceDocument
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
