/**
 * قائمة تسويات الصناع لتبويب واحد: ترويسة الأعمدة + صفوف قابلة للطي (أكورديون:
 * صف واحد مفتوح كحدّ أقصى داخل التبويب). مدفوعة بإعداد الأعمدة ودوال العرض.
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { sellersHeaderSx, headerCellSx } from "../utils/styles";
import { sellerTotals } from "../utils/calc";
import { SellerTotals, SettlementSeller } from "../utils/types";
import SellerSettlementRow from "./SellerSettlementRow";

export interface HeaderCell {
  label: string;
  align?: "start" | "end";
}

interface SettlementSectionProps {
  sellers: SettlementSeller[];
  gridTemplate: string;
  header: HeaderCell[];
  renderCells: (seller: SettlementSeller, totals: SellerTotals) => React.ReactNode[];
  renderDetail: (seller: SettlementSeller, totals: SellerTotals) => React.ReactNode;
}

export default function SettlementSection({
  sellers, gridTemplate, header, renderCells, renderDetail,
}: SettlementSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Box>
      <Box sx={sellersHeaderSx(gridTemplate)}>
        {header.map((h, i) => (
          <Box key={i} component="span" sx={{ ...headerCellSx, textAlign: h.align ?? "start" }}>
            {h.label}
          </Box>
        ))}
      </Box>

      {sellers.map((s, i) => {
        const totals = sellerTotals(s);
        return (
          <SellerSettlementRow
            key={s.id}
            seller={s}
            gridTemplate={gridTemplate}
            cells={renderCells(s, totals)}
            expanded={openId === s.id}
            onToggle={() => setOpenId((prev) => (prev === s.id ? null : s.id))}
            detail={renderDetail(s, totals)}
            isLast={i === sellers.length - 1}
          />
        );
      })}
    </Box>
  );
}
