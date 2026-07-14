/**
 * تبويب «الفاتورة الشاملة» — المستحق للبائع والشركة معاً + ملخّص متدرّج.
 */
import React from "react";
import { Box } from "@mui/material";
import { money } from "../../utils/calc";
import { COMPREHENSIVE_NOTE } from "../../utils/constants";
import { SellerTotals, SettlementSeller } from "../../utils/types";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import DetailTable from "../DetailTable";
import ComprehensiveSummary from "../ComprehensiveSummary";
import { Amount, AmountFine, OpId, Muted, ProdCode, Money, FineCell } from "../SettlementCells";

const GRID = "34px 1fr 120px 120px 120px 120px 40px";

export default function ComprehensiveTab({ sellers }: { sellers: SettlementSeller[] }) {
  const renderCells = (_s: SettlementSeller, t: SellerTotals): React.ReactNode[] => [
    <Amount key="orders">{t.orders} طلبات</Amount>,
    <Amount key="seller" tone="green">{money(t.dueSeller)}</Amount>,
    <Amount key="comp" tone="accent">{money(t.dueComp)}</Amount>,
    <AmountFine key="fine" value={t.fine} />,
  ];

  const renderDetail = (s: SettlementSeller, t: SellerTotals) => (
    <>
      <DetailHeaderBar title={`الفاتورة الشاملة — ${s.name}`} onExport={() => {}} />
      <Box sx={{ overflowX: "auto" }}>
        <DetailTable
          columns={[
            { label: "رقم العملية" }, { label: "رقم الطلب" }, { label: "كود المنتج" },
            { label: "المستحق للبائع", tone: "green" }, { label: "المستحق للشركة", tone: "accent" },
            { label: "الغرامات" },
          ]}
          rows={s.orders.map((o) => [
            <OpId key="op">{o.op}</OpId>,
            <Muted key="order">#{o.order}</Muted>,
            <ProdCode key="code">{o.code}</ProdCode>,
            <Money key="seller" value={o.dueSeller} tone="green" bold />,
            <Money key="comp" value={o.dueComp} tone="accent" bold />,
            <FineCell key="fine" value={o.fine} />,
          ])}
        />
      </Box>
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
