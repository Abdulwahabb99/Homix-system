/**
 * Design tokens for the Homix Orders v2 redesign.
 * Extracted from homix_orders_v2.html CSS variables.
 */
export const HX = {
  accent: "#6366f1",
  accentLight: "rgba(99,102,241,0.10)",
  accentBorder: "rgba(99,102,241,0.25)",

  green: "#10b981",
  greenLight: "rgba(16,185,129,0.10)",

  red: "#ef4444",
  redLight: "rgba(239,68,68,0.10)",

  amber: "#f59e0b",
  amberLight: "rgba(245,158,11,0.10)",

  blue: "#3b82f6",
  blueLight: "rgba(59,130,246,0.10)",

  purple: "#8b5cf6",
  purpleLight: "rgba(139,92,246,0.10)",

  teal: "#14b8a6",
  tealLight: "rgba(20,184,166,0.10)",

  rose: "#f43f5e",
  roseLight: "rgba(244,63,94,0.10)",

  bg: "#f4f5f9",
  surface: "#ffffff",
  surface2: "#f9fafb",
  surface3: "#f1f3f8",

  border: "rgba(0,0,0,0.07)",
  border2: "rgba(0,0,0,0.13)",

  tx: "#111827",
  tx2: "#6b7280",
  tx3: "#9ca3af",

  r: "13px",
} as const;

/** Shared card sx used across the page */
export const cardSx = {
  bgcolor: HX.surface,
  border: `0.5px solid ${HX.border}`,
  borderRadius: HX.r,
  overflow: "hidden",
} as const;
