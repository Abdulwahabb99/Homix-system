/**
 * صف صانع قابل للطي: الصف الرئيسي (avatar + اسم + خلايا مبالغ + زر التوسيع)
 * يليه لوحة التفاصيل داخل Collapse. حالة الفتح يديرها المكوّن الأب (أكورديون).
 */
import React from "react";
import { Box, Collapse } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { sellerRowSx, sellerAvSx, expandIconSx, detailWrapSx, FONT } from "../utils/styles";
import { SettlementSeller } from "../utils/types";

interface SellerSettlementRowProps {
  seller: SettlementSeller;
  gridTemplate: string;
  /** خلايا المبالغ بين اسم الصانع وزر التوسيع (عنصر لكل عمود) */
  cells: React.ReactNode[];
  expanded: boolean;
  onToggle: () => void;
  detail: React.ReactNode;
  isLast?: boolean;
}

export default function SellerSettlementRow({
  seller, gridTemplate, cells, expanded, onToggle, detail, isLast,
}: SellerSettlementRowProps) {
  return (
    <Box sx={{ borderBottom: isLast ? "none" : `0.5px solid ${HX.border}` }}>
      <Box sx={sellerRowSx(gridTemplate, expanded)} onClick={onToggle}>
        <Box sx={{ ...(sellerAvSx as object), background: seller.color }}>{seller.initials}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>{seller.name}</Box>
          <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>{seller.cat}</Box>
        </Box>
        {cells.map((c, i) => (
          <React.Fragment key={i}>{c}</React.Fragment>
        ))}
        <Box sx={expandIconSx(expanded)}>
          <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
        </Box>
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Box sx={detailWrapSx}>{detail}</Box>
      </Collapse>
    </Box>
  );
}
