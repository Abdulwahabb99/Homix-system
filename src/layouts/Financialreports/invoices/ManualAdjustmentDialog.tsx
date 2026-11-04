/**
 * «فاتورة يدوية / تعديل» — خصم أو إضافة على فاتورة معلّقة لصانع (يغيّر صافي مستحقه ويُسجَّل في سجل النشاط).
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useAddAdjustment, useInvoicesList } from "query/financialInvoices";
import { FONT } from "../utils/styles";
import { ModalShell, btnGhostSx, btnPrimarySx, fmtDate, inputSx } from "./shared";

export default function ManualAdjustmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useInvoicesList({ status: ["draft"], size: 200 }, open);
  const add = useAddAdjustment();
  const [invoiceId, setInvoiceId] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<"addition" | "deduction">("deduction");
  const [amount, setAmount] = useState("");
  const drafts = data?.items ?? [];

  const submit = () => {
    const value = Number(amount);
    if (!invoiceId || !label.trim() || !(value > 0)) { NotificationMeassage("error", "استكمل كل الحقول الأول"); return; }
    add.mutate({ id: Number(invoiceId), label: label.trim(), kind, amount: value }, {
      onSuccess: () => { NotificationMeassage("success", "اتضاف التعديل اليدوي"); setLabel(""); setAmount(""); onClose(); },
    });
  };

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="xs" title="فاتورة يدوية / تعديل"
      actions={<>
        <Box component="button" type="button" disabled={add.isPending || drafts.length === 0} onClick={submit} sx={btnPrimarySx}>حفظ</Box>
        <Box component="button" type="button" onClick={onClose} sx={btnGhostSx}>إلغاء</Box>
      </>}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: FONT }}>
        {drafts.length === 0 ? (
          <Box sx={{ fontSize: "12.5px", color: HX.tx2 }}>مفيش فواتير معلّقة تقدر تضيفلها تعديل. أصدر فواتير دورة مغلقة من «الفواتير الجارية» أولاً، أو أرجع فاتورة لمعلّقة.</Box>
        ) : (<>
          <Box component="select" value={invoiceId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInvoiceId(e.target.value)} sx={inputSx}>
            <option value="">اختر فاتورة الصانع</option>
            {drafts.map((d) => <option key={d.id} value={d.id}>{d.vendorName} — دورة {d.billingDay} ({fmtDate(d.periodEnd)})</option>)}
          </Box>
          <Box component="input" placeholder="الوصف (مثال: خصم تالف)" value={label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)} sx={inputSx} />
          <Box component="select" value={kind} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setKind(e.target.value as "addition" | "deduction")} sx={inputSx}>
            <option value="deduction">خصم (يقلّل مستحق الصانع)</option>
            <option value="addition">إضافة (يزوّد مستحق الصانع)</option>
          </Box>
          <Box component="input" type="number" min={0} placeholder="المبلغ (ج.م)" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} sx={inputSx} />
        </>)}
      </Box>
    </ModalShell>
  );
}
