import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { usePermissions } from "shared/permissions";
import { getStatusValue } from "shared/utils/constants";
import { fineKeys } from "query/keys";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import {
  MANUAL_METHODS, apiErrorMessage, applyMethod, applyTrigger, buildPayload, emptyForm, methodOf, rulePayload, toForm, validateRuleForm,
  type FineRule, type Method, type RuleForm, type RulePayload,
} from "./fineRuleForm";

type FineRecord = { id: number; ruleId: number; ruleName: string; orderId: number; orderNumber: string; operationNumber?: string | null; vendorName?: string | null; orderStatus?: number | null; amount: number; appliedAt: string; waivedAt: string | null; waiveReason: string | null };

/** طريقة الحساب كما في التصميم؛ تُحوَّل إلى amountType/frequency/basis التي يقبلها الـ API */
const METHODS: { value: Method; label: string; badge: string; icon: string; bg: string; badgeBg: string; badgeColor: string }[] = [
  { value: "fixed", label: "مبلغ ثابت", badge: "مبلغ ثابت", icon: "💰", bg: HX.accentLight, badgeBg: HX.accentLight, badgeColor: HX.accent },
  { value: "percentage", label: "نسبة من قيمة الطلب", badge: "نسبة من الطلب", icon: "📊", bg: "rgba(201,169,110,0.1)", badgeBg: "rgba(201,169,110,0.1)", badgeColor: "#8a6d3b" },
  { value: "percentage_daily", label: "نسبة من قيمة الطلب عن كل يوم تأخير", badge: "نسبة يومية", icon: "📈", bg: HX.redLight, badgeBg: HX.redLight, badgeColor: HX.red },
  { value: "tiered_daily", label: "مبلغ ثابت لكل يوم تأخير (بحد أقصى)", badge: "مبلغ يومي", icon: "⏱", bg: HX.redLight, badgeBg: HX.redLight, badgeColor: HX.red },
  { value: "commission_percent", label: "نسبة من عمولة الشركة (هامش الربح)", badge: "نسبة من العمولة", icon: "🎯", bg: HX.accentLight, badgeBg: HX.accentLight, badgeColor: HX.accent },
];
const option = {
  trigger: [["delivery_delay", "تأخر التسليم"], ["late_cancellation", "إلغاء متأخر"], ["customer_refusal", "رفض العميل"], ["manual", "يدوي"]],
  basis: [["subtotal", "قيمة الأصناف"], ["total", "قيمة الطلب"], ["cost", "سعر التكلفة"], ["commission", "عمولة الشركة"]],
};
const TRIGGER_HINTS: Record<string, string> = {
  delivery_delay: "تُحسب الغرامة من موعد التسليم المتوقع (بعد فترة السماح) حتى التسليم الفعلي، أو حتى اليوم إذا لم يُسلَّم الطلب بعد",
  late_cancellation: "تُطبَّق عند إلغاء الطلب بعد موعد التسليم المتوقع (وبعد فترة السماح)؛ الإلغاء قبل الموعد لا تترتب عليه غرامة",
  customer_refusal: "تُطبَّق عند رفض العميل للشحنة بعد موعد التسليم المتوقع (وبعد فترة السماح)",
  manual: "تُطبَّق يدويًا على طلب محدد من زر «تطبيق»، مرة واحدة فقط لكل طلب، ولا تُراعى فيها فترة السماح",
};
const basisLabel = (basis: string) => (option.basis.find(([id]) => id === basis)?.[1] ?? basis);
const font = "'Cairo', sans-serif";
const num = (value: number | string) => (Number(value) || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 });
const dayOf = (value: string) => value.slice(0, 10);
const dateText = (value: string) => new Date(value).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

