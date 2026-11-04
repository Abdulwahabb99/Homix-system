import React, { useEffect, useState } from "react";
import { Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ShipmentItem } from "query/shipmentsList";
import { ReassignmentCandidate, useReassignmentCandidates } from "query/reassignmentCandidates";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { reassignmentKey } from "./panels/ReassignmentsPanel";

const REASONS = [
  "ملغي - لا يوجد رد", "ملغي - تغيير رأي", "ملغي - بسبب التأخير",
  "رفض الاستلام لعدم المطابقة", "رفض الاستلام - المنتج غير مناسب للعميل",
  "إعادة تخصيص - العميل لسه محتاج الطلب", "سبب آخر",
];

export default function ReassignmentModal({ source, onClose, onSuccess }: { source: ShipmentItem | null; onClose: () => void; onSuccess: () => void }) {
  const [targetOperationNumber, setTargetOperationNumber] = useState("");
  const [picked, setPicked] = useState<ReassignmentCandidate | null>(null);
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(targetOperationNumber), 300);
    return () => clearTimeout(timer);
  }, [targetOperationNumber]);
  useEffect(() => {
    if (!source) { setTargetOperationNumber(""); setPicked(null); setDebounced(""); }
  }, [source]);
  const candidates = useReassignmentCandidates(source?.id, debounced);
  const searching = targetOperationNumber.trim() !== debounced.trim() || candidates.isFetching;
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: async () => axiosRequest.post("/shipments/reassignments", {
      sourceOrderId: source?.id,
      ...(picked && picked.operationNumber === targetOperationNumber.trim()
        ? { targetOrderId: picked.id }
        : { targetOperationNumber: targetOperationNumber.trim() }),
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
      <Box sx={{ fontSize: 13, lineHeight: 1.9 }}>
        الطلب الأصلي: <strong>#{source?.orderNumber || source?.id}</strong> — {source?.productSku || "—"}
        <br />
        البائع: <strong>{source?.sellerName || "—"}</strong> · العميل: {source?.customerName || "—"} · القيمة: <strong>{Number(source?.amountToCollect ?? 0).toLocaleString("ar-EG")} ج.م</strong>
      </Box>
      <Autocomplete<ReassignmentCandidate, false, false, true>
        freeSolo
        fullWidth
        size="small"
        options={candidates.data ?? []}
        filterOptions={(options) => options}
        loading={searching}
        loadingText="جارٍ البحث..."
        noOptionsText={targetOperationNumber.trim() ? "لا توجد نتائج" : "اكتب رقم العملية للبحث"}
        inputValue={targetOperationNumber}
        onInputChange={(_event, value, reason) => {
          setTargetOperationNumber(value);
          if (reason === "input") setPicked(null);
        }}
        onChange={(_event, value) => setPicked(typeof value === "string" ? null : value)}
        getOptionLabel={(option) => (typeof option === "string" ? option : option.operationNumber || String(option.id))}
        getOptionDisabled={(option) => typeof option !== "string" && !option.eligible}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        componentsProps={{ paper: { sx: { direction: "rtl", fontFamily: "Cairo" } } }}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id} sx={{ display: "block !important", fontFamily: "Cairo", opacity: option.eligible ? 1 : 0.6 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", fontWeight: 700, fontSize: 13, color: HX.tx }}>
              <span>عملية {option.operationNumber || "—"}</span>
              <span style={{ color: HX.tx2, fontWeight: 500 }}>طلب #{option.orderNumber || option.id}</span>
              <span style={{ marginInlineStart: "auto", color: HX.accent, fontSize: 11 }}>{option.shipmentStatusLabel}</span>
            </Box>
            <Box sx={{ fontSize: 12, color: HX.tx2 }}>
              {option.customerName || "—"} · {option.sku || "—"} · الكمية {option.quantity ?? "—"}
            </Box>
            {!option.eligible && <Box sx={{ fontSize: 11, color: HX.red }}>{option.reasonLabel}</Box>}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="رقم العملية الجديدة"
            required
            helperText="ابحث برقم العملية أو رقم الطلب واختر من القائمة، أو أدخل الرقم كاملًا. يجب أن يطابق المنتج وSKU والكمية."
            InputProps={{
              ...params.InputProps,
              endAdornment: <>{searching && targetOperationNumber.trim() ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>,
            }}
          />
        )}
      />
      <TextField select label="سبب إعادة التخصيص" value={reason} onChange={(event) => setReason(event.target.value)} fullWidth size="small">{REASONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
      {reason === "سبب آخر" && <TextField label="السبب" value={customReason} onChange={(event) => setCustomReason(event.target.value)} required fullWidth size="small" />}
      <TextField label="ملاحظات إضافية" value={notes} onChange={(event) => setNotes(event.target.value)} multiline minRows={3} fullWidth size="small" />
      {reason === "إعادة تخصيص - العميل لسه محتاج الطلب" && <Box sx={{ bgcolor: "#fff7e6", color: "#92400e", p: 1.5, borderRadius: 2, fontSize: 12 }}>الحالة المختارة ستُبقي الطلب الأصلي «معلقًا» تلقائيًا.</Box>}
      <Box sx={{ bgcolor: "#e6f7ef", color: "#087446", p: 1.5, borderRadius: 2, fontSize: 12 }}>الطلب الجديد يصبح «في المخزن». لا تُنقل كمية المخزون ولا تتغير المبالغ والمدفوعات.</Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}><Button onClick={onClose} disabled={save.isPending}>إلغاء</Button><Button variant="contained" disabled={save.isPending || !targetOperationNumber.trim() || (reason === "سبب آخر" && customReason.trim().length < 2)} onClick={() => save.mutate()}>تأكيد إعادة التخصيص</Button></DialogActions>
  </Dialog>;
}
