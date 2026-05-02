import React, { useState } from "react";
import SalesPerformanceChart from "claude/dashboard/components/SalesPerformanceChart";
import {
  getPeriodDates,
  useDashboardPerformance,
  type PeriodKey,
} from "claude/dashboard/api/dashboardPerformance.api";

/* ── helpers ── */
function fmt(val: number) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (val >= 1_000)     return (val / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(val));
}

function periodLabel(period: PeriodKey) {
  const { startDate, endDate } = getPeriodDates(period);
  const fmtD = (iso: string) =>
    new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long" }).format(
      new Date(iso + "T00:00:00")
    );
  return `${fmtD(startDate)} – ${fmtD(endDate)}`;
}

/* ── stat box ── */
function StatBox({
  val, label, sub, isLoading,
}: { val: React.ReactNode; label: string; sub?: string; isLoading?: boolean }) {
  return (
    <div className="h-sales-stat">
      <div className="h-sales-stat-val">
        {isLoading
          ? <span style={{ display: "inline-block", width: 70, height: 22, borderRadius: 5, background: "var(--surface2)" }} />
          : val}
      </div>
      <div className="h-sales-stat-lbl">{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ── component ── */
export default function SalesChartCard() {
  const [period, setPeriod] = useState<PeriodKey>("thisMonth");

  const { startDate, endDate } = getPeriodDates(period);

  const { data: perfData, isLoading, isError } = useDashboardPerformance(startDate, endDate);

  const summary = perfData?.data?.summary;
  const series  = perfData?.data?.series ?? [];

  /* total orders from series */
  const totalOrders = series.reduce((s, p) => s + p.orders, 0);

  const pct     = summary ? Math.abs(summary.changePercentage).toFixed(1) : null;
  const isUp    = summary?.trend === "up";
  const subLine = periodLabel(period);

  return (
    <div className="h-card">
      {/* ── header ── */}
      <div className="h-card-head">
        <div>
          <div className="h-card-title">أداء المبيعات</div>
          <div className="h-card-sub">{subLine}</div>
        </div>

        <div className="h-head-actions">
          <div className="h-chart-legend h-nowrap">
            <span className="i" style={{ background: "var(--accent)" }} />
            المبيعات
          </div>
          <div className="h-chart-legend h-nowrap">
            <span className="i" style={{ background: "var(--green)" }} />
            الطلبات
          </div>

          <select
            className="h-month-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            aria-label="الفترة"
          >
            <option value="thisMonth">هذا الشهر</option>
            <option value="lastMonth">الشهر الماضي</option>
          </select>
        </div>
      </div>

      {/* ── body ── */}
      <div className="h-card-body">
        <div className="h-sales-head-stats">
          <StatBox
            isLoading={isLoading}
            val={
              <>
                {summary ? fmt(summary.currentValue) : "—"}
                <span className="h-sales-stat-currency"> ج.م</span>
              </>
            }
            label={period === "thisMonth" ? "إجمالي هذا الشهر" : "إجمالي الشهر الماضي"}
          />

          <div className="h-sales-stat h-sales-stat-border">
            <StatBox
              isLoading={isLoading}
              val={totalOrders || "—"}
              label="طلب"
            />
          </div>

          <StatBox
            isLoading={isLoading}
            val={
              pct !== null ? (
                <span className={isUp ? "h-grow" : "h-drop"}>
                  {isUp ? "↑" : "↓"} {pct}%
                </span>
              ) : "—"
            }
            label="نمو مقارنة بالفترة السابقة"
          />
        </div>

        <SalesPerformanceChart series={series} isLoading={isLoading} isError={isError} />
      </div>
    </div>
  );
}
