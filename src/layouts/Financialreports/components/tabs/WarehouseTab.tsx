/**
 * تبويب «تسويات المخزن» — تكلفة المخزن والغرامات لكل صانع.
 */
import React from "react";
import { Box } from "@mui/material";
import { money } from "../../utils/calc";
import { SellerTotals, SettlementSeller } from "../../utils/types";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTable from "../DetailTable";
import DetailTotalsRow from "../DetailTotalsRow";
import { Amount, AmountFine, OpId, Muted, ProdCode, Money, FineCell } from "../SettlementCells";

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
      <Box sx={{ overflowX: "auto" }}>
        <DetailTable
          columns={[
            { label: "رقم العملية" }, { label: "رقم الطلب" }, { label: "كود المنتج" },
            { label: "سعر التكلفة" }, { label: "الغرامات" },
          ]}
          rows={s.orders.map((o) => [
            <OpId>{o.op}</OpId>,
            <Muted>#{o.order}</Muted>,
            <ProdCode>{o.code}</ProdCode>,
            <Money value={o.cost} bold />,
            <FineCell value={o.fine} />,
          ])}
        />
      </Box>
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
