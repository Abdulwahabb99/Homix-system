/**
 * تبويب «تسويات البائع» — التحصيل والمستحق للبائع والغرامات لكل مورّد.
 * عند التوسيع يعرض الطلبات الفعلية التابعة للصانع خلال دورة الفوترة.
 */
import React from "react";
import { money } from "../../utils/calc";
import { SellerTotals, SettlementSeller } from "../../utils/types";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTotalsRow from "../DetailTotalsRow";
import DetailTable from "../DetailTable";
import { Amount, AmountFine, FineCell, Money, Muted, OpId, PayBadge, ProdCode } from "../SettlementCells";

const GRID = "34px 1fr 120px 120px 120px 120px 40px";

export default function SellerTab({ sellers }: { sellers: SettlementSeller[] }) {
  const renderCells = (_s: SettlementSeller, t: SellerTotals): React.ReactNode[] => [
    <Amount key="orders">{t.orders} طلبات</Amount>,
    <Amount key="collect">{money(t.collect)}</Amount>,
    <Amount key="due" tone="green">{money(t.dueSeller)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar title={`تفاصيل تسويات البائع — ${s.name}`} onExport={() => {}} />
      <DetailTable
        columns={[
          { label: "رقم العملية" },
          { label: "رقم الطلب" },
          { label: "كود المنتج" },
          { label: "سعر التكلفة" },
          { label: "المبلغ المطلوب تحصيله" },
          { label: "طريقة الدفع" },
          { label: "الغرامات" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation">{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order">#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product">{order.productCode || "—"}</ProdCode>,
          <Money key="cost" value={order.warehouseCost} />,
          <Money key="collection" value={order.collectionTotal} bold />,
          <PayBadge key="payment" pay={order.paymentStatus === 1 ? "cod" : "online"} />,
          <FineCell key="fine" value={order.fines} />,
        ])}
      />
      <DetailTotalsRow
        items={[
          { label: "إجمالي التحصيل", value: money(t.collect) },
          { label: "المستحق للبائع", value: money(t.dueSeller), tone: "green" },
          { label: "الغرامات", value: money(t.fine), tone: "red" },
          { label: "الصافي بعد الغرامات", value: money(t.netAfterFine), tone: "green" },
        ]}
      />
    </>
  );

  return (
    <SettlementSection
      sellers={sellers}
      gridTemplate={GRID}
      header={[
        { label: "" }, { label: "الصانع" },
        { label: "عدد الطلبات", align: "end" }, { label: "إجمالي التحصيل", align: "end" },
        { label: "المستحق للبائع", align: "end" }, { label: "الغرامات", align: "end" }, { label: "" },
      ]}
      renderCells={renderCells}
      renderDetail={renderDetail}
    />
  );
}
