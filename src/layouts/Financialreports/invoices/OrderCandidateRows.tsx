/** نتائج منتقي «إضافة طلب»: صف لكل طلب؛ المتاح قابل للإضافة وغير المتاح باهت مع سبب في سطر واحد. */
import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { OrderCandidate } from "query/financialInvoices";
import { btnPrimarySx } from "./shared";
import { NO_VENDOR_ORDER_MATCH, candidateReasonLabel, candidateStatusLabel } from "./orderCandidates";

type Props = {
  candidates: OrderCandidate[] | undefined;
  pending: boolean;
  /** نص البحث الحالي (يظهر «مفيش طلب…» فقط عند ٢ حرف فأكثر) */
  query: string;
  onPick: (orderId: number) => void;
};

export default function OrderCandidateRows({ candidates, pending, query, onPick }: Props) {
  return (
    <>
      {(candidates ?? []).map((c) => {
        const reason = candidateReasonLabel(c);
        return (
          <Box key={c.id} data-testid="order-candidate" data-available={c.available ? "true" : "false"}
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, fontSize: "12.5px", opacity: c.available ? 1 : 0.6, color: c.available ? undefined : HX.tx3 }}>
            <Box sx={{ minWidth: 0 }}>
              <div>{c.code || `OP-${c.id}`} — #{c.orderNumber} <span style={{ fontSize: "11.5px" }}>({candidateStatusLabel(c.status)})</span></div>
              {reason && <Box sx={{ fontSize: "11.5px", color: HX.tx3 }}>{reason}</Box>}
            </Box>
            {c.available && <Box component="button" type="button" disabled={pending} onClick={() => onPick(c.id)} sx={btnPrimarySx}>إضافة</Box>}
          </Box>
        );
      })}
      {query.trim().length >= 2 && candidates?.length === 0 && <Box sx={{ fontSize: "12px", color: HX.tx3 }}>{NO_VENDOR_ORDER_MATCH}</Box>}
    </>
  );
}
