import React, { useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
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
import { HX } from "layouts/Orders/ordersHomixTheme";

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

export default function HomixDashboardPage() {
  const navigate = useNavigate();

  const { isVendor, firstName } = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        isVendor: u?.userType === "2",
        firstName: u?.firstName ?? "",
      };
    } catch {
      return { isVendor: false, firstName: "" };
    }
  }, []);

  const greeting = useMemo(getGreeting, []);
  const todayAr = useMemo(getArabicDate, []);

  const pageTitle = (
    <Box>
      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: 800,
          color: HX.tx,
          fontFamily: "'Cairo',sans-serif",
          lineHeight: 1.3,
        }}
      >
        {greeting}، {firstName}
      </Typography>
    </Box>
  );

  const pageActions = (
    <>
      <Typography
        sx={{
          fontSize: "12.5px",
          fontWeight: 600,
          color: HX.tx2,
          fontFamily: "'Cairo',sans-serif",
          display: { xs: "none", sm: "block" },
        }}
      >
        {todayAr}
      </Typography>

      {!isVendor && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: "15px !important" }} />}
          onClick={() => navigate("/orders/add")}
          sx={{
            fontFamily: "'Cairo',sans-serif",
            fontWeight: 700,
            fontSize: "12.5px",
            borderRadius: "9px",
            px: "14px",
            py: "7px",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          طلب جديد
        </Button>
      )}
    </>
  );

  return (
    <DashboardLayout
      pageTitle={pageTitle}
      pageSubtitle="إليك ملخص أداء اليوم"
      pageActions={pageActions}
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
