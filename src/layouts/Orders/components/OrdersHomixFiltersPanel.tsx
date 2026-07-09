import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Collapse, Grid, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import {
  PAYMENT_STATUS,
  DELIVERY_STATUS,
  statusoptions,
  mapDeliveryPriorityToBadgeLevel,
} from "layouts/Orders/utils/constants";
import type { OrdersMeta } from "query/ordersMeta.api";
import moment from "moment";
import MultiSelect from "components/MultiSelect/MultiSelect";

export interface FiltersPanelValue {
  orderStatus: number[];
  selectedVendor: string[];
  paymentStatus: string[];
  deliveryStatus: number[];
  userId: string[];
  /** معرفات «شركات الشحن» من `deliveryByOptions` */
  deliveryBy: number[];
}

interface User { id: string | number; firstName?: string; lastName?: string }

interface OrdersHomixFiltersPanelProps {
  isVendor: boolean;
  vendors: { label: string; value: string | number }[];
  users: User[];
  /** خيارات الفلاتر من `GET /orders/meta` — عند الفراغ تُستخدم الثوابت المحلية */
  meta: OrdersMeta | null | undefined;
  value: FiltersPanelValue;
  onApply: (v: FiltersPanelValue) => void;
  onReset: () => void;
  /** الأولوية — معرّفاتها المحددة؛ تُطبَّق مباشرة عند النقر */
  priorityValue: string[];
  onPriorityChange: (next: string[]) => void;
  /** نطاق التاريخ — حقلان مستقلان بصيغة "YYYY-MM-DD" (فارغ = غير محدد) */
  startDate: string;
  endDate: string;
  onStartDateChange: (iso: string) => void;
  onEndDateChange: (iso: string) => void;
  onDateRangeClear: () => void;
}

const labelSx = {
  fontSize: "11px",
  fontWeight: 600,
  color: HX.tx2,
  fontFamily: "'Cairo',sans-serif",
  display: "block",
  mb: "4px",
} as const;

/* shared field wrapper — module-level so its identity is stable across re-renders.
   (Defining it inside the component re-created the type each render, which remounted
   every Select and slammed the open dropdown shut on each selection.) */
function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography component="label" sx={labelSx}>{label}</Typography>
      {children}
    </Box>
  );
}

const FALLBACK_DELIVERY_BY: { id: number; label: string }[] = [
  { id: 1, label: "هوميكس" },
  { id: 2, label: "بائع" },
];

/* الأولوية — تُستخدم عند غياب `meta.priorities` (1 بالمدة، 2 مستعجل، 3 مستعجل جداً) */
const FALLBACK_PRIORITIES: { value: string; label: string }[] = [
  { value: "1", label: "بالمدة المحددة" },
  { value: "2", label: "مستعجل" },
  { value: "3", label: "مستعجل جداً" },
];

/* اللون الدلالي لكل أولوية — يطابق PriorityBadge. نُطابق حسب مستوى الشارة حتى تصحّ
   الألوان سواء كانت معرّفات الـ meta أرقامًا (1/2/3) أو نصوصًا (onschedule…). */
const PRIORITY_STYLE_BY_LEVEL = {
  normal:        { bg: HX.greenLight, color: "#065f46", dot: HX.green },
  urgent:        { bg: HX.amberLight, color: "#92400e", dot: HX.amber },
  "very-urgent": { bg: HX.redLight,   color: "#991b1b", dot: HX.red },
} as const;

function priorityStyle(id: string) {
  const level = mapDeliveryPriorityToBadgeLevel(id);
  return level ? PRIORITY_STYLE_BY_LEVEL[level] : { bg: HX.accentLight, color: HX.accent, dot: HX.accent };
}

