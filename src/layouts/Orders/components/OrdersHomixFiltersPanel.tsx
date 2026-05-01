import React, { useEffect, useState } from "react";
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
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { PAYMENT_STATUS, DELIVERY_STATUS, statusoptions } from "layouts/Orders/utils/constants";

export interface FiltersPanelValue {
  orderStatus: number[];
  selectedVendor: string[];
  paymentStatus: string;
  deliveryStatus: number[];
  fromDate: string;
  toDate: string;
  userId: string;
}

interface User { id: string | number; firstName?: string; lastName?: string }

interface OrdersHomixFiltersPanelProps {
  isVendor: boolean;
  vendors: { label: string; value: string | number }[];
  users: User[];
  value: FiltersPanelValue;
  onApply: (v: FiltersPanelValue) => void;
  onReset: () => void;
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

const dateSx = {
  height: 34,
  width: "100%",
  fontFamily: "'Cairo',sans-serif",
  fontSize: "12.5px",
  padding: "0 12px",
  border: `0.5px solid ${HX.border2}`,
  borderRadius: "8px",
  background: HX.surface,
  color: HX.tx,
  outline: "none",
  cursor: "pointer",
  transition: ".15s",
  "&:focus": {
    borderColor: HX.accent,
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

type PriorityLevel = "very-urgent" | "urgent" | "normal";

const PRIORITY_OPTIONS: { key: PriorityLevel; label: string; bg: string; color: string; dot: string; activeBg: string }[] = [
  { key: "very-urgent", label: "مستعجل جداً",  bg: HX.redLight,   color: HX.red,   dot: HX.red,   activeBg: HX.red   },
  { key: "urgent",      label: "مستعجل",        bg: HX.amberLight, color: HX.amber, dot: HX.amber, activeBg: HX.amber },
  { key: "normal",      label: "بالمدة المحددة", bg: HX.greenLight, color: HX.green, dot: HX.green, activeBg: HX.green },
];

export default function OrdersHomixFiltersPanel({
  isVendor, vendors, users, value, onApply, onReset,
}: OrdersHomixFiltersPanelProps) {
  const [open, setOpen] = useState(true);

  /* draft state — synced when external value changes */
  const [draftStatus,   setDraftStatus]   = useState<number[]>(value.orderStatus ?? []);
  const [draftDelivery, setDraftDelivery] = useState<number[]>(value.deliveryStatus ?? []);
  const [draftPayment,  setDraftPayment]  = useState<string>(value.paymentStatus ?? "");
  const [draftVendor,   setDraftVendor]   = useState<string[]>((value.selectedVendor ?? []).map(String));
  const [draftUserId,   setDraftUserId]   = useState<string>(value.userId ?? "");
  const [draftFrom,     setDraftFrom]     = useState<string>(value.fromDate ?? "");
  const [draftTo,       setDraftTo]       = useState<string>(value.toDate ?? "");
  const [activePriorities, setActivePriorities] = useState<PriorityLevel[]>([]);

  useEffect(() => {
    setDraftStatus(value.orderStatus ?? []);
    setDraftDelivery(value.deliveryStatus ?? []);
    setDraftPayment(value.paymentStatus ?? "");
    setDraftVendor((value.selectedVendor ?? []).map(String));
    setDraftUserId(value.userId ?? "");
    setDraftFrom(value.fromDate ?? "");
    setDraftTo(value.toDate ?? "");
  }, [value]);

  const totalActive =
    draftStatus.length +
    draftDelivery.length +
    (draftPayment ? 1 : 0) +
    (isVendor ? 0 : draftVendor.length) +
    (draftUserId ? 1 : 0) +
    (draftFrom ? 1 : 0) +
    (draftTo ? 1 : 0);

  const handleTogglePriority = (p: PriorityLevel) => {
    setActivePriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleApply = () => {
    onApply({
      orderStatus:    draftStatus,
      selectedVendor: draftVendor,
      paymentStatus:  draftPayment,
      deliveryStatus: draftDelivery,
      fromDate:       draftFrom,
      toDate:         draftTo,
      userId:         draftUserId,
    });
  };

  const handleReset = () => {
    setDraftStatus([]);
    setDraftDelivery([]);
    setDraftPayment("");
    setDraftVendor([]);
    setDraftUserId("");
    setDraftFrom("");
    setDraftTo("");
    setActivePriorities([]);
    onReset();
  };

  /* active chips */
  interface ActiveChip { label: string; onRemove: () => void }
  const chips: ActiveChip[] = [
    ...draftStatus.map((s) => ({
      label: `حالة: ${statusoptions.find((o) => o.value === s)?.label?.trim() ?? s}`,
      onRemove: () => setDraftStatus((p) => p.filter((x) => x !== s)),
    })),
    ...draftDelivery.map((s) => ({
      label: `تصنيع: ${DELIVERY_STATUS.find((o) => o.value === s)?.label ?? s}`,
      onRemove: () => setDraftDelivery((p) => p.filter((x) => x !== s)),
    })),
    ...(draftPayment
      ? [{ label: `دفع: ${PAYMENT_STATUS.find((o) => String(o.value) === draftPayment)?.label ?? draftPayment}`, onRemove: () => setDraftPayment("") }]
      : []),
    ...(isVendor ? [] : draftVendor.map((v) => ({
      label: `مصنع: ${vendors.find((o) => String(o.value) === v)?.label ?? v}`,
      onRemove: () => setDraftVendor((p) => p.filter((x) => x !== v)),
    }))),
    ...(draftUserId ? [{
      label: `مسئول: ${(() => { const u = users.find((x) => String(x.id) === draftUserId); return u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : draftUserId; })()}`,
      onRemove: () => setDraftUserId(""),
    }] : []),
    ...(draftFrom  ? [{ label: `من: ${draftFrom}`,   onRemove: () => setDraftFrom("")  }] : []),
    ...(draftTo    ? [{ label: `إلى: ${draftTo}`,    onRemove: () => setDraftTo("")    }] : []),
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
                      ? <span style={{ fontFamily: "'Cairo',sans-serif" }}>{statusoptions.find((o) => o.value === sel[0])?.label}</span>
                      : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{sel.length} محدد</span>
                    }
                  >
                    {statusoptions.map((o) => (
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
                      ? <span style={{ fontFamily: "'Cairo',sans-serif" }}>{DELIVERY_STATUS.find((o) => o.value === sel[0])?.label}</span>
                      : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{sel.length} محدد</span>
                    }
                  >
                    {DELIVERY_STATUS.map((o) => (
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
                        : <span style={{ fontFamily: "'Cairo',sans-serif" }}>{PAYMENT_STATUS.find((o) => String(o.value) === sel)?.label ?? sel}</span>
                      }
                    >
                      <MenuItem value="" dense>
                        <em style={{ fontSize: "12.5px", color: HX.tx2, fontFamily: "'Cairo',sans-serif" }}>الكل</em>
                      </MenuItem>
                      {PAYMENT_STATUS.map((o) => (
                        <MenuItem key={o.value} value={String(o.value)} dense>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldBox>
              </Grid>
            )}

            {/* التوصيل بواسطة — visual placeholder */}
            <Grid item xs={12} sm={6} md={12 / 5}>
              <FieldBox label="التوصيل بواسطة">
                <FormControl fullWidth size="small" disabled>
                  <Select displayEmpty value="" input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                    renderValue={() => <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>الكل</span>}
                  >
                    <MenuItem value="" dense>المخزن</MenuItem>
                    <MenuItem value="seller" dense>البائع</MenuItem>
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

        {/* ── ROW 2 — التفاصيل والأولوية ── */}
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

          {/* Grid: المسئول | من تاريخ | إلى تاريخ | الأولوية pills (2x) */}
          <Grid container spacing="10px" alignItems="flex-end">

            {/* المسئول */}
            <Grid item xs={12} sm={6} md={2}>
              <FieldBox label="المسئول">
                <FormControl fullWidth size="small">
                  <Select displayEmpty value={draftUserId}
                    onChange={(e) => setDraftUserId(e.target.value as string)}
                    input={<OutlinedInput />} MenuProps={MENU_PROPS} sx={selectSx}
                    renderValue={(sel) => !sel
                      ? <span style={{ color: HX.tx3, fontFamily: "'Cairo',sans-serif" }}>كل المسئولين</span>
                      : (() => {
                          const u = users.find((x) => String(x.id) === sel);
                          return <span style={{ fontFamily: "'Cairo',sans-serif" }}>
                            {u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : sel}
                          </span>;
                        })()
                    }
                  >
                    <MenuItem value="" dense>
                      <em style={{ fontSize: "12.5px", color: HX.tx2, fontFamily: "'Cairo',sans-serif" }}>كل المسئولين</em>
                    </MenuItem>
                    {users.map((u) => (
                      <MenuItem key={String(u.id)} value={String(u.id)} dense>
                        {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.id)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldBox>
            </Grid>

            {/* من تاريخ */}
            <Grid item xs={12} sm={6} md={2}>
              <FieldBox label="من تاريخ">
                <Box
                  component="input"
                  type="date"
                  value={draftFrom}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftFrom(e.target.value)}
                  sx={{
                    ...dateSx,
                    display: "block",
                    "&:focus": { outline: "none", borderColor: HX.accent, boxShadow: `0 0 0 3px ${HX.accentLight}` },
                  }}
                />
              </FieldBox>
            </Grid>

            {/* إلى تاريخ */}
            <Grid item xs={12} sm={6} md={2}>
              <FieldBox label="إلى تاريخ">
                <Box
                  component="input"
                  type="date"
                  value={draftTo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftTo(e.target.value)}
                  sx={{
                    ...dateSx,
                    display: "block",
                    "&:focus": { outline: "none", borderColor: HX.accent, boxShadow: `0 0 0 3px ${HX.accentLight}` },
                  }}
                />
              </FieldBox>
            </Grid>

            {/* الأولوية pills (takes remaining space) */}
            <Grid item xs={12} sm={12} md={6}>
              <FieldBox label="الأولوية">
                <Stack direction="row" flexWrap="wrap" gap="7px" sx={{ minHeight: 34, alignItems: "center" }}>
                  {PRIORITY_OPTIONS.map((p) => {
                    const active = activePriorities.includes(p.key);
                    return (
                      <Box
                        key={p.key}
                        onClick={() => handleTogglePriority(p.key)}
                        sx={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          px: "15px", py: "7px", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600, fontFamily: "'Cairo',sans-serif",
                          border: "0.5px solid", cursor: "pointer", transition: ".15s",
                          userSelect: "none",
                          bgcolor: active ? p.activeBg : p.bg,
                          color: active ? "#fff" : p.color,
                          borderColor: active ? p.activeBg : `${p.dot}40`,
                          "&:hover": { transform: "translateY(-1px)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
                        }}
                      >
                        <Box sx={{
                          width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                          bgcolor: active ? "#fff" : p.dot,
                        }} />
                        {p.label}
                      </Box>
                    );
                  })}
                </Stack>
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
