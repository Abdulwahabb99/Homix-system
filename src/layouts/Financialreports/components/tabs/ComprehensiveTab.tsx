/**
 * تبويب «الفاتورة الشاملة» — المستحق للبائع والشركة معاً + ملخّص متدرّج لكل مورّد.
 * عند التوسيع يعرض الطلبات الفعلية التابعة للصانع خلال دورة الفوترة.
 */
import React, { useState } from "react";
import { money } from "../../utils/calc";
import { COMPREHENSIVE_NOTE } from "../../utils/constants";
import { BillingDay, SellerTotals, SettlementSeller } from "../../utils/types";
import { exportFinancialReport } from "query/financialReport";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import ComprehensiveSummary from "../ComprehensiveSummary";
import DetailTable from "../DetailTable";
import { Amount, AmountFine, FineCell, Money, Muted, OpId, ProdCode } from "../SettlementCells";

const GRID = "34px 1fr 120px 120px 120px 120px 40px";

export default function ComprehensiveTab({ sellers, billingDay }: { sellers: SettlementSeller[]; billingDay: BillingDay }) {
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExport = (vendorId: string) => {
    if (exportingId) return;
    setExportingId(vendorId);
    exportFinancialReport(billingDay, vendorId)
      .catch(() => NotificationMeassage("error", "حدث خطأ أثناء تصدير فاتورة المورّد"))
      .finally(() => setExportingId(null));
  };

  const renderCells = (_s: SettlementSeller, t: SellerTotals): React.ReactNode[] => [
    <Amount key="orders">{t.orders} طلبات</Amount>,
    <Amount key="seller" tone="green">{money(t.dueSeller)}</Amount>,
    <Amount key="comp" tone="accent">{money(t.dueComp)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar
        title={`الفاتورة الشاملة — ${s.name}`}
        onExport={() => handleExport(s.id)}
        exporting={exportingId === s.id}
      />
      <DetailTable
        columns={[
          { label: "رقم العملية" },
          { label: "رقم الطلب" },
          { label: "كود المنتج" },
          { label: "المستحق للبائع", tone: "green" },
          { label: "المستحق للشركة", tone: "accent" },
          { label: "الغرامات" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation" to={`/orders/${order.orderId || order.id}`}>{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order" to={`/orders/${order.orderId || order.id}`}>#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product" to={order.productId ? `/products/${order.productId}` : undefined}>{order.productCode || "—"}</ProdCode>,
          <Money key="vendor" value={order.vendorDue} tone="green" bold />,
          <Money key="company" value={order.companyDue} tone="accent" bold />,
          <FineCell key="fine" value={order.fines} />,
        ])}
      />
      <ComprehensiveSummary
        items={[
          { label: "عدد الطلبات", value: String(t.orders) },
          { label: "إجمالي مستحق البائع", value: money(t.dueSeller), tone: "green" },
          { label: "إجمالي مستحق الشركة", value: money(t.dueComp), tone: "accent" },
          { label: "إجمالي الغرامات", value: money(t.fine), tone: "red" },
          { label: "الإجمالي الكلي", value: money(t.totalCombined) },
        ]}
        note={COMPREHENSIVE_NOTE}
      />
    </>
  );

  return (
    <SettlementSection
      sellers={sellers}
      gridTemplate={GRID}
      header={[
        { label: "" }, { label: "الصانع" },
        { label: "عدد الطلبات", align: "end" }, { label: "المستحق للبائع", align: "end" },
        { label: "المستحق للشركة", align: "end" }, { label: "الغرامات", align: "end" }, { label: "" },
      ]}
      renderCells={renderCells}
      renderDetail={renderDetail}
    />
  );
}
