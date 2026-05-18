import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  Grid,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { PAYMENT_STATUS, DELIVERY_STATUS, statusoptions } from "layouts/Orders/utils/constants";
import type { OrdersMeta } from "query/ordersMeta.api";
import moment from "moment";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";

export interface FiltersPanelValue {
  orderStatus: number[];
  selectedVendor: string[];
  paymentStatus: string;
  deliveryStatus: number[];
  userId: string;
  /** معرفات «التوصيل بواسطة» من `deliveryByOptions` */
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
  /** من `useDateRange` — لعرض المكوّن الموحّد لنطاق التاريخ */
  dateRangeStart: any;
  dateRangeEnd: any;
  onDateRangeChange: (start: string, end: string) => void;
  onDateRangeClear: () => void;
}

/* ─── shared select sx ─── */
const selectSx = {
  height: 34,
  borderRadius: "8px",
  fontSize: "12.5px",
  fontFamily: "'Cairo',sans-serif",
  bgcolor: HX.surface,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: HX.accent,
    borderWidth: 1,
    boxShadow: `0 0 0 3px ${HX.accentLight}`,
  },
} as const;

const labelSx = {
  fontSize: "11px",
  fontWeight: 600,
  color: HX.tx2,
  fontFamily: "'Cairo',sans-serif",
  display: "block",
  mb: "4px",
} as const;

const MENU_PROPS = {
  PaperProps: {
    sx: {
      borderRadius: "10px", mt: "5px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      "& .MuiMenuItem-root": { fontFamily: "'Cairo',sans-serif", fontSize: "12.5px" },
    },
  },
};

const FALLBACK_DELIVERY_BY: { id: number; label: string }[] = [
  { id: 1, label: "هوميكس" },
  { id: 2, label: "بائع" },
];

