import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "claude/dashboard/homixDashboard.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import KpiSection from "claude/dashboard/components/KpiSection";
import SalesChartCard from "claude/dashboard/components/SalesChartCard";
import ActivityFeedCard from "claude/dashboard/components/ActivityFeedCard";
import RecentOrdersTable from "claude/dashboard/components/RecentOrdersTable";
import TopSellersCard from "claude/dashboard/components/TopSellersCard";
import QuickActionsCard from "claude/dashboard/components/QuickActionsCard";
import CategoryDonutChart from "claude/dashboard/components/CategoryDonutChart";
import { useDashboardCards } from "claude/dashboard/api/dashboardCards.api";
import { useDashboardSalesDistribution } from "claude/dashboard/api/dashboardSalesDistribution.api";
import HomixDashboardHeader from "claude/dashboard/components/HomixDashboardHeader";
import { useDateRange } from "hooks/useDateRange";

/* ── helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "صباح الخير";
  if (h >= 12 && h < 18) return "مساء الخير";
  return "مساء النور";
}

function getArabicDate() {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/** Convert a moment object or DD-MM-YYYY string to YYYY-MM-DD for the API, fallback to today */
function toApiDate(d: any): string {
  if (!d) return moment().format("YYYY-MM-DD");
  return moment.isMoment(d)
    ? d.format("YYYY-MM-DD")
    : moment(d, "DD-MM-YYYY").format("YYYY-MM-DD");
}

/** Convert a moment object or DD-MM-YYYY string to DD-MM-YYYY for DateRangePickerWrapper */
function toPickerStr(d: any): string {
  if (!d) return "";
  return moment.isMoment(d) ? d.format("DD-MM-YYYY") : String(d);
}

/* ─────────────────────────────────────────── */

export default function HomixDashboardPage() {
  const navigate = useNavigate();

  const { isVendor, firstName } = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return { isVendor: u?.userType === "2", firstName: u?.firstName ?? "" };
    } catch {
      return { isVendor: false, firstName: "" };
    }
  }, []);

  const greeting = useMemo(getGreeting, []);
  const todayAr  = useMemo(getArabicDate, []);

  /* ── date range — same hook as Orders page ── */
  const {
    startDate,
    endDate,
    handleDatesChange,
    handleReset: handleDateReset,
  } = useDateRange({ defaultDays: 0, queryParams: true });

  /* ISO strings for API calls (fallback to today if empty) */
  const apiStartDate = toApiDate(startDate);
  const apiEndDate   = toApiDate(endDate);

  /* DD-MM-YYYY strings for DateRangePickerWrapper — default to today if no range selected */
  const todayDMY    = moment().format("DD-MM-YYYY");
  const pickerStart = toPickerStr(startDate) || todayDMY;
  const pickerEnd   = toPickerStr(endDate)   || todayDMY;

  /* ── API ── */
  const { data: cardsData, isLoading: cardsLoading, isError: cardsError } =
    useDashboardCards(apiStartDate, apiEndDate);

  const { data: distData, isLoading: distLoading, isError: distError } =
    useDashboardSalesDistribution(apiStartDate, apiEndDate);

  return (
    <DashboardLayout
      header={
        <HomixDashboardHeader
          greeting={greeting}
          firstName={firstName}
          isVendor={isVendor}
          onAddOrder={() => navigate("/orders/add")}
          pickerStart={pickerStart}
          pickerEnd={pickerEnd}
          onDatesChange={handleDatesChange}
          onDateReset={handleDateReset}
          todayAr={todayAr}
        />
      }
    >
      <div className="homixDashPage">
        <div className="h-content">
          <KpiSection cards={cardsData?.data?.cards} isLoading={cardsLoading} />
          <div className="h-grid-3-1">
            <SalesChartCard startDate={apiStartDate} endDate={apiEndDate} />
            <ActivityFeedCard startDate={apiStartDate} endDate={apiEndDate} />
          </div>
          <div className="h-grid-3-1">
            <RecentOrdersTable startDate={apiStartDate} endDate={apiEndDate} />
            <div className="h-right-col">
              <TopSellersCard startDate={apiStartDate} endDate={apiEndDate} />
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
              </div>
              <div className="h-card-body">
                <CategoryDonutChart
                  items={distData?.data?.items}
                  isLoading={distLoading}
                  isError={distError}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
