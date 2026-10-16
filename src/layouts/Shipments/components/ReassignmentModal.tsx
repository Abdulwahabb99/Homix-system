import React, { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ShipmentItem } from "query/shipmentsList";
import { reassignmentKey } from "./panels/ReassignmentsPanel";

const REASONS = [
  "ملغي - لا يوجد رد", "ملغي - تغيير رأي", "ملغي - بسبب التأخير",
  "رفض الاستلام لعدم المطابقة", "رفض الاستلام - المنتج غير مناسب للعميل",
  "إعادة تخصيص - العميل لسه محتاج الطلب", "سبب آخر",
];

export default function ReassignmentModal({ source, onClose, onSuccess }: { source: ShipmentItem | null; onClose: () => void; onSuccess: () => void }) {
  const [targetOperationNumber, setTargetOperationNumber] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: async () => axiosRequest.post("/shipments/reassignments", {
      sourceOrderId: source?.id,
      targetOperationNumber: targetOperationNumber.trim(),
      reason: reason === "سبب آخر" ? customReason.trim() : reason,
      notes: notes.trim(),
    }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: reassignmentKey });
      await client.invalidateQueries({ queryKey: ["shipments"] });
      NotificationMeassage("success", "تمت إعادة تخصيص الصنف");
      onSuccess();
      onClose();
    },
    onError: (error: any) => NotificationMeassage("error", error?.response?.data?.message || "تعذرت إعادة التخصيص"),
  });
  return <Dialog open={Boolean(source)} onClose={save.isPending ? undefined : onClose} dir="rtl" fullWidth maxWidth="sm">
    <DialogTitle sx={{ fontFamily: "Cairo", fontWeight: 800 }}>إعادة تخصيص الصنف</DialogTitle>
    <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "18px !important" }}>
      <Box sx={{ fontSize: 13 }}>الطلب الأصلي: <strong>#{source?.orderNumber || source?.id}</strong> — {source?.productSku || "—"}</Box>
      <TextField label="رقم العملية الجديدة" value={targetOperationNumber} onChange={(event) => setTargetOperationNumber(event.target.value)} required fullWidth size="small" helperText="أدخل رقم العملية الظاهر في جدول الشحنات. يجب أن يطابق المنتج وSKU والكمية." />
      <TextField select label="سبب إعادة التخصيص" value={reason} onChange={(event) => setReason(event.target.value)} fullWidth size="small">{REASONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
      {reason === "سبب آخر" && <TextField label="السبب" value={customReason} onChange={(event) => setCustomReason(event.target.value)} required fullWidth size="small" />}
      <TextField label="ملاحظات إضافية" value={notes} onChange={(event) => setNotes(event.target.value)} multiline minRows={3} fullWidth size="small" />
      {reason === "إعادة تخصيص - العميل لسه محتاج الطلب" && <Box sx={{ bgcolor: "#fff7e6", color: "#92400e", p: 1.5, borderRadius: 2, fontSize: 12 }}>الحالة المختارة ستُبقي الطلب الأصلي «معلقًا» تلقائيًا.</Box>}
      <Box sx={{ bgcolor: "#e6f7ef", color: "#087446", p: 1.5, borderRadius: 2, fontSize: 12 }}>الطلب الجديد يصبح «في المخزن». لا تُنقل كمية المخزون ولا تتغير المبالغ والمدفوعات.</Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}><Button onClick={onClose} disabled={save.isPending}>إلغاء</Button><Button variant="contained" disabled={save.isPending || !targetOperationNumber.trim() || (reason === "سبب آخر" && customReason.trim().length < 2)} onClick={() => save.mutate()}>تأكيد إعادة التخصيص</Button></DialogActions>
  </Dialog>;
}