export default function OrdersHomixFiltersPanel({
  isVendor,
  vendors,
  users,
  meta,
  value,
  onApply,
  onReset,
  dateRangeStart,
  dateRangeEnd,
  onDateRangeChange,
  onDateRangeClear,
}: OrdersHomixFiltersPanelProps) {
  const [open, setOpen] = useState(true);

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

  const assigneeOpts = useMemo(() => {
    if (meta?.assignees?.length) return meta.assignees;
    return users.map((u) => ({
      id: Number(u.id),
      label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.id),
    }));
  }, [meta?.assignees, users]);

  const deliveryByOpts = useMemo(
    () =>
      meta?.deliveryByOptions?.length ? meta.deliveryByOptions : FALLBACK_DELIVERY_BY,
    [meta?.deliveryByOptions]
  );

  /* draft state — synced when external value changes */
  const [draftStatus,   setDraftStatus]   = useState<number[]>(value.orderStatus ?? []);
  const [draftDelivery, setDraftDelivery] = useState<number[]>(value.deliveryStatus ?? []);
  const [draftPayment,  setDraftPayment]  = useState<string>(value.paymentStatus ?? "");
  const [draftVendor,   setDraftVendor]   = useState<string[]>((value.selectedVendor ?? []).map(String));
  const [draftUserId,   setDraftUserId]   = useState<string>(value.userId ?? "");
  const [draftDeliveryBy, setDraftDeliveryBy] = useState<number[]>(value.deliveryBy ?? []);

  const hasDateRange = Boolean(dateRangeStart) && Boolean(dateRangeEnd);

  useEffect(() => {
    setDraftStatus(value.orderStatus ?? []);
    setDraftDelivery(value.deliveryStatus ?? []);
    setDraftPayment(value.paymentStatus ?? "");
    setDraftVendor((value.selectedVendor ?? []).map(String));
    setDraftUserId(value.userId ?? "");
    setDraftDeliveryBy(value.deliveryBy ?? []);
  }, [value]);

  const totalActive =
    draftStatus.length +
    draftDelivery.length +
    (draftPayment ? 1 : 0) +
    (isVendor ? 0 : draftVendor.length) +
    (draftUserId ? 1 : 0) +
    (hasDateRange ? 1 : 0) +
    draftDeliveryBy.length;

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

  const handleReset = () => {
    setDraftStatus([]);
    setDraftDelivery([]);
    setDraftPayment("");
    setDraftVendor([]);
    setDraftUserId("");
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
    ...(draftPayment
      ? [{ label: `دفع: ${paymentOpts.find((o) => String(o.value) === draftPayment)?.label ?? draftPayment}`, onRemove: () => setDraftPayment("") }]
      : []),
    ...(isVendor ? [] : draftVendor.map((v) => ({
      label: `مصنع: ${vendors.find((o) => String(o.value) === v)?.label ?? v}`,
      onRemove: () => setDraftVendor((p) => p.filter((x) => x !== v)),
    }))),
    ...(draftUserId ? [{
      label: `مسئول: ${assigneeOpts.find((x) => String(x.id) === draftUserId)?.label ?? draftUserId}`,
      onRemove: () => setDraftUserId(""),
    }] : []),
    ...(hasDateRange
      ? [
          {
            label: `التاريخ: ${
              moment.isMoment(dateRangeStart)
                ? dateRangeStart.clone().locale("ar").format("L")
                : String(dateRangeStart)
            } — ${
              moment.isMoment(dateRangeEnd)
                ? dateRangeEnd.clone().locale("ar").format("L")
                : String(dateRangeEnd)
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
  /* ── shared field wrapper ── */
  function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <Box>
        <Typography component="label" sx={labelSx}>{label}</Typography>
        {children}
      </Box>
    );
  }

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
                <FormControl fullWidth size="small">
                  <Select multiple displayEmpty value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value as number[])}
                    input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                    renderValue={(sel) => sel.length === 0
                      ? <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>كل الحالات</span>
                      : sel.length === 1
                      ? <span style={{ fontFamily: "'Cairo',sans-serif" }}>{statusOpts.find((o) => o.value === sel[0])?.label}</span>
                      : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{sel.length} محدد</span>
                    }
                  >
                    {statusOpts.map((o) => (
                      <MenuItem key={o.value} value={o.value} dense>
                        <Checkbox size="small" checked={draftStatus.includes(o.value)} sx={{ py: 0, mr: 0.5 }} />
                        <ListItemText primary={o.label} primaryTypographyProps={{ fontSize: "12.5px", fontFamily: "'Cairo',sans-serif" }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldBox>
            </Grid>

            {/* حالة التصنيع */}
            <Grid item xs={12} sm={6} md={12 / 5}>
              <FieldBox label="حالة التصنيع">
                <FormControl fullWidth size="small">
                  <Select multiple displayEmpty value={draftDelivery}
                    onChange={(e) => setDraftDelivery(e.target.value as number[])}
                    input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                    renderValue={(sel) => sel.length === 0
                      ? <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>كل الحالات</span>
                      : sel.length === 1
                      ? <span style={{ fontFamily: "'Cairo',sans-serif" }}>{manufactureOpts.find((o) => o.value === sel[0])?.label}</span>
                      : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{sel.length} محدد</span>
                    }
                  >
                    {manufactureOpts.map((o) => (
                      <MenuItem key={o.value} value={o.value} dense>
                        <Checkbox size="small" checked={draftDelivery.includes(o.value)} sx={{ py: 0, mr: 0.5 }} />
                        <ListItemText primary={o.label} primaryTypographyProps={{ fontSize: "12.5px", fontFamily: "'Cairo',sans-serif" }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldBox>
            </Grid>

            {/* طريقة الدفع — hidden from vendor */}
            {!isVendor && (
              <Grid item xs={12} sm={6} md={12 / 5}>
                <FieldBox label="طريقة الدفع">
                  <FormControl fullWidth size="small">
                    <Select displayEmpty value={draftPayment}
                      onChange={(e) => setDraftPayment(e.target.value as string)}
                      input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                      renderValue={(sel) => !sel
                        ? <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>الكل</span>
                        : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{paymentOpts.find((o) => String(o.value) === sel)?.label ?? sel}</span>
                      }
                    >
                      <MenuItem value="" dense>
                        <em style={{ fontSize: "12.5px", color: HX.tx2, fontFamily: "'Cairo',sans-serif" }}>الكل</em>
                      </MenuItem>
                      {paymentOpts.map((o) => (
                        <MenuItem key={o.value} value={String(o.value)} dense>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldBox>
              </Grid>
            )}

            {/* التوصيل بواسطة — من الـ meta: deliveryByOptions */}
            <Grid item xs={12} sm={6} md={12 / 5}>
              <FieldBox label="التوصيل بواسطة">
                <FormControl fullWidth size="small">
                  <Select
                    multiple
                    displayEmpty
                    value={draftDeliveryBy}
                    onChange={(e) => setDraftDeliveryBy(e.target.value as number[])}
                    input={<OutlinedInput />}
                    MenuProps={MENU_PROPS}
                    sx={selectSx}
                    renderValue={(sel) =>
                      sel.length === 0 ? (
                        <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>الكل</span>
                      ) : sel.length === 1 ? (
                        <span style={{ fontFamily: "'Cairo',sans-serif" }}>
                          {deliveryByOpts.find((o) => o.id === sel[0])?.label}
                        </span>
                      ) : (
                        <span style={{ fontFamily: "'Cairo',sans-serif" }}>{sel.length} محدد</span>
                      )
                    }
                  >
                    {deliveryByOpts.map((o) => (
                      <MenuItem key={o.id} value={o.id} dense>
                        <Checkbox
                          size="small"
                          checked={draftDeliveryBy.includes(o.id)}
                          sx={{ py: 0, mr: 0.5 }}
                        />
                        <ListItemText
                          primary={o.label}
                          primaryTypographyProps={{ fontSize: "12.5px", fontFamily: "'Cairo',sans-serif" }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldBox>
            </Grid>

            {/* المصنع / البائع — hidden from vendor */}
            {!isVendor && (
              <Grid item xs={12} sm={6} md={12 / 5}>
                <FieldBox label="المصنع / البائع">
                  <FormControl fullWidth size="small">
                    <Select multiple displayEmpty value={draftVendor}
                      onChange={(e) => setDraftVendor(e.target.value as string[])}
                      input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                      renderValue={(sel) => sel.length === 0
                        ? <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>كل المصانع</span>
                        : sel.length === 1
                        ? <span style={{ fontFamily: "'Cairo',sans-serif" }}>{vendors.find((o) => String(o.value) === sel[0])?.label ?? sel[0]}</span>
                        : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{sel.length} محدد</span>
                      }
                    >
                      {vendors.map((o) => (
                        <MenuItem key={String(o.value)} value={String(o.value)} dense>
                          <Checkbox size="small" checked={draftVendor.includes(String(o.value))} sx={{ py: 0, mr: 0.5 }} />
                          <ListItemText primary={o.label} primaryTypographyProps={{ fontSize: "12.5px", fontFamily: "'Cairo',sans-serif" }} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
              التفاصيل
            </Typography>
          </Box>

          <Grid container spacing="10px" alignItems="flex-end">

            {/* المسئول */}
            <Grid item xs={12} sm={6} md={4}>
              <FieldBox label="المسئول">
                <FormControl fullWidth size="small">
                  <Select displayEmpty value={draftUserId}
                    onChange={(e) => setDraftUserId(e.target.value as string)}
                    input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                    renderValue={(sel) => !sel
                      ? <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>كل المسئولين</span>
                      : (() => {
                          const u = assigneeOpts.find((x) => String(x.id) === sel);
                          return <span style={{ fontFamily: "'Cairo',sans-serif" }}>
                            {u?.label ?? sel}
                          </span>;
                        })()
                    }
                  >
                    <MenuItem value="" dense>
                      <em style={{ fontSize: "12.5px", color: HX.tx2, fontFamily: "'Cairo',sans-serif" }}>كل المسئولين</em>
                    </MenuItem>
                    {assigneeOpts.map((u) => (
                      <MenuItem key={String(u.id)} value={String(u.id)} dense>
                        {u.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldBox>
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
              <FieldBox label="من تاريخ — إلى تاريخ">
                <Box
                  sx={{
                    minHeight: 34,
                    "& .custom-date-picker, & .DateRangePicker, & .DateRangePickerInput": {
                      width: "100% !important",
                    },
                  }}
                >
                  <DateRangePickerWrapper
                    startDate={dateRangeStart || ""}
                    endDate={dateRangeEnd || ""}
                    handleDatesChange={onDateRangeChange}
                    allowPastDays
                    allowFutureDays
                    maxDaysRange={730}
                    useDefaultPresets
                    isMeduim
                  />
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
