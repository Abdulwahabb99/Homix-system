import React from "react";
import { Box } from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

/** يطابق كل الحالات الاثنتي عشرة في SHIPMENT_STATUS بالباك-إند (وألوان ShipmentDetails/constants.ts). */
const STATUS_CFG: Record<number, { label: string; bg: string; color: string }> = {
  1:  { label: "معلقة",             bg: HX.amberLight,  color: "#92400e" },
  2:  { label: "في المخزن",        bg: HX.blueLight,   color: "#1e40af" },
  3:  { label: "جاهزة للشحن",      bg: HX.tealLight,   color: "#0f766e" },
  4:  { label: "تم التسليم",       bg: HX.greenLight,  color: "#065f46" },
  5:  { label: "ملغية",             bg: HX.surface3,    color: HX.tx2 },
  6:  { label: "مرفوضة",           bg: HX.redLight,    color: "#991b1b" },
  7:  { label: "مسترجع من العميل", bg: HX.roseLight,   color: "#9f1239" },
  8:  { label: "مرتجع للمورد",     bg: HX.purpleLight, color: "#5b21b6" },
  9:  { label: "مستبدل",           bg: HX.accentLight, color: "#3730a3" },
  10: { label: "فشل في التوصيل",   bg: HX.redLight,    color: "#7f1d1d" },
  11: { label: "شحنة مجدولة",      bg: HX.blueLight,   color: "#1e40af" },
  12: { label: "خرجت للتوصيل",     bg: HX.tealLight,   color: "#0f766e" },
};

const TYPE_CFG: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "شحنة مجمعة",  bg: HX.purpleLight, color: "#5b21b6" },
  2: { label: "شحنة محافظات", bg: HX.blueLight,   color: "#1e40af" },
};

function PillBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        px: "8px",
        py: "2px",
        borderRadius: "100px",
        fontSize: "10.5px",
        fontWeight: 700,
        fontFamily: FONT,
        bgcolor: bg,
        color,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      <Box
        component="span"
        sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0, opacity: 0.8 }}
      />
      {label}
    </Box>
  );
}

export function ShipmentStatusBadge({ status, label }: { status: number; label?: string }) {
  const cfg = STATUS_CFG[status];
  if (!cfg && !label) return <span style={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>—</span>;
  return <PillBadge label={label ?? cfg.label} bg={cfg?.bg ?? HX.surface3} color={cfg?.color ?? HX.tx2} />;
}

export function ShipmentTypeBadge({ type }: { type: number }) {
  const cfg = TYPE_CFG[Number(type)];
  if (!cfg) return <span style={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>—</span>;
  return <PillBadge {...cfg} />;
}

export function PaymentStatusBadge({ status, label }: { status: number; label?: string }) {
  const isPaid = status === 2;
  const bg = isPaid ? HX.greenLight : HX.amberLight;
  const color = isPaid ? "#065f46" : "#92400e";
  const text = label ?? (isPaid ? "مدفوع" : "الدفع عند الاستلام");
  return <PillBadge label={text} bg={bg} color={color} />;
}

export function DaysInTransitBadge({ days }: { days: number | null }) {
  if (days === null || days === undefined) return <span style={{ color: HX.tx3 }}>—</span>;
  const bg = days <= 1 ? HX.greenLight : days <= 5 ? HX.amberLight : HX.redLight;
  const color = days <= 1 ? "#065f46" : days <= 5 ? "#92400e" : "#991b1b";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "8px",
        py: "2px",
        borderRadius: "100px",
        fontSize: "10.5px",
        fontWeight: 700,
        fontFamily: FONT,
        bgcolor: bg,
        color,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {days} يوم
    </Box>
  );
}
