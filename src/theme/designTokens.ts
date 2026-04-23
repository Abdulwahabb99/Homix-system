/**
 * Homix design tokens — primary brand #063146, fintech-style palette.
 * Use with MUI `theme` where possible; use these for one-off `sx` values.
 */
export const tokens = {
  brand: {
    primary: "#063146",
    primaryHover: "#0a4a66",
    primaryActive: "#042433",
    primaryMuted: "rgba(6, 49, 70, 0.08)",
  },
  surface: {
    app: "#f4f6f8",
    card: "#ffffff",
    cardMuted: "#f8fafc",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    onPrimary: "#ffffff",
    disabled: "#94a3b8",
  },
  accent: {
    secondary: "#475569",
    info: "#0ea5e9",
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
