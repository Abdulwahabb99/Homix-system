import React, { useMemo } from "react";
import "claude/dashboard/homixDashboard.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import KpiSection from "claude/dashboard/components/KpiSection";
import SalesChartCard from "claude/dashboard/components/SalesChartCard";
import ActivityFeedCard from "claude/dashboard/components/ActivityFeedCard";
import RecentOrdersTable from "claude/dashboard/components/RecentOrdersTable";
import TopSellersCard from "claude/dashboard/components/TopSellersCard";
import QuickActionsCard from "claude/dashboard/components/QuickActionsCard";
import CategoryDonutChart from "claude/dashboard/components/CategoryDonutChart";
import TargetsProgressCard from "claude/dashboard/components/TargetsProgressCard";

export default function HomixDashboardPage() {
  const isVendor = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.userType === "2";
    } catch {
      return false;
    }
  }, []);

  return (
    <DashboardLayout
      pageTitle="لوحة التحكم"
      pageSubtitle="نظرة شاملة على المبيعات والطلبات والنشاط اليومي"
    >
      <div className="homixDashPage">
        <div className="h-content">
          <KpiSection />
          <div className="h-grid-3-1">
            <SalesChartCard />
            <ActivityFeedCard />
          </div>
          <div className="h-grid-3-1">
            <RecentOrdersTable />
            <div className="h-right-col">
              <TopSellersCard />
              <QuickActionsCard isVendor={isVendor} />
            </div>
          </div>
          <div className="h-grid-2">
            <div className="h-card">
              <div className="h-card-head">
                <div>
                  <div className="h-card-title">توزيع المبيعات</div>
                  <div className="h-card-sub">حسب الفئة — هذا الشهر</div>
                </div>
                <button type="button" className="h-card-link">
                  تفاصيل ←
                </button>
              </div>
              <div className="h-card-body">
                <CategoryDonutChart />
              </div>
            </div>
            <TargetsProgressCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
