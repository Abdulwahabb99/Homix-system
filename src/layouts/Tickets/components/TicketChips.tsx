import React from "react";
import { Box } from "@mui/material";
import {
  TICKET_TYPE_COLOR,
  DEFAULT_TYPE_COLOR,
  getDayCounterVariant,
} from "layouts/Tickets/utils/constants";

// ─── حالة التذكرة (مفتوحة / مغلقة) ───────────────────────────────────────────

type TicketStatusChipProps = { status: "مفتوحة" | "مغلقة"; size?: "small" | "medium" };

export function TicketStatusChip({ status, size = "small" }: TicketStatusChipProps) {
  const isOpen = status === "مفتوحة";
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
        bgcolor: isOpen ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
        color: isOpen ? "#92400e" : "#065f46",
        border: `1px solid ${isOpen ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
        "& .dot": {
          display: "inline-block",
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: isOpen ? "#f59e0b" : "#10b981",
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

type TicketTypeChipProps = { type: string; size?: "small" | "medium" };

export function TicketTypeChip({ type, size = "small" }: TicketTypeChipProps) {
  const colors = TICKET_TYPE_COLOR[type] ?? DEFAULT_TYPE_COLOR;
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
        bgcolor: colors.bg,
        color: colors.color,
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
  ok: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  warn: { bg: "rgba(245,158,11,0.12)", color: "#92400e" },
  danger: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  closed: { bg: "rgba(0,0,0,0.05)", color: "#9ca3af" },
};

export function DayCounter({ days, isOpen }: DayCounterProps) {
  const variant = getDayCounterVariant(days, isOpen);
  const { bg, color } = DAY_VARIANT_STYLES[variant];
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
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}
