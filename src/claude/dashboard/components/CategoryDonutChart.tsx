import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { SalesDistributionItem } from "claude/dashboard/api/dashboardSalesDistribution.api";

/* ── helpers ── */
function fmt(val: number) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (val >= 1_000)     return (val / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(val));
}

/* ── skeleton ── */
function DonutSkeleton() {
  return (
    <div className="h-donut-wrap">
      <div className="h-donut-chart-wrap" style={{ opacity: 0.4 }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: "conic-gradient(var(--surface2) 0deg 360deg)",
        }} />
      </div>
      <div className="h-donut-legend">
        {[70, 55, 60, 50].map((w, i) => (
          <div className="h-dleg" key={i}>
            <div className="h-dleg-dot" style={{ background: "var(--surface2)" }} />
            <div className="h-dleg-info">
              <div style={{ height: 11, borderRadius: 3, background: "var(--surface2)", width: w }} />
              <div style={{ height: 10, borderRadius: 3, background: "var(--surface2)", width: 45, marginTop: 4 }} />
            </div>
            <div style={{ height: 12, borderRadius: 3, background: "var(--surface2)", width: 28 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── placeholder ── */
function DonutPlaceholder({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, padding: "32px 0", color: "var(--text3)",
    }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fontWeight: 700, color: "var(--text2)" }}>
        {title}
      </span>
    </div>
  );
}

/* ── props ── */
interface CategoryDonutChartProps {
  items?:     SalesDistributionItem[];
  isLoading?: boolean;
  isError?:   boolean;
}

export default function CategoryDonutChart({ items, isLoading, isError }: CategoryDonutChartProps) {
  if (isLoading) return <DonutSkeleton />;
  if (isError)   return <DonutPlaceholder icon="⚠️" title="تعذّر تحميل البيانات" />;
  if (!items || items.length === 0) return <DonutPlaceholder icon="📊" title="لا توجد بيانات" />;

  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="h-donut-wrap">
      <div className="h-donut-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={50}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
            >
              {items.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="h-donut-center">
          <div className="h-donut-center-val">{fmt(total)}</div>
          <div className="h-donut-center-lbl">إجمالي</div>
        </div>
      </div>

      <div className="h-donut-legend">
        {items.map((c) => (
          <div className="h-dleg" key={c.label}>
            <div className="h-dleg-dot" style={{ background: c.color }} />
            <div className="h-dleg-info">
              <div className="h-dleg-name">{c.label}</div>
              <div className="h-dleg-val">{fmt(c.value)} ج.م</div>
            </div>
            <div className="h-dleg-pct">{c.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
