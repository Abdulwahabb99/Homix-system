/**
 * تبويب «الفاتورة الشاملة» — المستحق للبائع والشركة معاً + ملخّص متدرّج لكل مورّد.
 * التفاصيل تعرض تفكيك مجاميع المورّد (endpoint التقرير لا يوفّر تفصيل الطلبات).
 */
import React from "react";
import { money } from "../../utils/calc";
import { COMPREHENSIVE_NOTE } from "../../utils/constants";
import { SellerTotals, SettlementSeller } from "../../utils/types";
import SettlementSection from "../SettlementSection";
import DetailHeaderBar from "../DetailHeaderBar";
import ComprehensiveSummary from "../ComprehensiveSummary";
import { Amount, AmountFine } from "../SettlementCells";

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
