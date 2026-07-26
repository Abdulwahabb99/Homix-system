import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { orderStatusValues, deliveryStatusValues, paymentStatusValues } from "layouts/Orders/utils/constants";

type BadgeSx = {
  bg: string;
  color: string;
  dot?: string;
};

const bdgBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "3px",
  px: "9px",
  py: "3px",
  borderRadius: "20px",
  fontSize: "10.5px",
  fontWeight: 700,
  whiteSpace: "nowrap",
  lineHeight: 1.4,
  "&::before": {
    content: '""',
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    flexShrink: 0,
  },
};

function Bdg({ bg, color, dot, label }: BadgeSx & { label: string }) {
  return (
    <Box
      component="span"
      sx={{
        ...bdgBase,
        bgcolor: bg,
        color,
        "&::before": { ...bdgBase["&::before"], bgcolor: dot ?? color },
      }}
    >
      {label}
    </Box>
  );
}

/* ─── ORDER STATUS ─── */
const orderStatusConfig: Record<number, BadgeSx> = {
  1: { bg: HX.amberLight, color: "#92400e", dot: HX.amber },           // معلق
  2: { bg: HX.purpleLight, color: "#5b21b6", dot: HX.purple },         // قيد التصنيع
  3: { bg: HX.blueLight, color: "#1e40af", dot: HX.blue },             // مؤكد
  4: { bg: "rgba(100,100,100,0.10)", color: "#374151", dot: "#9ca3af" }, // ملغي
  5: { bg: HX.greenLight, color: "#065f46", dot: HX.green },           // تم التسليم
  6: { bg: HX.roseLight, color: "#9f1239", dot: HX.rose },             // مسترجع
  7: { bg: HX.accentLight, color: "#3730a3", dot: HX.accent },         // مستبدل
  8: { bg: HX.tealLight, color: "#0f766e", dot: HX.teal },             // في المخزن
};

export function OrderStatusBadge({ status }: { status: number | null | undefined }) {
  const s = Number(status);
  const cfg = orderStatusConfig[s] ?? { bg: "rgba(100,100,100,0.10)", color: "#374151", dot: "#9ca3af" };
  const label = (orderStatusValues[s] ?? "—").trim();
  return <Bdg {...cfg} label={label} />;
}

/* ─── DELIVERY / MANUFACTURING STATUS ─── */
const deliveryStatusConfig: Record<number, BadgeSx> = {
  1: { bg: HX.greenLight, color: "#065f46", dot: HX.green },   // في مدة التصنيع
  2: { bg: HX.amberLight, color: "#92400e", dot: HX.amber },   // أوشك على التأخير
  3: { bg: HX.redLight, color: "#991b1b", dot: HX.red },       // متأخر
};

export function DeliveryStatusBadge({ status }: { status: number | null | undefined }) {
  const s = Number(status);
  const cfg = deliveryStatusConfig[s] ?? { bg: "rgba(100,100,100,0.10)", color: "#374151", dot: "#9ca3af" };
  const label = (deliveryStatusValues[s] ?? "—").trim();
  if (!s) return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>;
  return <Bdg {...cfg} label={label} />;
}

/* ─── PAYMENT STATUS ─── */
export function PaymentBadge({ status }: { status: number | null | undefined }) {
  const s = Number(status);
  const label = (paymentStatusValues[s] ?? "—").trim();
  if (!s) return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>;
  const cfg: BadgeSx =
    s === 2
      ? { bg: HX.greenLight, color: "#065f46", dot: HX.green }
      : { bg: HX.amberLight, color: "#92400e", dot: HX.amber };
  return <Bdg {...cfg} label={label} />;
}

/* ─── PRIORITY BADGE (visual placeholder — no API field) ─── */
export type PriorityLevel = "very-urgent" | "urgent" | "normal";

const priorityConfig: Record<PriorityLevel, BadgeSx & { label: string }> = {
  "very-urgent": { bg: HX.redLight, color: "#991b1b", dot: HX.red, label: "مستعجل جداً" },
  urgent: { bg: HX.amberLight, color: "#92400e", dot: HX.amber, label: "مستعجل" },
  normal: { bg: HX.greenLight, color: "#065f46", dot: HX.green, label: "بالمدة" },
};

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  const cfg = priorityConfig[level] ?? priorityConfig.normal;
  return <Bdg {...cfg} label={cfg.label} />;
}

