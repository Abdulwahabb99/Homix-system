import React from "react";
import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  TICKET_TYPE_COLOR,
  DEFAULT_TYPE_COLOR,
  getDayCounterVariant,
} from "layouts/Tickets/utils/constants";

// ─── حالة التذكرة (مفتوحة / مغلقة) ───────────────────────────────────────────

type TicketStatusChipProps = { status: "مفتوحة" | "مغلقة"; size?: "small" | "medium" };

export function TicketStatusChip({ status, size = "small" }: TicketStatusChipProps) {
  const isOpen = status === "مفتوحة";
  const dotOpen = "#d97706";
  const dotClosed = "#059669";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        px: "9px",
        py: "3px",
        borderRadius: "20px",
        fontSize: size === "small" ? "0.72rem" : "0.8rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        bgcolor: isOpen ? "rgba(245,158,11,0.14)" : "rgba(16,185,129,0.14)",
        color: isOpen ? "#78350f" : "#064e3b",
        border: `1px solid ${isOpen ? alpha(dotOpen, 0.45) : alpha(dotClosed, 0.45)}`,
        "& .dot": {
          display: "inline-block",
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: isOpen ? dotOpen : dotClosed,
          flexShrink: 0,
        },
      }}
    >
      <span className="dot" />
      {status}
    </Box>
  );
}

// ─── نوع التذكرة ──────────────────────────────────────────────────────────────

type TicketTypeChipProps = { type: string; size?: "small" | "medium"; allowWrap?: boolean };

export function TicketTypeChip({ type, size = "small", allowWrap = false }: TicketTypeChipProps) {
  const key = type.trim();
  const colors = TICKET_TYPE_COLOR[key] ?? DEFAULT_TYPE_COLOR;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        px: "9px",
        py: "3px",
        borderRadius: "20px",
        fontSize: size === "small" ? "0.72rem" : "0.8rem",
        fontWeight: 700,
        whiteSpace: allowWrap ? "normal" : "nowrap",
        flexWrap: allowWrap ? "wrap" : "nowrap",
        maxWidth: allowWrap ? "100%" : undefined,
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${alpha(colors.dot, 0.42)}`,
        "& .dot": {
          display: "inline-block",
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: colors.dot,
          flexShrink: 0,
        },
      }}
    >
      <span className="dot" />
      {type}
    </Box>
  );
}

// ─── عداد الأيام ──────────────────────────────────────────────────────────────

type DayCounterProps = { days: number; isOpen: boolean };

const DAY_VARIANT_STYLES = {
  ok: { bg: "rgba(16,185,129,0.14)", color: "#047857", border: "rgba(5,150,105,0.45)" },
  warn: { bg: "rgba(245,158,11,0.14)", color: "#78350f", border: "rgba(217,119,6,0.45)" },
  danger: { bg: "rgba(239,68,68,0.14)", color: "#991b1b", border: "rgba(220,38,38,0.45)" },
  closed: { bg: "rgba(55,65,81,0.08)", color: "#374151", border: "rgba(75,85,99,0.35)" },
};

export function DayCounter({ days, isOpen }: DayCounterProps) {
  const variant = getDayCounterVariant(days, isOpen);
  const { bg, color, border } = DAY_VARIANT_STYLES[variant];
  const label = variant === "closed" ? "مغلق" : `⏱ ${days} يوم`;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        px: "8px",
        py: "3px",
        borderRadius: "6px",
        fontSize: "0.72rem",
        fontWeight: 700,
        bgcolor: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}
