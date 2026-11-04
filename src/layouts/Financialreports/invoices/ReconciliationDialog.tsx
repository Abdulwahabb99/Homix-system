/**
 * تسوية الحساب البنكي — يقارن إجمالي الفواتير «تم التحويل» (من الـ BE) برصيد كشف البنك المُدخَل،
 * ويسجّل الفرق في سجل النشاط. لا يغيّر أي فاتورة.
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useReconciliationSummary, useRecordReconciliation } from "query/financialInvoices";
import { money } from "../utils/calc";
import { FONT } from "../utils/styles";
import { ModalShell, btnGhostSx, btnPrimarySx, inputSx } from "./shared";

export default function ReconciliationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bank, setBank] = useState("");
  const [difference, setDifference] = useState<number | null>(null);
  const summary = useReconciliationSummary({ from: from || undefined, to: to || undefined }, open);
  const record = useRecordReconciliation();

  const submit = () => {
    const bankTotal = Number(bank);
    if (bank.trim() === "" || !Number.isFinite(bankTotal) || bankTotal < 0) return;
    record.mutate({ bankTotal, from: from || undefined, to: to || undefined }, { onSuccess: (r) => setDifference(r.difference) });
  };

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="xs" title="تسوية الحساب البنكي"
      actions={<>
        <Box component="button" type="button" disabled={record.isPending} onClick={submit} sx={btnPrimarySx}>احسب الفرق</Box>
        <Box component="button" type="button" onClick={onClose} sx={btnGhostSx}>إغلاق</Box>
      </>}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT, fontSize: "12.5px" }}>
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span>تاريخ التحويل من</span>
          <Box component="input" type="date" value={from} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFrom(e.target.value); setDifference(null); }} sx={inputSx} />
          <span>إلى</span>
          <Box component="input" type="date" value={to} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTo(e.target.value); setDifference(null); }} sx={inputSx} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: "10px 12px", bgcolor: HX.surface2, borderRadius: "10px" }}>
          <span>إجمالي الفواتير المحوّلة ({summary.data?.count ?? 0})</span>
          <b>{money(summary.data?.systemTotal ?? 0)}</b>
        </Box>
        <Box component="input" type="number" min={0} placeholder="إجمالي كشف البنك (ج.م)" value={bank} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setBank(e.target.value); setDifference(null); }} sx={inputSx} />
        {difference !== null && (
          <Box sx={{ p: "10px 12px", borderRadius: "10px", bgcolor: difference === 0 ? HX.greenLight : HX.redLight, color: difference === 0 ? "#065f46" : HX.red, fontWeight: 700 }}>
            {difference === 0 ? "متطابق تمامًا — مفيش فرق بين النظام وكشف البنك."
              : difference > 0 ? `البنك فيه ${money(difference)} زيادة عن النظام — ممكن تحويل لسه ما اتسجلش.`
                : `النظام مسجّل ${money(-difference)} أكتر من البنك — راجع الفواتير المحوّلة.`}
          </Box>
        )}
      </Box>
    </ModalShell>
  );
}
