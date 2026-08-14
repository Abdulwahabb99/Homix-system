/**
 * تبويب «تسويات المخزن» — تكلفة المخزن والغرامات لكل مورّد.
 * عند التوسيع يعرض الطلبات الفعلية التابعة للصانع خلال دورة الفوترة.
 */
import React from "react";
import { money } from "../../utils/calc";
import { SellerTotals, SettlementSeller } from "../../utils/types";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTotalsRow from "../DetailTotalsRow";
import DetailTable from "../DetailTable";
import { Amount, AmountFine, FineCell, Money, Muted, OpId, ProdCode } from "../SettlementCells";

const GRID = "34px 1fr 120px 120px 120px 40px";

export default function WarehouseTab({ sellers }: { sellers: SettlementSeller[] }) {
  const renderCells = (_s: SettlementSeller, t: SellerTotals): React.ReactNode[] => [
    <Amount key="orders">{t.orders} طلبات</Amount>,
    <Amount key="cost">{money(t.cost)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar title={`تفاصيل تسويات المخزن — ${s.name}`} onPrint={() => {}} onExport={() => {}} />
      <DetailTable
        columns={[
          { label: "رقم العملية" },
          { label: "رقم الطلب" },
          { label: "كود المنتج" },
          { label: "سعر التكلفة" },
          { label: "الغرامات" },
        ]}
        rows={s.row.orders.map((order) => [
          <OpId key="operation">{order.operationNumber || `OP-${order.id}`}</OpId>,
          <Muted key="order">#{order.orderNumber || order.id}</Muted>,
          <ProdCode key="product">{order.productCode || "—"}</ProdCode>,
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
  );
}
