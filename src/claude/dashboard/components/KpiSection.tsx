import React from "react";
import { kpiItems } from "claude/dashboard/data/dashboardData";
import { KpiIcon } from "claude/dashboard/components/KpiIcons";

const iconStyles: Record<string, React.CSSProperties> = {
  revenue: { background: "var(--accent-light)", color: "var(--accent)" },
  orders: { background: "var(--green-light)", color: "var(--green)" },
  clock: { background: "var(--amber-light)", color: "var(--amber)" },
  users: { background: "var(--gold-light)", color: "var(--gold)" },
};

export default function KpiSection() {
  return (
    <div className="h-kpi-row">
      {kpiItems.map((k) => (
        <div className="h-kpi" key={k.label}>
          <div className="h-kpi-top">
            <KpiIcon name={k.icon} style={iconStyles[k.icon]} />
            <div className="h-kpi-menu" aria-hidden>
              ···
            </div>
          </div>
          <div className="h-kpi-val">{k.value}</div>
          <div className="h-kpi-label">{k.label}</div>
          <div className={`h-kpi-change h-${k.change.dir}`}>
            <span className="h-arrow">↑</span>
            {k.change.text1}
            <span className="h-muted">{k.change.text2}</span>
          </div>
          <div className="h-kpi-bar" style={{ background: k.bar }} />
        </div>
      ))}
    </div>
  );
}
