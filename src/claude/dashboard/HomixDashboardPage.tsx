import React, { useEffect, useMemo } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate, useSearchParams } from "react-router-dom";
import "claude/dashboard/homixDashboard.css";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import KpiSection from "claude/dashboard/components/KpiSection";
import SalesChartCard from "claude/dashboard/components/SalesChartCard";
import ActivityFeedCard from "claude/dashboard/components/ActivityFeedCard";
import RecentOrdersTable from "claude/dashboard/components/RecentOrdersTable";
import TopSellersCard from "claude/dashboard/components/TopSellersCard";
import QuickActionsCard from "claude/dashboard/components/QuickActionsCard";
import CategoryDonutChart from "claude/dashboard/components/CategoryDonutChart";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { useDashboardCards } from "claude/dashboard/api/dashboardCards.api";
import { useDashboardSalesDistribution } from "claude/dashboard/api/dashboardSalesDistribution.api";
import HomixDashboardHeader from "claude/dashboard/components/HomixDashboardHeader";

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

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/* ── shared sx for MUI date TextField ── */
const DATE_FIELD_SX = {
  "& .MuiInputBase-root": {
    height: 36,
    borderRadius: "8px",
    fontFamily: "'Cairo',sans-serif",
    fontSize: "12.5px",
    bgcolor: HX.surface,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: HX.accent,
    boxShadow: `0 0 0 3px ${HX.accentLight}`,
  },
  "& .MuiInputLabel-root": {
    fontFamily: "'Cairo',sans-serif",
    fontSize: "12px",
  },
} as const;

/* ─────────────────────────────────────────── */

export default function HomixDashboardPage() {
  const navigate      = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const today = useMemo(() => toIsoDate(new Date()), []);

  /* ── dates driven by URL params — fallback to today ── */
  const startDate = searchParams.get("startDate") || today;
  const endDate   = searchParams.get("endDate")   || today;

  function setStartDate(val: string) {
    setSearchParams((prev) => { prev.set("startDate", val); return prev; }, { replace: true });
  }
  function setEndDate(val: string) {
    setSearchParams((prev) => { prev.set("endDate", val); return prev; }, { replace: true });
  }

  /* ── API ── */
  const { data: cardsData, isLoading: cardsLoading, isError: cardsError, error } =
    useDashboardCards(startDate, endDate);

  const { data: distData, isLoading: distLoading, isError: distError } =
    useDashboardSalesDistribution(startDate, endDate);

  useEffect(() => {
    console.log("[Dashboard Cards]", { cardsData, cardsLoading, cardsError, error });
  }, [cardsData, cardsLoading, cardsError, error]);

  return (
    <DashboardLayout
      header={
        <HomixDashboardHeader
          greeting={greeting}
          firstName={firstName}
          todayAr={todayAr}
          isVendor={isVendor}
          onAddOrder={() => navigate("/orders/add")}
        />
      }
    >
      <div className="homixDashPage">
        <div className="h-content">

          {/* ── Date range bar ── */}
          <Box sx={{ ...cardSx, p: "14px 16px", mb: "4px" }}>
            {/* header row */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              mb: "12px",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CalendarTodayIcon sx={{ fontSize: 15, color: HX.accent }} />
                <Typography sx={{
                  fontSize: "13px", fontWeight: 700,
                  color: HX.tx, fontFamily: "'Cairo',sans-serif",
                }}>
                  الفترة الزمنية
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                onClick={() => setSearchParams({ startDate: today, endDate: today }, { replace: true })}
                sx={{
                  fontFamily: "'Cairo',sans-serif", fontSize: "11.5px",
                  fontWeight: 600, borderRadius: "7px", height: 28, px: "10px",
                  color: HX.tx3,
                  "&:hover": { color: HX.accent, bgcolor: HX.accentLight },
                }}
              >
                إعادة تعيين
              </Button>
            </Box>

            {/* inputs row */}
            <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <TextField
                type="date"
                label="من تاريخ"
                size="small"
                value={startDate}
                inputProps={{ max: endDate }}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ flex: "1 1 160px", ...DATE_FIELD_SX }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                type="date"
                label="إلى تاريخ"
                size="small"
                value={endDate}
                inputProps={{ min: startDate, max: today }}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{ flex: "1 1 160px", ...DATE_FIELD_SX }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          <KpiSection cards={cardsData?.data?.cards} isLoading={cardsLoading} />
          <div className="h-grid-3-1">
            <SalesChartCard />
            <ActivityFeedCard startDate={startDate} endDate={endDate} />
          </div>
          <div className="h-grid-3-1">
            <RecentOrdersTable startDate={startDate} endDate={endDate} />
            <div className="h-right-col">
              <TopSellersCard startDate={startDate} endDate={endDate} />
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
            {/* <TargetsProgressCard /> */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
