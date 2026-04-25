import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { donutCategories } from "claude/dashboard/data/dashboardData";

export default function CategoryDonutChart() {
  const data = donutCategories;

  return (
    <div className="h-donut-wrap">
      <div className="h-donut-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
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
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="h-donut-center">
          <div className="h-donut-center-val">847K</div>
          <div className="h-donut-center-lbl">إجمالي</div>
        </div>
      </div>
      <div className="h-donut-legend">
        {donutCategories.map((c) => (
          <div className="h-dleg" key={c.name}>
            <div className="h-dleg-dot" style={{ background: c.color }} />
            <div className="h-dleg-info">
              <div className="h-dleg-name">{c.name}</div>
              <div className="h-dleg-val">{c.sub}</div>
            </div>
            <div className="h-dleg-pct">{c.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
