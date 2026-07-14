/**
 * تبويب «تسويات البائع» — التحصيل والمستحق للبائع وطريقة الدفع والغرامات.
 */
import React from "react";
import { Box } from "@mui/material";
import { money } from "../../utils/calc";
import { SellerTotals, SettlementSeller } from "../../utils/types";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTable from "../DetailTable";
import DetailTotalsRow from "../DetailTotalsRow";
import { Amount, AmountFine, OpId, Muted, ProdCode, Money, PayBadge, FineCell } from "../SettlementCells";

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
      <Box sx={{ overflowX: "auto" }}>
        <DetailTable
          columns={[
            { label: "رقم العملية" }, { label: "رقم الطلب" }, { label: "كود المنتج" },
            { label: "سعر التكلفة" }, { label: "المبلغ المطلوب تحصيله" },
            { label: "طريقة الدفع" }, { label: "الغرامات" },
          ]}
          rows={s.orders.map((o) => [
            <OpId key="op">{o.op}</OpId>,
            <Muted key="order">#{o.order}</Muted>,
            <ProdCode key="code">{o.code}</ProdCode>,
            <Money key="cost" value={o.cost} />,
            <Money key="collect" value={o.collect} bold />,
            <PayBadge key="pay" pay={o.pay} />,
            <FineCell key="fine" value={o.fine} />,
          ])}
        />
      </Box>
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
