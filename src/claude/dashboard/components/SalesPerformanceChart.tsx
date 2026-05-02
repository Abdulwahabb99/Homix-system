import React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerformancePoint } from "claude/dashboard/api/dashboardPerformance.api";

/* ── format "2026-05-01" → "1 مايو" ── */
function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
  }).format(d);
}

/* ── skeleton bars while loading ── */
function ChartSkeleton() {
  return (
    <div className="h-chart-area" style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "0 8px" }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${30 + Math.sin(i * 0.9) * 40 + 40}px`,
            borderRadius: 6,
            background: "var(--surface2)",
            animation: "pulse 1.5s ease-in-out infinite",
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

/* ── empty / error placeholder ── */
function ChartPlaceholder({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="h-chart-area" style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 8, color: "var(--text3)",
    }}>
      <span style={{ fontSize: 36, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", fontFamily: "Cairo, sans-serif" }}>{title}</span>
      <span style={{ fontSize: 11, fontFamily: "Cairo, sans-serif" }}>{sub}</span>
    </div>
  );
}

/* ── props ── */
interface SalesPerformanceChartProps {
  series?:    PerformancePoint[];
  isLoading?: boolean;
  isError?:   boolean;
}

export default function SalesPerformanceChart({ series, isLoading, isError }: SalesPerformanceChartProps) {
  if (isLoading) return <ChartSkeleton />;

  if (isError) return (
    <ChartPlaceholder
      icon="⚠️"
      title="تعذّر تحميل البيانات"
      sub="تحقق من الاتصال أو حاول مرة أخرى"
    />
  );

  if (!series || series.length === 0) return (
    <ChartPlaceholder
      icon="📊"
      title="لا توجد بيانات"
      sub="لا توجد مبيعات في هذه الفترة"
    />
  );

  const chartData = (series ?? []).map((p) => ({
    ...p,
    dateLabel: fmtDate(p.date),
  }));

  return (
    <div className="h-chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="homixAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#f0f0f0" vertical={false} />

          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 9, fill: "#9ca3af", fontFamily: "Cairo, sans-serif" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            height={28}
          />

          <YAxis yAxisId="sales"  orientation="right" hide />
          <YAxis yAxisId="orders" orientation="left"  hide />

          <Tooltip
            contentStyle={{
              fontFamily: "Cairo, Noto Sans Arabic, sans-serif",
              fontSize: 12,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
            }}
            labelStyle={{ fontWeight: 700 }}
            formatter={(v: number, name: string) => {
              if (name === "sales")  return [`${Number(v).toLocaleString("ar-EG-u-nu-latn")} ج.م`, "المبيعات"];
              if (name === "orders") return [`${v}`, "الطلبات"];
              return [v, name];
            }}
          />

          <Area
            yAxisId="sales"
            type="monotone"
            dataKey="sales"
            stroke="none"
            fill="url(#homixAreaGrad)"
            isAnimationActive
          />
          <Line
            yAxisId="sales"
            type="monotone"
            dataKey="sales"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#fff", stroke: "#6366f1", strokeWidth: 2.5 }}
            activeDot={{ r: 5 }}
            isAnimationActive
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
