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
import { salesChartData } from "claude/dashboard/data/dashboardData";

export default function SalesPerformanceChart() {
  return (
    <div className="h-chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={salesChartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="homixAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            height={28}
          />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            contentStyle={{
              fontFamily: "Cairo, Noto Sans Arabic, sans-serif",
              fontSize: 12,
              borderRadius: 8,
              border: "0.5px solid rgba(0,0,0,0.07)",
            }}
            labelStyle={{ fontWeight: 700 }}
            formatter={(v: number, name: string) => {
              if (name === "sales") return [`${v}`, "المبيعات"];
              if (name === "orders") return [`${v}`, "الطلبات"];
              return [v, name];
            }}
          />
          <Area type="monotone" dataKey="sales" stroke="none" fill="url(#homixAreaGrad)" isAnimationActive />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#fff", stroke: "#6366f1", strokeWidth: 2.5 }}
            activeDot={{ r: 5 }}
            isAnimationActive
          />
          <Line
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
