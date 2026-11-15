/**
 * خلايا «هامش هوميكس» و«مستحق على الصانع» لطلب واحد: القيمة تقع في العمود الذي يطابق نوعها،
 * والعمود الآخر شرطة. الخلية القابلة للتعديل تبقى (companyDueOverride) أياً كان النوع.
 */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { companyDueKindOf } from "../utils/companyDue";
import type { SettlementOrder, SettlementSeller } from "../utils/types";
import LiveAmountCell from "./LiveAmountCell";

const Dash = () => <Box component="span" sx={{ color: HX.tx3 }}>—</Box>;

export function companyDueCells(seller: SettlementSeller, order: SettlementOrder): [React.ReactNode, React.ReactNode] {
  const cell = <LiveAmountCell seller={seller} order={order} field="companyDueOverride" tone="accent" bold />;
  return companyDueKindOf(order) === "margin" ? [cell, <Dash key="dash" />] : [<Dash key="dash" />, cell];
}