const fieldSx = {
  "& .MuiInputLabel-root": { fontFamily: font, fontSize: 12, bgcolor: HX.surface, px: "4px" },
  "& .MuiOutlinedInput-root": { bgcolor: HX.surface2, borderRadius: "9px", fontFamily: font, fontSize: 13 },
  "& .MuiOutlinedInput-input": { fontFamily: font },
} as const;
const filterFieldSx = {
  "& .MuiOutlinedInput-root": { bgcolor: HX.surface, borderRadius: "8px", fontFamily: font, fontSize: 12, height: 32 },
  "& .MuiOutlinedInput-input": { py: 0, px: "10px", height: 32, boxSizing: "border-box", fontFamily: font },
  "& .MuiSelect-select": { display: "flex", alignItems: "center" },
} as const;
const outlineBtnSx = { minHeight: 34, px: 1.75, borderColor: HX.border, color: `${HX.tx2} !important`, bgcolor: HX.surface2, borderRadius: "9px", fontFamily: font, fontSize: 12, fontWeight: 700, "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight, color: `${HX.accent} !important` } } as const;
const chipSx = (bg: string, color: string) => ({ display: "inline-block", fontSize: 10.5, fontWeight: 700, px: "9px", py: "2px", borderRadius: "20px", bgcolor: bg, color, whiteSpace: "nowrap" });
const LOG_COLUMNS = "110px 150px minmax(160px, 1fr) 120px 110px 110px 90px 90px";

function ruleValue(rule: FineRule, method: Method) {
  const cap = rule.maxAmount != null ? ` — سقف ${num(rule.maxAmount)} ج.م` : "";
  switch (method) {
    case "fixed": return [num(rule.amount), `ج.م${cap}`];
    case "percentage": return [`${Number(rule.amount)}%`, `من ${basisLabel(rule.basis)}${cap}`];
    case "percentage_daily": return [`${Number(rule.amount)}%`, `من ${basisLabel(rule.basis)} / يوم${cap || " — بدون حد أقصى"}`];
    case "commission_percent": return [`${Number(rule.amount)}%`, `من العمولة${cap}`];
    default: return [num(rule.amount), `ج.م / يوم${cap || " — بدون حد أقصى"}`];
  }
}

export default function Fines() {
  const [tab, setTab] = useState<"rules" | "records">("rules");
  const [editing, setEditing] = useState<RuleForm | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [filters, setFilters] = useState({ vendor: "", operationNumber: "", ruleId: "", status: "", from: "", to: "" });
  const [waive, setWaive] = useState<FineRecord | null>(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [deleting, setDeleting] = useState<FineRule | null>(null);
  const [manualRule, setManualRule] = useState<FineRule | null>(null);
  const [manualOrderId, setManualOrderId] = useState("");
  const { can } = usePermissions();
  const client = useQueryClient();
  const canSettle = can("finance_settle");
  const openEditor = (form: RuleForm | null) => { setShowErrors(false); setEditing(form); };

  const rules = useQuery<FineRule[]>({ queryKey: fineKeys.rules(), queryFn: async () => (await axiosRequest.get("/fines/rules")).data.data });
  const summary = useQuery<{ recordsCount: number; activeAmount: number; waivedCount: number }>({ queryKey: fineKeys.summary(), queryFn: async () => (await axiosRequest.get("/fines/summary")).data.data });
  const records = useQuery<FineRecord[]>({ queryKey: fineKeys.records(), queryFn: async () => (await axiosRequest.get("/fines/records")).data.data });

  const [searchTerms, setSearchTerms] = useState({ vendor: "", operationNumber: "" });
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerms({ vendor: filters.vendor.trim(), operationNumber: filters.operationNumber.trim() }), 400);
    return () => clearTimeout(timer);
  }, [filters.vendor, filters.operationNumber]);
  const searching = Boolean(searchTerms.vendor || searchTerms.operationNumber);
  const found = useQuery<FineRecord[]>({
    queryKey: fineKeys.recordsSearch(searchTerms.vendor, searchTerms.operationNumber), enabled: searching, placeholderData: keepPreviousData,
    queryFn: async () => (await axiosRequest.get("/fines/records", { params: { vendor: searchTerms.vendor || undefined, operationNumber: searchTerms.operationNumber || undefined } })).data.data,
  });

  const invalidate = () => client.invalidateQueries({ queryKey: fineKeys.all() });
  const failed = (fallback: string) => (error: unknown) => { NotificationMeassage("error", apiErrorMessage(error, fallback)); void invalidate(); };
  const save = useMutation({
    mutationFn: async ({ id, payload }: { id?: number; payload: RulePayload }) => (id ? axiosRequest.put(`/fines/rules/${id}`, payload) : axiosRequest.post("/fines/rules", payload)),
    onSuccess: async (_data, { id }) => { await invalidate(); openEditor(null); NotificationMeassage("success", id ? "تم تحديث القاعدة بنجاح" : "تمت إضافة القاعدة بنجاح"); },
    onError: failed("تعذر حفظ القاعدة، من فضلك راجع البيانات وحاول مرة أخرى"),
  });
  const waiveMutation = useMutation({ mutationFn: async () => axiosRequest.post(`/fines/records/${waive?.id}/waive`, { reason: waiveReason.trim() }), onSuccess: async () => { await invalidate(); setWaive(null); setWaiveReason(""); NotificationMeassage("success", "تم إلغاء الغرامة وحفظ السبب"); }, onError: (error) => { failed("تعذر إلغاء الغرامة")(error); if ((error as any)?.response?.status === 409 || (error as any)?.response?.status === 404) setWaive(null); } });
  const deleteMutation = useMutation({ mutationFn: async () => axiosRequest.delete(`/fines/rules/${deleting?.id}`), onSuccess: async () => { await invalidate(); setDeleting(null); NotificationMeassage("success", "تم حذف القاعدة"); }, onError: (error) => { failed("تعذر حذف القاعدة")(error); if ((error as any)?.response?.status === 404) setDeleting(null); } });
  const manualMutation = useMutation({ mutationFn: async () => axiosRequest.post("/fines/records/manual", { ruleId: manualRule?.id, operationNumber: manualOrderId.trim() }), onSuccess: async () => { await invalidate(); setManualRule(null); setManualOrderId(""); NotificationMeassage("success", "تم تطبيق الغرامة على الطلب"); }, onError: failed("تعذر تطبيق الغرامة") });
  const exportCsv = async () => {
    const params = new URLSearchParams(Object.entries({ ruleId: filters.ruleId, status: filters.status, from: filters.from, to: filters.to, vendor: filters.vendor.trim(), operationNumber: filters.operationNumber.trim() }).filter(([, value]) => value));
    try { const response = await axiosRequest.get(`/fines/records/export?${params}`, { responseType: "blob" }); downloadBlobResponse(response, "fine-records.csv"); } catch { NotificationMeassage("error", "تعذر تصدير السجل"); }
  };

  const ruleList = rules.data ?? [];
  const all = useMemo(() => records.data ?? [], [records.data]);
  const visible = useMemo(() => {
    return (searching ? found.data ?? [] : all).filter((record) => {
      if (filters.ruleId && String(record.ruleId) !== filters.ruleId) return false;
      if (filters.status && (filters.status === "waived") !== Boolean(record.waivedAt)) return false;
      const day = dayOf(record.appliedAt);
      if (filters.from && day < filters.from) return false;
      if (filters.to && day > filters.to) return false;
      return true;
    });
  }, [all, found.data, searching, filters.ruleId, filters.status, filters.from, filters.to]);

  const activeCount = ruleList.filter((rule) => rule.active).length;
  const month = new Date().toISOString().slice(0, 7);
  const monthApplied = all.filter((record) => !record.waivedAt && record.appliedAt.slice(0, 7) === month);
  const topRule = useMemo(() => {
    const counts = new Map<string, number>();
    monthApplied.forEach((record) => counts.set(record.ruleName, (counts.get(record.ruleName) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [monthApplied]);
  const topMaker = useMemo(() => {
    const totals = new Map<string, number>();
    monthApplied.forEach((record) => record.vendorName && totals.set(record.vendorName, (totals.get(record.vendorName) ?? 0) + Number(record.amount)));
    return [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [monthApplied]);
  const waivedAmount = all.filter((record) => record.waivedAt).reduce((sum, record) => sum + Number(record.amount), 0);
  const appliedCount = (summary.data?.recordsCount ?? 0) - (summary.data?.waivedCount ?? 0);
  const waivedCount = summary.data?.waivedCount ?? 0;
  const inactiveCount = ruleList.length - activeCount;

  const kpis = [
    { icon: <WarningAmberOutlinedIcon />, tone: HX.red, bg: HX.redLight, side: `${appliedCount} غرامة`, value: num(summary.data?.activeAmount ?? 0), valueColor: HX.red, valueSize: 22, label: "إجمالي الغرامات المطبقة (ج.م)", badge: waivedCount > 0 ? `${waivedCount} ملغاة (${num(waivedAmount)} ج.م)` : "مفيش غرامات ملغاة", badgeBg: HX.greenLight, badgeColor: HX.green },
    { icon: <TaskAltOutlinedIcon />, tone: HX.accent, bg: HX.accentLight, side: `${ruleList.length} قاعدة`, value: String(activeCount), valueColor: HX.tx, valueSize: 22, label: "قواعد نشطة حاليًا", badge: inactiveCount > 0 ? `${inactiveCount} معطّلة` : "كل القواعد شغالة", badgeBg: HX.accentLight, badgeColor: HX.accent },
    { icon: <BoltOutlinedIcon />, tone: "#8a6d3b", bg: "rgba(201,169,110,0.1)", side: "الأكتر تفعيلاً", value: topRule?.[0] ?? "—", valueColor: HX.tx, valueSize: 15, label: "القاعدة الأكتر تكرارًا هذا الشهر", badge: topRule ? `${topRule[1]} مرة` : "", badgeBg: "rgba(201,169,110,0.1)", badgeColor: "#8a6d3b" },
    { icon: <PersonOutlineIcon />, tone: HX.amber, bg: HX.amberLight, side: "الأكتر غرامات", value: topMaker?.[0] ?? "—", valueColor: HX.tx, valueSize: 15, label: "الصانع الأكتر غرامات هذا الشهر", badge: topMaker ? `${num(topMaker[1])} ج.م` : "", badgeBg: HX.amberLight, badgeColor: HX.amber },
  ];

  const tabs = [
    { id: "rules" as const, title: "قواعد الغرامات", count: ruleList.length, icon: <TaskAltOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: "records" as const, title: "سجل الغرامات", count: all.length, icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} /> },
  ];
  const setFilter = (field: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, [field]: event.target.value });
  const method: Method = editing?.method ?? "fixed";
  const isPercent = method === "percentage" || method === "percentage_daily" || method === "commission_percent";
  const isManual = editing?.trigger === "manual";
  const errors = editing ? validateRuleForm(editing) : {};
  const err = (field: keyof typeof errors) => (showErrors ? errors[field] : undefined);
  const showBasis = method === "percentage" || method === "percentage_daily";
  const methodHint = method === "percentage_daily" ? "مثال: 1% في اليوم يعني لو اتأخر 5 أيام الغرامة هتبقى 5% من الأساس المختار (وأي جزء من اليوم بيتحسب يوم كامل)، لحد الحد الأقصى لو حددته" : method === "tiered_daily" ? "الغرامة = مبلغ اليوم × عدد أيام التأخير (وأي جزء من اليوم بيتحسب يوم كامل)، لحد الحد الأقصى لو حددته" : method === "percentage" ? "الأساس المختار تحت هو اللي هتتحسب منه النسبة (الافتراضي: سعر التكلفة الخاص بكل طلب)" : method === "commission_percent" ? "100% يعني الغرامة = كامل عمولة الشركة (هامش الربح) على الطلب ده" : "";
  const submitRule = () => {
    if (!editing) return;
    setShowErrors(true);
    if (Object.keys(validateRuleForm(editing)).length) return;
    save.mutate({ id: editing.id, payload: buildPayload(editing) });
  };
  const manualOrderError = manualOrderId.length > 50 ? "رقم العملية لا يزيد عن 50 حرفًا" : undefined;
  const rowHover = { "&:hover": { bgcolor: HX.surface2 } };

  return <DashboardLayout pageTitle="الغرامات وقواعد الحساب" pageSubtitle="القواعد اللي بيتحسب على أساسها أي غرامة على الصانع، وسجل كل غرامة اتطبقت فعليًا" pageActions={<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
    {can("finance_export") && <Button variant="outlined" onClick={exportCsv} startIcon={<FileDownloadOutlinedIcon />} sx={outlineBtnSx}>تصدير سجل الغرامات</Button>}
    {canSettle && <Button variant="contained" onClick={() => openEditor(emptyForm())} startIcon={<AddIcon />} sx={{ minHeight: 34, px: 2, borderRadius: "9px", color: "#fff", fontFamily: font, fontSize: 12.5, fontWeight: 700 }}>قاعدة جديدة</Button>}
  </Box>}>
    <ToastContainer rtl position="top-center" />
    <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 1.5, fontFamily: font }}>
      {kpis.map((kpi) => <Box key={kpi.label} sx={{ ...cardSx, p: "16px 18px", transition: ".2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.06)", transform: "translateY(-1px)" } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: kpi.bg, color: kpi.tone, "& svg": { fontSize: 18 } }}>{kpi.icon}</Box>
          <Typography sx={{ fontFamily: font, fontSize: 11, color: HX.tx3 }}>{kpi.side}</Typography>
        </Box>
        <Typography sx={{ fontFamily: font, fontSize: kpi.valueSize, fontWeight: 800, color: kpi.valueColor, lineHeight: 1.2, mb: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kpi.value}</Typography>
        <Typography sx={{ fontFamily: font, fontSize: 11.5, color: HX.tx2, fontWeight: 500 }}>{kpi.label}</Typography>
        {kpi.badge && <Box component="span" sx={{ ...chipSx(kpi.badgeBg, kpi.badgeColor), mt: 1, fontFamily: font }}>{kpi.badge}</Box>}
      </Box>)}
    </Box>

    <Box sx={{ ...cardSx, mt: 2, fontFamily: font, overflow: "hidden" }}>
      <Box role="tablist" sx={{ display: "flex", borderBottom: `1px solid ${HX.border}`, bgcolor: HX.surface2 }}>
        {tabs.map((item) => <Button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} sx={{ minHeight: 50, flex: 1, gap: 1, borderRadius: 0, borderBottom: tab === item.id ? `2px solid ${HX.accent}` : "2px solid transparent", bgcolor: tab === item.id ? HX.surface : "transparent", color: tab === item.id ? HX.accent : HX.tx2, fontFamily: font, fontSize: 13, fontWeight: tab === item.id ? 800 : 600 }}>
          {item.icon}{item.title}<Box component="span" sx={{ minWidth: 22, height: 20, px: "7px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", bgcolor: tab === item.id ? HX.accent : HX.accentLight, color: tab === item.id ? "#fff" : HX.accent, fontSize: 10, fontWeight: 700 }}>{item.count}</Box>
        </Button>)}
      </Box>

      {tab === "rules" ? <Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: 1.25 }}>
        {rules.isLoading ? <Empty text="جارٍ التحميل…" /> : rules.isError ? <Empty text="تعذر تحميل القواعد، من فضلك حاول مرة أخرى" onRetry={() => rules.refetch()} /> : !ruleList.length ? <Empty text={'لسه مفيش قواعد. دوس "قاعدة جديدة" عشان تضيف أول قاعدة غرامة.'} /> : ruleList.map((rule) => {
          const kind = METHODS.find((item) => item.value === methodOf(rule)) ?? METHODS[0];
          const [value, unit] = ruleValue(rule, kind.value);
          return <Box key={rule.id} sx={{ border: `1px solid ${HX.border}`, borderRadius: "12px", p: "14px 16px", display: "flex", alignItems: "center", gap: 1.75, flexWrap: { xs: "wrap", md: "nowrap" }, bgcolor: HX.surface, opacity: rule.active ? 1 : 0.55, transition: ".15s", "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,.05)" } }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, bgcolor: kind.bg }}>{kind.icon}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", fontSize: 13.5, fontWeight: 800, color: HX.tx }}>{rule.name}<Box component="span" sx={chipSx(kind.badgeBg, kind.badgeColor)}>{kind.badge}</Box><Box component="span" sx={chipSx(HX.surface2, HX.tx2)}>{option.trigger.find(([id]) => id === rule.trigger)?.[1] ?? rule.trigger}</Box></Box>
              <Box sx={{ fontSize: 11.5, color: HX.tx2, mt: "2px" }}>{rule.description}{Number(rule.graceHours) > 0 && rule.trigger !== "manual" ? ` · فترة سماح ${Number(rule.graceHours)} ساعة` : ""}</Box>
            </Box>
            <Box sx={{ minWidth: 110, textAlign: "left", fontSize: 15, fontWeight: 900, color: HX.tx }}>{value}<Box component="small" sx={{ display: "block", fontSize: 10, fontWeight: 500, color: HX.tx3 }}>{unit}</Box></Box>
            {canSettle && <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {rule.active && rule.trigger === "manual" && <Button size="small" onClick={() => setManualRule(rule)} sx={{ ...outlineBtnSx, minHeight: 30, px: 1.25 }}>تطبيق</Button>}
              <Switch size="small" color="success" aria-label={`تفعيل ${rule.name}`} checked={rule.active} disabled={save.isPending} onChange={(_, active) => save.mutate({ id: rule.id, payload: rulePayload(rule, { active }) })} />
              <Tooltip title="تعديل"><IconButton aria-label="تعديل" size="small" onClick={() => openEditor(toForm(rule))} sx={{ width: 30, height: 30, borderRadius: "8px", border: `1px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2, "&:hover": { borderColor: HX.accent, color: HX.accent } }}><EditOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip><Tooltip title="حذف"><IconButton aria-label="حذف" size="small" onClick={() => setDeleting(rule)} sx={{ width: 30, height: 30, borderRadius: "8px", border: `1px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2, "&:hover": { borderColor: HX.red, color: HX.red } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            </Box>}
          </Box>;
        })}
      </Box> : <Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", p: "12px 18px", borderBottom: `1px solid ${HX.border}`, bgcolor: HX.surface2 }}>
          <TextField size="small" placeholder="اسم الصانع" value={filters.vendor} onChange={setFilter("vendor")} inputProps={{ "aria-label": "بحث باسم الصانع", maxLength: 100 }} sx={{ ...filterFieldSx, minWidth: 160 }} InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, color: HX.tx3, ml: 0.75 }} /> }} />
          <TextField size="small" placeholder="رقم العملية" value={filters.operationNumber} onChange={setFilter("operationNumber")} inputProps={{ "aria-label": "بحث برقم العملية", maxLength: 50 }} sx={{ ...filterFieldSx, minWidth: 130 }} />
          <TextField select size="small" value={filters.ruleId} onChange={setFilter("ruleId")} SelectProps={{ displayEmpty: true }} sx={{ ...filterFieldSx, minWidth: 140 }}><MenuItem value="">كل القواعد</MenuItem>{ruleList.map((rule) => <MenuItem key={rule.id} value={String(rule.id)}>{rule.name}</MenuItem>)}</TextField>
          <TextField select size="small" value={filters.status} onChange={setFilter("status")} SelectProps={{ displayEmpty: true }} sx={{ ...filterFieldSx, minWidth: 120 }}><MenuItem value="">كل الحالات</MenuItem><MenuItem value="active">مطبقة</MenuItem><MenuItem value="waived">ملغاة</MenuItem></TextField>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography sx={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: HX.tx2 }}>التاريخ</Typography>
            <TextField size="small" type="date" value={filters.from} onChange={setFilter("from")} sx={filterFieldSx} />
            <Typography sx={{ fontFamily: font, fontSize: 11.5, color: HX.tx3 }}>إلى</Typography>
            <TextField size="small" type="date" value={filters.to} onChange={setFilter("to")} sx={filterFieldSx} />
          </Box>
          <Button onClick={() => setFilters({ vendor: "", operationNumber: "", ruleId: "", status: "", from: "", to: "" })} sx={{ ...outlineBtnSx, mr: "auto" }}>مسح الفلاتر</Button>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 900 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: LOG_COLUMNS, alignItems: "center", gap: 1.25, p: "12px 18px", borderBottom: `1px solid ${HX.border}`, bgcolor: HX.surface2 }}>
              {["رقم العملية", "الصانع", "القاعدة المطبقة", "التاريخ", "القيمة", "حالة الطلب", "الحالة", ""].map((title, index) => <Box key={index} component="span" sx={{ fontSize: 11, fontWeight: 700, color: HX.tx3 }}>{title}</Box>)}
            </Box>
            {(searching ? found.isLoading : records.isLoading) ? <Empty text="جارٍ التحميل…" /> : (searching ? found.isError : records.isError) ? <Empty text="تعذر تحميل السجل، من فضلك حاول مرة أخرى" onRetry={() => (searching ? found.refetch() : records.refetch())} /> : !visible.length ? <Empty text={all.length || searching ? "مفيش غرامات مطابقة للفلاتر دي" : "لسه مفيش غرامات متطبقة"} /> : visible.map((record) => {
              const waived = Boolean(record.waivedAt);
              return <Box key={record.id} sx={{ display: "grid", gridTemplateColumns: LOG_COLUMNS, alignItems: "center", gap: 1.25, p: "12px 18px", borderBottom: `1px solid ${HX.border}`, fontSize: 12.5, opacity: waived ? 0.55 : 1, "&:last-child": { borderBottom: "none" }, ...rowHover }}>
                <Box component="span" sx={{ color: HX.accent, fontWeight: 700 }}>{record.operationNumber || `#${record.orderNumber || record.orderId}`}</Box>
                <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={record.vendorName || ""}>{record.vendorName || "—"}</Box>
                <Box component="span"><Box component="span" sx={{ ...chipSx(HX.surface2, HX.tx2), border: `1px solid ${HX.border}` }}>{record.ruleName}</Box></Box>
                <Box component="span" sx={{ color: HX.tx2, fontSize: 12 }}>{dateText(record.appliedAt)}</Box>
                <Box component="span" sx={{ fontWeight: 800, color: waived ? HX.tx3 : HX.red, textDecoration: waived ? "line-through" : "none" }}>{num(record.amount)} ج.م</Box>
                <Box component="span" sx={{ color: HX.tx2, fontSize: 11.5 }}>{getStatusValue(record.orderStatus)?.trim() || `#${record.orderNumber || record.orderId}`}</Box>
                <Tooltip title={waived ? record.waiveReason || "" : ""}><Box component="span"><Box component="span" sx={chipSx(waived ? HX.greenLight : HX.redLight, waived ? HX.green : HX.red)}>{waived ? "ملغاة" : "مطبقة"}</Box></Box></Tooltip>
                <Box component="span">{!waived && canSettle && <Button size="small" onClick={() => setWaive(record)} sx={outlineBtnSx}>إلغاء</Button>}</Box>
              </Box>;
            })}
          </Box>
        </Box>
      </Box>}
    </Box>

    <Dialog open={Boolean(editing)} onClose={() => !save.isPending && openEditor(null)} dir="rtl" fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", fontFamily: font } }}>
      <ModalTitle onClose={() => !save.isPending && openEditor(null)}>{editing?.id ? "تعديل قاعدة" : "قاعدة غرامة جديدة"}</ModalTitle>
      <DialogContent dividers sx={{ p: "16px 18px !important", display: "flex", flexDirection: "column", gap: 2, maxHeight: "min(720px, calc(100vh - 170px))" }}>
        {editing && <>
          <TextField label="اسم القاعدة" placeholder="مثال: تأخير التسليم عن الموعد" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} error={Boolean(err("name"))} helperText={err("name")} inputProps={{ maxLength: 150 }} sx={{ ...fieldSx, mt: 0.5 }} required />
          <TextField label="سبب الغرامة (وصف)" placeholder="اشرح إمتى القاعدة دي بتتفعّل بالظبط" value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} error={Boolean(err("description"))} helperText={err("description")} multiline minRows={2} sx={fieldSx} />
          <TextField select label="سبب تطبيق الغرامة" value={editing.trigger} onChange={(event) => setEditing(applyTrigger(editing, event.target.value as RuleForm["trigger"]))} sx={fieldSx}>{option.trigger.map(([value, title]) => <MenuItem key={value} value={value}>{title}</MenuItem>)}</TextField>
          <Hint>{TRIGGER_HINTS[editing.trigger]}</Hint>
          <TextField select label="طريقة الحساب" value={method} onChange={(event) => setEditing(applyMethod(editing, event.target.value as Method))} sx={fieldSx}>{METHODS.filter((item) => !isManual || MANUAL_METHODS.includes(item.value)).map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: method === "percentage_daily" || method === "tiered_daily" ? "1fr 1fr" : "1fr" }, gap: 1.25, alignItems: "start" }}>
            <TextField label={method === "tiered_daily" ? "مبلغ اليوم الواحد (ج.م)" : method === "percentage_daily" ? "النسبة عن كل يوم تأخير (%)" : method === "commission_percent" ? "نسبة من عمولة الشركة (%)" : isPercent ? "النسبة من الأساس (%)" : "قيمة الغرامة (ج.م)"} type="number" inputProps={{ min: 0, max: isPercent ? 100 : undefined, step: "any", inputMode: "decimal" }} value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: event.target.value })} error={Boolean(err("amount"))} helperText={err("amount")} sx={fieldSx} required />
            {(method === "percentage_daily" || method === "tiered_daily") && <TextField label="الحد الأقصى (ج.م — اختياري)" type="number" inputProps={{ min: 0, step: "any", inputMode: "decimal" }} placeholder="مفيش حد" value={editing.maxAmount} onChange={(event) => setEditing({ ...editing, maxAmount: event.target.value })} error={Boolean(err("maxAmount"))} helperText={err("maxAmount")} sx={fieldSx} />}
          </Box>
          {methodHint && <Hint>{methodHint}</Hint>}
          {showBasis && <TextField select label="أساس الحساب" value={editing.basis} onChange={(event) => setEditing({ ...editing, basis: event.target.value as RuleForm["basis"] })} sx={fieldSx}>{option.basis.map(([value, title]) => <MenuItem key={value} value={value}>{title}</MenuItem>)}</TextField>}
          {(method === "fixed" || method === "commission_percent" || method === "percentage") && <TextField label="الحد الأقصى (ج.م — اختياري)" type="number" inputProps={{ min: 0, step: "any", inputMode: "decimal" }} placeholder="مفيش حد" value={editing.maxAmount} onChange={(event) => setEditing({ ...editing, maxAmount: event.target.value })} error={Boolean(err("maxAmount"))} helperText={err("maxAmount")} sx={fieldSx} />}
          {!isManual && <TextField label="فترة سماح قبل ما القاعدة تتفعّل (بالساعات)" type="number" inputProps={{ min: 0, step: 1, inputMode: "numeric" }} value={editing.graceHours} onChange={(event) => setEditing({ ...editing, graceHours: event.target.value })} error={Boolean(err("graceHours"))} helperText={err("graceHours")} sx={fieldSx} />}
          <TextField label="تاريخ السريان" type="datetime-local" value={editing.effectiveFrom} onChange={(event) => setEditing({ ...editing, effectiveFrom: event.target.value })} error={Boolean(err("effectiveFrom"))} helperText={err("effectiveFrom") ?? (isManual ? undefined : "القاعدة تُطبَّق فقط على التأخير/الإلغاء/الرفض بعد هذا التاريخ")} InputLabelProps={{ shrink: true }} sx={fieldSx} required />
          <Box component="label" sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: font, fontSize: 12.5, fontWeight: 700, color: HX.tx2, cursor: "pointer" }}><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} style={{ width: 16, height: 16 }} />تفعيل القاعدة فورًا</Box>
        </>}
      </DialogContent>
      <DialogActions sx={{ px: 2.25, py: 1.75, gap: 1 }}><Button onClick={() => openEditor(null)} disabled={save.isPending} sx={{ ...outlineBtnSx, px: 2.25 }}>إلغاء</Button><Button variant="contained" disabled={save.isPending} onClick={submitRule} sx={{ minHeight: 34, px: 2.25, borderRadius: "9px", color: "#fff", fontFamily: font, fontWeight: 700 }}>{save.isPending ? "جارٍ الحفظ…" : "حفظ القاعدة"}</Button></DialogActions>
    </Dialog>

    <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} dir="rtl" fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", fontFamily: font } }}>
      <ModalTitle onClose={() => setDeleting(null)}>حذف قاعدة</ModalTitle>
      <DialogContent dividers sx={{ p: "16px 18px !important", display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography sx={{ fontFamily: font, fontSize: 13, color: HX.tx }}>هتحذف قاعدة "{deleting?.name}"؟</Typography>
        <Hint size={12}>القاعدة هتختفي من القائمة ومش هتتطبق على أي طلب بعد كده، لكن الغرامات اللي اتطبقت بيها قبل كده هتفضل ظاهرة في السجل.</Hint>
      </DialogContent>
      <DialogActions sx={{ px: 2.25, py: 1.75, gap: 1 }}><Button onClick={() => setDeleting(null)} disabled={deleteMutation.isPending} sx={{ ...outlineBtnSx, px: 2.25 }}>تراجع</Button><Button variant="contained" color="error" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()} sx={{ minHeight: 34, px: 2.25, borderRadius: "9px", color: "#fff", fontFamily: font, fontSize: 12.5, fontWeight: 700 }}>{deleteMutation.isPending ? "جارٍ الحذف…" : "حذف القاعدة"}</Button></DialogActions>
    </Dialog>

    <Dialog open={Boolean(waive)} onClose={() => setWaive(null)} dir="rtl" fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", fontFamily: font } }}>
      <ModalTitle onClose={() => setWaive(null)}>إلغاء غرامة</ModalTitle>
      <DialogContent dividers sx={{ p: "16px 18px !important", display: "flex", flexDirection: "column", gap: 2 }}>
        {waive && <Hint size={12}>غرامة {num(waive.amount)} ج.م على "{waive.vendorName || `طلب #${waive.orderNumber || waive.orderId}`}" — {waive.ruleName} ({waive.operationNumber || `#${waive.orderNumber || waive.orderId}`})</Hint>}
        <TextField autoFocus fullWidth multiline minRows={3} label="سبب الإلغاء" placeholder="مثال: الصانع أثبت إن التأخير كان بسبب شركة الشحن" value={waiveReason} onChange={(event) => setWaiveReason(event.target.value)} inputProps={{ maxLength: 1000 }} error={waiveReason.length > 0 && waiveReason.trim().length < 3} helperText={waiveReason.length > 0 && waiveReason.trim().length < 3 ? "من فضلك اكتب سببًا من 3 أحرف على الأقل" : undefined} sx={{ ...fieldSx, mt: 0.5 }} required />
      </DialogContent>
      <DialogActions sx={{ px: 2.25, py: 1.75, gap: 1 }}><Button onClick={() => setWaive(null)} disabled={waiveMutation.isPending} sx={{ ...outlineBtnSx, px: 2.25 }}>تراجع</Button><Button variant="contained" disabled={waiveReason.trim().length < 3 || waiveMutation.isPending} onClick={() => waiveMutation.mutate()} sx={{ minHeight: 34, px: 2.25, borderRadius: "9px", color: "#fff", fontFamily: font, fontWeight: 700 }}>{waiveMutation.isPending ? "جارٍ الإلغاء…" : "تأكيد إلغاء الغرامة"}</Button></DialogActions>
    </Dialog>

    <Dialog open={Boolean(manualRule)} onClose={() => setManualRule(null)} dir="rtl" fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", fontFamily: font } }}>
      <ModalTitle onClose={() => setManualRule(null)}>تطبيق {manualRule?.name}</ModalTitle>
      <DialogContent dividers sx={{ p: "16px 18px !important" }}><TextField autoFocus fullWidth label="رقم العملية" value={manualOrderId} onChange={(event) => setManualOrderId(event.target.value)} error={Boolean(manualOrderError)} helperText={manualOrderError ?? "اكتب رقم العملية للطلب الذي تريد تطبيق الغرامة عليه (كما يظهر في سجل الغرامات)"} inputProps={{ maxLength: 50 }} sx={{ ...fieldSx, mt: 0.5 }} required /></DialogContent>
      <DialogActions sx={{ px: 2.25, py: 1.75, gap: 1 }}><Button onClick={() => setManualRule(null)} disabled={manualMutation.isPending} sx={{ ...outlineBtnSx, px: 2.25 }}>إلغاء</Button><Button variant="contained" disabled={!manualOrderId.trim() || Boolean(manualOrderError) || manualMutation.isPending} onClick={() => manualMutation.mutate()} sx={{ minHeight: 34, px: 2.25, borderRadius: "9px", color: "#fff", fontFamily: font, fontWeight: 700 }}>{manualMutation.isPending ? "جارٍ التطبيق…" : "تطبيق الغرامة"}</Button></DialogActions>
    </Dialog>
  </DashboardLayout>;
}

function Empty({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return <Box sx={{ py: 6, px: 2.5, textAlign: "center", color: HX.tx3, fontSize: 13, fontFamily: font }}>{text}{onRetry && <Box sx={{ mt: 1.5 }}><Button onClick={onRetry} sx={outlineBtnSx}>إعادة المحاولة</Button></Box>}</Box>;
}
function Hint({ children, size = 10.5 }: { children: React.ReactNode; size?: number }) {
  return <Typography sx={{ fontFamily: font, fontSize: size, color: HX.tx3, mt: -0.75 }}>{children}</Typography>;
}
function ModalTitle({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.25, py: 1.75, fontFamily: font, fontSize: 14, fontWeight: 800 }}>
    {children}
    <IconButton aria-label="إغلاق" onClick={onClose} size="small" sx={{ bgcolor: HX.surface2, width: 26, height: 26, borderRadius: "7px" }}><CloseOutlinedIcon sx={{ fontSize: 16 }} /></IconButton>
  </DialogTitle>;
}