/* حقل تاريخ أصلي مُنسَّق ليطابق بقية حقول الفلاتر. القيمة بصيغة "YYYY-MM-DD". */
function DateInput({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  return (
    <Box
      component="input"
      type="date"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      sx={{
        width: "100%", height: 34, boxSizing: "border-box",
        px: "10px", borderRadius: "8px",
        border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
        color: value ? HX.tx : HX.tx3,
        fontSize: "12.5px", fontFamily: "'Cairo',sans-serif",
        outline: "none", cursor: "pointer",
        transition: "border-color .15s, box-shadow .15s",
        "&:hover": { borderColor: HX.accent },
        "&:focus": { borderColor: HX.accent, boxShadow: `0 0 0 3px ${HX.accentLight}` },
        "&::-webkit-calendar-picker-indicator": { cursor: "pointer", opacity: 0.55 },
      }}
    />
  );
}

export default function OrdersHomixFiltersPanel({
  isVendor,
  vendors,
  users,
  meta,
  value,
  onApply,
  onReset,
  priorityValue,
  onPriorityChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onDateRangeClear,
}: OrdersHomixFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  const statusOpts = useMemo(
    () =>
      meta?.statuses?.length
        ? meta.statuses.map((s) => ({ value: s.id, label: s.label }))
        : statusoptions,
    [meta?.statuses]
  );

  const manufactureOpts = useMemo(
    () =>
      meta?.manufactureStatuses?.length
        ? meta.manufactureStatuses.map((s) => ({ value: s.id, label: s.label }))
        : DELIVERY_STATUS,
    [meta?.manufactureStatuses]
  );

  const paymentOpts = useMemo(
    () =>
      meta?.paymentStatuses?.length
        ? meta.paymentStatuses.map((s) => ({ value: s.id, label: s.label }))
        : PAYMENT_STATUS,
    [meta?.paymentStatuses]
  );

  /* خيارات «المسؤول» من مستخدمي endpoint `/users` مباشرةً */
  const assigneeOpts = useMemo(
    () =>
      users.map((u) => ({
        id: Number(u.id),
        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.id),
      })),
    [users]
  );

  const deliveryByOpts = useMemo(
    () =>
      meta?.deliveryByOptions?.length ? meta.deliveryByOptions : FALLBACK_DELIVERY_BY,
    [meta?.deliveryByOptions]
  );

  const priorityOpts = useMemo(
    () =>
      meta?.priorities?.length
        ? meta.priorities.map((p) => ({ value: String(p.id), label: p.label }))
        : FALLBACK_PRIORITIES,
    [meta?.priorities]
  );

  /* draft state — synced when external value changes */
  const [draftStatus,   setDraftStatus]   = useState<number[]>(value.orderStatus ?? []);
  const [draftDelivery, setDraftDelivery] = useState<number[]>(value.deliveryStatus ?? []);
  const [draftPayment,  setDraftPayment]  = useState<string[]>((value.paymentStatus ?? []).map(String));
  const [draftVendor,   setDraftVendor]   = useState<string[]>((value.selectedVendor ?? []).map(String));
  const [draftUserId,   setDraftUserId]   = useState<string[]>((value.userId ?? []).map(String));
  const [draftDeliveryBy, setDraftDeliveryBy] = useState<number[]>(value.deliveryBy ?? []);

  const hasDateRange = Boolean(startDate) || Boolean(endDate);

  // Only re-sync the drafts when the COMMITTED filter values actually change
  // (apply / reset / chip removal). Using a serialized key — instead of the
  // inline `value` object reference — keeps the user's in-progress selections
  // from being wiped on unrelated parent re-renders (e.g. window-focus refetch
  // or switching browser tabs).
  const valueKey = JSON.stringify(value);
  useEffect(() => {
    setDraftStatus(value.orderStatus ?? []);
    setDraftDelivery(value.deliveryStatus ?? []);
    setDraftPayment((value.paymentStatus ?? []).map(String));
    setDraftVendor((value.selectedVendor ?? []).map(String));
    setDraftUserId((value.userId ?? []).map(String));
    setDraftDeliveryBy(value.deliveryBy ?? []);
  }, [valueKey]);

  const totalActive =
    draftStatus.length +
    draftDelivery.length +
    draftPayment.length +
    (isVendor ? 0 : draftVendor.length) +
    draftUserId.length +
    (hasDateRange ? 1 : 0) +
    draftDeliveryBy.length +
    priorityValue.length;

  const handleApply = () => {
    onApply({
      orderStatus:    draftStatus,
      selectedVendor: draftVendor,
      paymentStatus:  draftPayment,
      deliveryStatus: draftDelivery,
      userId:         draftUserId,
      deliveryBy:     draftDeliveryBy,
    });
  };

  // Auto-apply the current drafts the moment a dropdown closes, so the list
  // refetches with the chosen filter directly — no need to hit "تطبيق الفلاتر".
  // Skipped when nothing changed (a no-op open/close) to avoid resetting the
  // page and refetching pointlessly. The committed key is normalised exactly
  // like the drafts (see the sync effect above) so equality is reliable.
  const committedKey = JSON.stringify({
    orderStatus:    value.orderStatus ?? [],
    selectedVendor: (value.selectedVendor ?? []).map(String),
    paymentStatus:  (value.paymentStatus ?? []).map(String),
    deliveryStatus: value.deliveryStatus ?? [],
    userId:         (value.userId ?? []).map(String),
    deliveryBy:     value.deliveryBy ?? [],
  });

  const handleDropdownClose = () => {
    const draftKey = JSON.stringify({
      orderStatus:    draftStatus,
      selectedVendor: draftVendor,
      paymentStatus:  draftPayment,
      deliveryStatus: draftDelivery,
      userId:         draftUserId,
      deliveryBy:     draftDeliveryBy,
    });
    if (draftKey === committedKey) return;
    handleApply();
  };

  const handleReset = () => {
    setDraftStatus([]);
    setDraftDelivery([]);
    setDraftPayment([]);
    setDraftVendor([]);
    setDraftUserId([]);
    setDraftDeliveryBy([]);
    onReset();
  };

  /* active chips */
  interface ActiveChip { label: string; onRemove: () => void }
  const chips: ActiveChip[] = [
    ...draftStatus.map((s) => ({
      label: `حالة: ${statusOpts.find((o) => o.value === s)?.label?.trim() ?? s}`,
      onRemove: () => setDraftStatus((p) => p.filter((x) => x !== s)),
    })),
    ...draftDelivery.map((s) => ({
      label: `تصنيع: ${manufactureOpts.find((o) => o.value === s)?.label ?? s}`,
      onRemove: () => setDraftDelivery((p) => p.filter((x) => x !== s)),
    })),
    ...(isVendor ? [] : draftPayment.map((p) => ({
      label: `دفع: ${paymentOpts.find((o) => String(o.value) === p)?.label ?? p}`,
      onRemove: () => setDraftPayment((prev) => prev.filter((x) => x !== p)),
    }))),
    ...(isVendor ? [] : draftVendor.map((v) => ({
      label: `مصنع: ${vendors.find((o) => String(o.value) === v)?.label ?? v}`,
      onRemove: () => setDraftVendor((p) => p.filter((x) => x !== v)),
    }))),
    ...draftUserId.map((uid) => ({
      label: `مسئول: ${assigneeOpts.find((x) => String(x.id) === uid)?.label ?? uid}`,
      onRemove: () => setDraftUserId((prev) => prev.filter((x) => x !== uid)),
    })),
    ...priorityValue.map((pv) => ({
      label: `أولوية: ${priorityOpts.find((o) => o.value === pv)?.label ?? pv}`,
      onRemove: () => onPriorityChange(priorityValue.filter((x) => x !== pv)),
    })),
    ...(hasDateRange
      ? [
          {
            label: `التاريخ: ${
              startDate ? moment(startDate, "YYYY-MM-DD").locale("ar").format("L") : "…"
            } — ${
              endDate ? moment(endDate, "YYYY-MM-DD").locale("ar").format("L") : "…"
            }`,
            onRemove: () => onDateRangeClear(),
          },
        ]
      : []),
    ...draftDeliveryBy.map((id) => ({
      label: `توصيل: ${deliveryByOpts.find((o) => o.id === id)?.label ?? id}`,
      onRemove: () => setDraftDeliveryBy((p) => p.filter((x) => x !== id)),
    })),
  ];

  return (
    <Box sx={{ ...cardSx }}>

      {/* ── Collapsible header ── */}
      <Box
        onClick={() => setOpen((p) => !p)}
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          p: "12px 18px",
          borderBottom: open ? `0.5px solid ${HX.border}` : "none",
          cursor: "pointer", userSelect: "none",
          "&:hover": { bgcolor: HX.surface2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FilterAltIcon sx={{ fontSize: 14, color: HX.accent }} />
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: "'Cairo',sans-serif" }}>
            الفلاتر
          </Typography>
          {totalActive > 0 && (
            <Box component="span" sx={{
              fontSize: "10.5px", bgcolor: HX.accent, color: "#fff",
              px: "9px", py: "2px", borderRadius: "10px", fontWeight: 700,
              fontFamily: "'Cairo',sans-serif",
            }}>
              {totalActive} فلتر نشط
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography sx={{ fontSize: "11.5px", color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>
            {totalActive === 0 ? "جميع الطلبات معروضة" : `${totalActive} فلتر مطبق`}
          </Typography>
          <Box sx={{
            width: 22, height: 22, borderRadius: "50%", bgcolor: HX.surface2,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: ".25s", transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>
            <KeyboardArrowDownIcon sx={{ fontSize: 14, color: HX.tx3 }} />
          </Box>
        </Box>
      </Box>

      <Collapse in={open}>

        {/* ── ROW 1 — الحالات (5 dropdowns) ── */}
        <Box sx={{ p: "14px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "10px" }}>
            <Box component="svg" viewBox="0 0 24 24"
              sx={{ width: 11, height: 11, stroke: "currentColor", fill: "none", strokeWidth: 2, opacity: 0.5, color: HX.tx3 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: HX.tx3, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Cairo',sans-serif" }}>
              الحالات
            </Typography>
          </Box>

          <Grid container spacing="10px">
            {/* حالة الطلب */}
            <Grid item xs={12} sm={6} md={12 / 5}>
              <FieldBox label="حالة الطلب">
                <MultiSelect
                  value={draftStatus}
                  onChange={setDraftStatus}
                  onClose={handleDropdownClose}
                  options={statusOpts}
                  placeholder="كل الحالات"
                />
              </FieldBox>
            </Grid>

            {/* حالة التأخير */}
            <Grid item xs={12} sm={6} md={12 / 5}>
              <FieldBox label="حالة التأخير">
                <MultiSelect
                  value={draftDelivery}
                  onChange={setDraftDelivery}
                  onClose={handleDropdownClose}
                  options={manufactureOpts}
                  placeholder="كل الحالات"
                />
              </FieldBox>
            </Grid>

            {/* طريقة الدفع — hidden from vendor */}
            {!isVendor && (
              <Grid item xs={12} sm={6} md={12 / 5}>
                <FieldBox label="طريقة الدفع">
                  <MultiSelect
                    value={draftPayment}
                    onChange={setDraftPayment}
                    onClose={handleDropdownClose}
                    options={paymentOpts.map((o) => ({ value: String(o.value), label: o.label }))}
                    placeholder="الكل"
                  />
                </FieldBox>
              </Grid>
            )}

            {/* شركات الشحن — من الـ meta: deliveryByOptions */}
            <Grid item xs={12} sm={6} md={12 / 5}>
              <FieldBox label="شركات الشحن">
                <MultiSelect
                  value={draftDeliveryBy}
                  onChange={setDraftDeliveryBy}
                  onClose={handleDropdownClose}
                  options={deliveryByOpts.map((o) => ({ value: o.id, label: o.label }))}
                  placeholder="الكل"
                />
              </FieldBox>
            </Grid>

            {/* المصنع / البائع — hidden from vendor */}
            {!isVendor && (
              <Grid item xs={12} sm={6} md={12 / 5}>
                <FieldBox label="المصنع / البائع">
                  <MultiSelect
                    value={draftVendor}
                    onChange={setDraftVendor}
                    onClose={handleDropdownClose}
                    options={vendors.map((o) => ({ value: String(o.value), label: o.label }))}
                    placeholder="كل المصانع"
                  />
                </FieldBox>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* ── ROW 2 — التفاصيل (مسئول + نطاق التاريخ) ── */}
        <Box sx={{ p: "14px 18px", borderBottom: `0.5px solid ${HX.border}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "12px" }}>
            <Box component="svg" viewBox="0 0 24 24"
              sx={{ width: 11, height: 11, stroke: "currentColor", fill: "none", strokeWidth: 2, opacity: 0.5, color: HX.tx3 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: HX.tx3, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Cairo',sans-serif" }}>
              التفاصيل والأولوية
            </Typography>
          </Box>

          <Grid container spacing="10px" alignItems="flex-end">

            {/* المسئول */}
            <Grid item xs={12} sm={6} md={3}>
              <FieldBox label="المسئول">
                <MultiSelect
                  value={draftUserId}
                  onChange={setDraftUserId}
                  onClose={handleDropdownClose}
                  options={assigneeOpts.map((u) => ({ value: String(u.id), label: u.label }))}
                  placeholder="كل المسئولين"
                />
              </FieldBox>
            </Grid>

            {/* من تاريخ */}
            <Grid item xs={6} sm={6} md={2.5}>
              <FieldBox label="من تاريخ">
                <DateInput value={startDate} onChange={onStartDateChange} />
              </FieldBox>
            </Grid>

            {/* إلى تاريخ */}
            <Grid item xs={6} sm={6} md={2.5}>
              <FieldBox label="إلى تاريخ">
                <DateInput value={endDate} onChange={onEndDateChange} />
              </FieldBox>
            </Grid>

            {/* الأولوية — رقائق تُطبَّق مباشرة */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldBox label="الأولوية">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", minHeight: 34 }}>
                  {priorityOpts.map((o) => {
                    const active = priorityValue.includes(o.value);
                    const st = priorityStyle(o.value);
                    return (
                      <Box
                        key={o.value}
                        onClick={() =>
                          onPriorityChange(
                            active
                              ? priorityValue.filter((x) => x !== o.value)
                              : [...priorityValue, o.value]
                          )
                        }
                        sx={{
                          display: "flex", alignItems: "center", gap: "5px",
                          px: "10px", height: 30, borderRadius: "8px",
                          cursor: "pointer", userSelect: "none", transition: ".15s",
                          bgcolor: st.bg, color: st.color,
                          fontSize: "12px", fontWeight: active ? 700 : 600,
                          fontFamily: "'Cairo',sans-serif",
                          border: active ? `1.5px solid ${st.dot}` : "1.5px solid transparent",
                          boxShadow: active ? `0 0 0 3px ${st.bg}` : "none",
                          opacity: active ? 1 : 0.72,
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: st.dot, flexShrink: 0 }} />
                        {o.label}
                      </Box>
                    );
                  })}
                </Box>
              </FieldBox>
            </Grid>

          </Grid>
        </Box>

        {/* ── Active chips ── */}
        {chips.length > 0 && (
          <Box sx={{ p: "10px 18px", bgcolor: HX.accentLight, borderBottom: `0.5px solid ${HX.accentBorder}` }}>
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <Typography sx={{ fontSize: "11px", color: HX.accent, fontWeight: 700, flexShrink: 0, fontFamily: "'Cairo',sans-serif" }}>
                فلاتر نشطة:
              </Typography>
              {chips.map((chip, i) => (
                <Chip key={i} label={chip.label} size="small" onDelete={chip.onRemove}
                  sx={{
                    bgcolor: HX.accentLight, border: `0.5px solid ${HX.accentBorder}`,
                    borderRadius: "20px", fontSize: "11px", color: HX.accent, fontWeight: 600,
                    height: 24, fontFamily: "'Cairo',sans-serif",
                    "& .MuiChip-deleteIcon": { fontSize: 14, color: HX.accent },
                  }}
                />
              ))}
              <Box onClick={handleReset} sx={{
                fontSize: "11px", color: HX.red, cursor: "pointer", fontWeight: 600,
                fontFamily: "'Cairo',sans-serif",
                px: "10px", py: "3px", borderRadius: "6px",
                bgcolor: HX.redLight, mr: "auto",
                "&:hover": { opacity: 0.85 },
              }}>
                × مسح الكل
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Footer ── */}
        <Box sx={{
          p: "11px 18px", bgcolor: HX.surface2,
          borderTop: `0.5px solid ${HX.border}`,
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px",
        }}>
          <Button size="small" onClick={handleReset}
            startIcon={<RefreshIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              px: 2, height: 34, borderRadius: "8px",
              fontSize: "12.5px", fontWeight: 600, fontFamily: "'Cairo',sans-serif",
              color: HX.tx2, border: `0.5px solid ${HX.border}`, bgcolor: HX.surface,
              "&:hover": { borderColor: HX.accent, color: HX.accent },
            }}>
            إعادة ضبط
          </Button>
          <Button size="small" variant="contained" onClick={handleApply}
            startIcon={<FilterAltIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              px: 2, height: 34, borderRadius: "8px",
              fontSize: "12.5px", fontWeight: 600, fontFamily: "'Cairo',sans-serif",
              bgcolor: HX.accent, color: "#fff",
              boxShadow: `0 2px 8px ${HX.accentBorder}`,
              "&:hover": { bgcolor: "#5254e0", boxShadow: "none" },
            }}>
            تطبيق الفلاتر
          </Button>
        </Box>

      </Collapse>
    </Box>
  );
}
