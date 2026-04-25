/**
 * Homix design tokens — indigo primary (#6366f1), aligned with MUI theme.
 * Use with MUI `theme` where possible; use these for one-off `sx` values.
 */
export const tokens = {
  brand: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryActive: "#4338ca",
    primaryMuted: "rgba(99, 102, 241, 0.12)",
  },
  surface: {
    app: "#f4f5f9",
    card: "#ffffff",
    cardMuted: "#f8fafc",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
  },
  text: {
    primary: "#111827",
    secondary: "#64748b",
    onPrimary: "#ffffff",
    disabled: "#94a3b8",
  },
  accent: {
    secondary: "#475569",
    info: "#6366f1",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadow: {
    card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.06)",
    cardHover: "0 2px 8px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.08)",
  },
};

export default tokens;
