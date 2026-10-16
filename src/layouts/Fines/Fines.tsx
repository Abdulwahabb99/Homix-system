import React, { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Switch, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { usePermissions } from "shared/permissions";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";

type FineRule = { id: number; name: string; description: string; trigger: string; amountType: string; amount: number; frequency: string; basis: string; graceHours: number; maxAmount: number | null; effectiveFrom: string; active: boolean };
type FineRecord = { id: number; ruleId: number; ruleName: string; orderId: number; orderNumber: string; amount: number; appliedAt: string; waivedAt: string | null; waiveReason: string | null };
const option = {
  trigger: [["delivery_delay", "تأخر التسليم"], ["late_cancellation", "إلغاء متأخر"], ["customer_refusal", "رفض العميل"], ["manual", "يدوي"]],
  amountType: [["fixed", "مبلغ ثابت"], ["percent", "نسبة مئوية"]],
  frequency: [["once", "مرة واحدة"], ["daily", "يوميًا"]],
  basis: [["subtotal", "قيمة الأصناف"], ["total", "قيمة الطلب"], ["commission", "عمولة الشركة"], ["cost", "سعر التكلفة"]],
};
const emptyRule = (): Omit<FineRule, "id"> => ({ name: "", description: "", trigger: "delivery_delay", amountType: "percent", amount: 0, frequency: "once", basis: "subtotal", graceHours: 0, maxAmount: null, effectiveFrom: new Date().toISOString(), active: true });
const key = ["fines"];
const font = "'Cairo', sans-serif";
const label = (group: keyof typeof option, value: string) => option[group].find(([id]) => id === value)?.[1] ?? value;
const date = (value: string) => new Date(value).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

export default function Fines() {
  const [tab, setTab] = useState<"rules" | "records">("rules");
  const [editing, setEditing] = useState<FineRule | Omit<FineRule, "id"> | null>(null);
  const [filters, setFilters] = useState({ orderId: "", ruleId: "", status: "", from: "", to: "" });
  const [waive, setWaive] = useState<FineRecord | null>(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [manualRule, setManualRule] = useState<FineRule | null>(null);
  const [manualOrderId, setManualOrderId] = useState("");
  const { can } = usePermissions();
  const client = useQueryClient();
  const rules = useQuery<FineRule[]>({ queryKey: [...key, "rules"], queryFn: async () => (await axiosRequest.get("/fines/rules")).data.data });
  const summary = useQuery<{ recordsCount: number; activeAmount: number; waivedCount: number }>({ queryKey: [...key, "summary"], queryFn: async () => (await axiosRequest.get("/fines/summary")).data.data });
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  const records = useQuery<FineRecord[]>({ queryKey: [...key, "records", params.toString()], queryFn: async () => (await axiosRequest.get(`/fines/records?${params}`)).data.data, enabled: tab === "records" });
  const save = useMutation({ mutationFn: async (rule: FineRule | Omit<FineRule, "id">) => "id" in rule ? axiosRequest.put(`/fines/rules/${rule.id}`, rule) : axiosRequest.post("/fines/rules", rule), onSuccess: async () => { await client.invalidateQueries({ queryKey: key }); setEditing(null); NotificationMeassage("success", "تم حفظ القاعدة"); }, onError: () => NotificationMeassage("error", "تعذر حفظ القاعدة") });
  const waiveMutation = useMutation({ mutationFn: async () => axiosRequest.post(`/fines/records/${waive?.id}/waive`, { reason: waiveReason.trim() }), onSuccess: async () => { await client.invalidateQueries({ queryKey: key }); setWaive(null); setWaiveReason(""); NotificationMeassage("success", "تم الإعفاء مع حفظ السبب"); }, onError: () => NotificationMeassage("error", "تعذر الإعفاء") });
  const manualMutation = useMutation({ mutationFn: async () => axiosRequest.post("/fines/records/manual", { ruleId: manualRule?.id, orderId: Number(manualOrderId) }), onSuccess: async () => { await client.invalidateQueries({ queryKey: key }); setManualRule(null); setManualOrderId(""); NotificationMeassage("success", "تم تطبيق الغرامة"); }, onError: (error: any) => NotificationMeassage("error", error?.response?.data?.message || "تعذر تطبيق الغرامة") });
  const exportCsv = async () => { try { const response = await axiosRequest.get(`/fines/records/export?${params}`, { responseType: "blob" }); downloadBlobResponse(response, "fine-records.csv"); } catch { NotificationMeassage("error", "تعذر تصدير السجل"); } };
  const activeCount = (rules.data ?? []).filter((rule) => rule.active).length;
  const total = Number(summary.data?.activeAmount ?? 0);
  return <DashboardLayout pageTitle="الغرامات وقواعد الحساب" pageSubtitle="قواعد قابلة للتعديل وسجل بكل غرامة وإعفاء" pageActions={<Box sx={{ display: "flex", gap: 1 }}>
    {can("finance_export") && <Button variant="outlined" onClick={exportCsv} startIcon={<FileDownloadOutlinedIcon />}>تصدير سجل الغرامات</Button>}
    {can("finance_settle") && <Button variant="contained" onClick={() => setEditing(emptyRule())} startIcon={<AddIcon />}>قاعدة جديدة</Button>}
  </Box>}>
    <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, fontFamily: font }}>
      {[["إجمالي الغرامات النشطة", `${total.toLocaleString("ar-EG")} ج.م`], ["القواعد النشطة", activeCount], ["سجلات الغرامات", summary.data?.recordsCount ?? "—"]].map(([title, value]) => <Box key={String(title)} sx={{ ...cardSx, p: 2 }}><Box sx={{ color: HX.tx2, fontSize: 12 }}>{title}</Box><Box sx={{ color: HX.tx, fontSize: 22, fontWeight: 800 }}>{value}</Box></Box>)}
    </Box>
    <Box sx={{ ...cardSx, mt: 2, fontFamily: font, overflow: "hidden" }}>
      <Box role="tablist" sx={{ display: "flex", borderBottom: `1px solid ${HX.border}` }}>
        {[["rules", "قواعد الغرامات"], ["records", "سجل الغرامات"]].map(([id, title]) => <Button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id as typeof tab)} sx={{ minHeight: 48, flex: 1, borderRadius: 0, borderBottom: tab === id ? `2px solid ${HX.accent}` : "none", fontFamily: font }}>{title}</Button>)}
      </Box>
      {tab === "rules" ? <Box sx={{ p: 2, display: "grid", gap: 1.5 }}>
        {rules.isLoading ? "جارٍ التحميل…" : rules.isError ? "تعذر تحميل القواعد" : !rules.data?.length ? "لا توجد قواعد حتى الآن." : rules.data.map((rule) => <Box key={rule.id} sx={{ border: `1px solid ${HX.border}`, borderRadius: 2, p: 2, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Box><Box sx={{ fontWeight: 800, color: HX.tx }}>{rule.name}</Box><Box sx={{ color: HX.tx2, fontSize: 12 }}>{rule.description}</Box><Box sx={{ color: HX.tx2, fontSize: 12 }}>{label("trigger", rule.trigger)} · {rule.amount}{rule.amountType === "percent" ? "%" : " ج.م"} · {label("frequency", rule.frequency)} · {label("basis", rule.basis)} · سماح {rule.graceHours} ساعة{rule.maxAmount != null ? ` · حد أقصى ${rule.maxAmount} ج.م` : ""}</Box></Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{can("finance_settle") && <Switch aria-label={`تفعيل ${rule.name}`} checked={rule.active} onChange={(_, active) => save.mutate({ ...rule, active })} />}{can("finance_settle") && rule.active && rule.trigger === "manual" && <Button onClick={() => setManualRule(rule)}>تطبيق</Button>}{can("finance_settle") && <Button onClick={() => setEditing(rule)}>تعديل</Button>}</Box>
        </Box>)}
      </Box> : <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>{[["orderId", "رقم العملية"], ["ruleId", "رقم القاعدة"], ["from", "من"], ["to", "إلى"]].map(([field, title]) => <TextField key={field} type={field === "from" || field === "to" ? "date" : "number"} label={title} size="small" value={filters[field as keyof typeof filters]} onChange={(event) => setFilters({ ...filters, [field]: event.target.value })} InputLabelProps={{ shrink: true }} />)}<TextField select size="small" label="الحالة" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} sx={{ minWidth: 120 }}><MenuItem value="">الكل</MenuItem><MenuItem value="active">نشطة</MenuItem><MenuItem value="waived">معفاة</MenuItem></TextField></Box>
        {records.isLoading ? "جارٍ التحميل…" : records.isError ? "تعذر تحميل السجل" : !records.data?.length ? "لا توجد غرامات مطابقة." : <Box sx={{ overflowX: "auto" }}><table dir="rtl" style={{ width: "100%", minWidth: 650, borderCollapse: "collapse", fontSize: 12 }}><thead><tr>{["القاعدة", "الطلب", "القيمة", "تاريخ التطبيق", "الحالة", "إجراء"].map((title) => <th key={title} style={{ textAlign: "right", padding: 10, borderBottom: `1px solid ${HX.border}` }}>{title}</th>)}</tr></thead><tbody>{records.data.map((record) => <tr key={record.id}>{[record.ruleName, `#${record.orderNumber || record.orderId}`, `${Number(record.amount).toLocaleString("ar-EG")} ج.م`, date(record.appliedAt), record.waivedAt ? `معفاة: ${record.waiveReason}` : "نشطة"].map((value, index) => <td key={index} style={{ padding: 10, borderBottom: `1px solid ${HX.border}` }}>{value}</td>)}<td>{!record.waivedAt && can("finance_settle") && <Button onClick={() => setWaive(record)}>إعفاء</Button>}</td></tr>)}</tbody></table></Box>}
      </Box>}
    </Box>
    <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} dir="rtl" fullWidth maxWidth="sm"><DialogTitle>قاعدة الغرامة</DialogTitle><DialogContent dividers sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, pt: "16px !important" }}>
      {editing && <><TextField label="اسم القاعدة" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} sx={{ gridColumn: "span 2" }} required /><TextField label="وصف السبب" value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} multiline minRows={2} sx={{ gridColumn: "span 2" }} />
        {(["trigger", "amountType", "frequency", "basis"] as const).map((field) => <TextField key={field} select label={{ trigger: "سبب الغرامة", amountType: "نوع المبلغ", frequency: "تكرار الحساب", basis: "أساس الحساب" }[field]} value={editing[field]} onChange={(event) => setEditing({ ...editing, [field]: event.target.value })}>{option[field].map(([value, title]) => <MenuItem key={value} value={value}>{title}</MenuItem>)}</TextField>)}
        <TextField label={editing.amountType === "percent" ? "النسبة %" : "المبلغ ج.م"} type="number" value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })} /><TextField label="فترة السماح بالساعات" type="number" value={editing.graceHours} onChange={(event) => setEditing({ ...editing, graceHours: Number(event.target.value) })} /><TextField label="الحد الأقصى (اختياري)" type="number" value={editing.maxAmount ?? ""} onChange={(event) => setEditing({ ...editing, maxAmount: event.target.value === "" ? null : Number(event.target.value) })} /><TextField label="تاريخ السريان" type="datetime-local" value={editing.effectiveFrom.slice(0, 16)} onChange={(event) => setEditing({ ...editing, effectiveFrom: new Date(event.target.value).toISOString() })} InputLabelProps={{ shrink: true }} /><FormControlLabel control={<Switch checked={editing.active} onChange={(_, active) => setEditing({ ...editing, active })} />} label="القاعدة نشطة" /></>}
    </DialogContent><DialogActions><Button onClick={() => setEditing(null)}>إلغاء</Button><Button variant="contained" disabled={!editing?.name.trim() || save.isPending} onClick={() => editing && save.mutate(editing)}>حفظ القاعدة</Button></DialogActions></Dialog>
    <Dialog open={Boolean(waive)} onClose={() => setWaive(null)} dir="rtl" fullWidth maxWidth="xs"><DialogTitle>إعفاء من الغرامة</DialogTitle><DialogContent><TextField autoFocus fullWidth multiline minRows={3} label="سبب الإعفاء" value={waiveReason} onChange={(event) => setWaiveReason(event.target.value)} sx={{ mt: 1 }} required /></DialogContent><DialogActions><Button onClick={() => setWaive(null)}>إلغاء</Button><Button variant="contained" disabled={waiveReason.trim().length < 3 || waiveMutation.isPending} onClick={() => waiveMutation.mutate()}>تأكيد الإعفاء</Button></DialogActions></Dialog>
    <Dialog open={Boolean(manualRule)} onClose={() => setManualRule(null)} dir="rtl" fullWidth maxWidth="xs"><DialogTitle>تطبيق {manualRule?.name}</DialogTitle><DialogContent><TextField autoFocus fullWidth type="number" label="رقم العملية" value={manualOrderId} onChange={(event) => setManualOrderId(event.target.value)} sx={{ mt: 1 }} required /></DialogContent><DialogActions><Button onClick={() => setManualRule(null)}>إلغاء</Button><Button variant="contained" disabled={!Number(manualOrderId) || manualMutation.isPending} onClick={() => manualMutation.mutate()}>تطبيق الغرامة</Button></DialogActions></Dialog>
  </DashboardLayout>;
}