/* ─── PRIORITY VALUE BADGE (من الـ API: 1 بالمدة، 2 مستعجل، 3 مستعجل جداً) ─── */
const priorityValueConfig: Record<number, BadgeSx> = {
  1: { bg: HX.greenLight, color: "#065f46", dot: HX.green },   // بالمدة
  2: { bg: HX.amberLight, color: "#92400e", dot: HX.amber },   // مستعجل
  3: { bg: HX.redLight, color: "#991b1b", dot: HX.red },       // مستعجل جداً
};
const priorityValueLabels: Record<number, string> = {
  1: "بالمدة",
  2: "مستعجل",
  3: "مستعجل جداً",
};

export function PriorityValueBadge({
  priority,
  label,
}: {
  priority: number | null | undefined;
  label?: string | null;
}) {
  const s = Number(priority);
  const text = (label && label.trim()) || priorityValueLabels[s] || "";
  if (!s && !text) return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>;
  const cfg = priorityValueConfig[s] ?? { bg: "rgba(100,100,100,0.10)", color: "#374151", dot: "#9ca3af" };
  return <Bdg {...cfg} label={text || "—"} />;
}

/* ─── ORDER SOURCE BADGE (النص جاهز من الـ API عبر orderSourceLabel) ─── */
export function OrderSourceBadge({ label }: { label?: string | null }) {
  const text = (label && label.trim()) || "";
  if (!text) return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        px: "9px", py: "3px", borderRadius: "20px",
        fontSize: "10.5px", fontWeight: 700,
        bgcolor: HX.surface2, color: HX.tx2,
        border: `0.5px solid ${HX.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </Box>
  );
}

/* ─── DAYS COUNTER BADGE ─── */
export function DaysCounterBadge({ days, active }: { days: string | number | null | undefined; active: boolean }) {
  if (!active) {
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          px: "9px", py: "3px", borderRadius: "20px",
          fontSize: "10.5px", fontWeight: 600,
          bgcolor: HX.surface2, color: HX.tx3,
          border: `0.5px solid ${HX.border}`,
        }}
      >
        —
      </Box>
    );
  }
  const d = typeof days === "string" ? parseInt(days) : (days ?? 0);
  const isNum = !isNaN(d as number);
  let bg: string = HX.greenLight, color = "#065f46";
  if (isNum && (d as number) > 12) { bg = HX.redLight; color = "#991b1b"; }
  else if (isNum && (d as number) > 7) { bg = HX.amberLight; color = "#92400e"; }
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        px: "9px", py: "3px", borderRadius: "20px",
        fontSize: "10.5px", fontWeight: 700, bgcolor: bg, color,
      }}
    >
      {days || "0"} يوم
    </Box>
  );
}

/* ─── DELIVERY BY BADGE ─── */
/**
 * «التوصيل بواسطة» — النص من `deliveryByLabel` كما يرده الـ API. الـ boolean
 * يُستخدم للّون فقط (ويبقى بديلاً للنص إن لم تُرسل التسمية).
 */
export function DeliveryByBadge({
  fromInventory,
  label,
}: {
  fromInventory: boolean | null | undefined;
  label?: string | null;
}) {
  const text = (label ?? "").trim();
  if (!text && (fromInventory === null || fromInventory === undefined)) {
    return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>;
  }
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        fontSize: "12px", color: fromInventory ? HX.blue : HX.green,
        fontWeight: 500,
      }}
    >
      {text || (fromInventory ? "المخزن" : "البائع")}
    </Box>
  );
}

/* ─── FINE BADGE ─── */
export function FineBadge({ amount }: { amount: number | null | undefined }) {
  if (!amount) return <Box component="span" sx={{ color: HX.tx3, fontSize: "11.5px" }}>—</Box>;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        px: "10px", py: "3px", borderRadius: "20px",
        fontSize: "11px", fontWeight: 700,
        bgcolor: HX.redLight, color: HX.red,
      }}
    >
      {Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ج.م
    </Box>
  );
}
