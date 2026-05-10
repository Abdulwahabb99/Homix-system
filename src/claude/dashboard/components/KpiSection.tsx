import React from "react";
import { KpiIcon } from "claude/dashboard/components/KpiIcons";
import type { DashboardCard } from "claude/dashboard/api/dashboardCards.api";
import { formatMoneyCompact } from "shared/formatMoney";

/* ── map API key → icon + colors ── */
const KEY_META: Record<string, {
  icon:    "revenue" | "orders" | "clock" | "users";
  iconBg:  string;
  iconClr: string;
  bar:     string;
}> = {
  totalSales: {
    icon:    "revenue",
    iconBg:  "var(--accent-light)",
    iconClr: "var(--accent)",
    bar:     "linear-gradient(90deg, var(--accent), #8b5cf6)",
  },
  totalOrders: {
    icon:    "orders",
    iconBg:  "var(--green-light)",
    iconClr: "var(--green)",
    bar:     "linear-gradient(90deg, var(--green), #34d399)",
  },
  pendingOrders: {
    icon:    "clock",
    iconBg:  "var(--amber-light)",
    iconClr: "var(--amber)",
    bar:     "linear-gradient(90deg, var(--amber), #fbbf24)",
  },
  activeMakers: {
    icon:    "users",
    iconBg:  "var(--gold-light)",
    iconClr: "var(--gold)",
    bar:     "linear-gradient(90deg, var(--gold), #fbbf24)",
  },
};

/* ── number formatter ── */
function fmt(val: number): string {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (val >= 1_000)     return (val / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(val));
}

/* ── skeleton card (while loading) ── */
function KpiSkeleton() {
  return (
    <div className="h-kpi" style={{ opacity: 0.55 }}>
      <div className="h-kpi-top">
        <div className="h-kpi-icon" style={{ background: "var(--surface2)" }} />
      </div>
      <div className="h-kpi-val" style={{ background: "var(--surface2)", borderRadius: 6, height: 28, width: 70 }} />
      <div className="h-kpi-label" style={{ background: "var(--surface2)", borderRadius: 4, height: 14, width: 110, marginTop: 6 }} />
      <div className="h-kpi-bar" style={{ background: "var(--surface2)" }} />
    </div>
  );
}

/* ── props ── */
interface KpiSectionProps {
  cards?:     DashboardCard[];
  isLoading?: boolean;
}

export default function KpiSection({ cards, isLoading }: KpiSectionProps) {
  if (isLoading || !cards) {
    return (
      <div className="h-kpi-row">
        {[0, 1, 2, 3].map((i) => <KpiSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="h-kpi-row">
      {cards.map((card) => {
        const meta = KEY_META[card.key] ?? {
          icon:    "orders" as const,
          iconBg:  "var(--accent-light)",
          iconClr: "var(--accent)",
          bar:     "linear-gradient(90deg, var(--accent), #8b5cf6)",
        };
        const isUp   = card.trend === "up";
        const pct    = Math.abs(card.changePercentage ?? 0).toFixed(1);

        return (
          <div className="h-kpi" key={card.key}>
            <div className="h-kpi-top">
              <KpiIcon
                name={meta.icon}
                style={{ background: meta.iconBg, color: meta.iconClr }}
              />
              <div className="h-kpi-menu" aria-hidden>···</div>
            </div>

            <div className="h-kpi-val">
              {card.key === "totalSales" ? formatMoneyCompact(card.currentValue) : fmt(card.currentValue)}
            </div>
            <div className="h-kpi-label">{card.label}</div>

            <div className={`h-kpi-change h-${isUp ? "up" : "down"}`}>
              <span className="h-arrow">{isUp ? "↑" : "↓"}</span>
              {pct}%
              <span className="h-muted">{card.comparisonLabel}</span>
            </div>

            <div className="h-kpi-bar" style={{ background: meta.bar }} />
          </div>
        );
      })}
    </div>
  );
}
