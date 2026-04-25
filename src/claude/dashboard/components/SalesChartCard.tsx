import React from "react";
import moment from "moment";
import "moment/locale/ar";
import SalesPerformanceChart from "claude/dashboard/components/SalesPerformanceChart";

export default function SalesChartCard() {
  moment.locale("ar");
  const month = moment().format("MMMM YYYY");

  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">أداء المبيعات</div>
          <div className="h-card-sub">المبيعات اليومية — {month}</div>
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
          <select className="h-month-select" defaultValue="month" aria-label="الفترة">
            <option value="month">هذا الشهر</option>
            <option value="last">الشهر الماضي</option>
          </select>
        </div>
      </div>
      <div className="h-card-body">
        <div className="h-sales-head-stats">
          <div className="h-sales-stat">
            <div className="h-sales-stat-val">
              847,320 <span className="h-sales-stat-currency">ج.م</span>
            </div>
            <div className="h-sales-stat-lbl">إجمالي هذا الشهر</div>
          </div>
          <div className="h-sales-stat h-sales-stat-border">
            <div className="h-sales-stat-val">720</div>
            <div className="h-sales-stat-lbl">طلب</div>
          </div>
          <div className="h-sales-stat">
            <div className="h-sales-stat-val h-grow">↑ 12.4%</div>
            <div className="h-sales-stat-lbl">نمو شهري</div>
          </div>
        </div>
        <SalesPerformanceChart />
      </div>
    </div>
  );
}
