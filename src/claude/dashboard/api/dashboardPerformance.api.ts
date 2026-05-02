import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

/* ── types ── */
export interface PerformanceSummary {
  key:              string;
  label:            string;
  currentValue:     number;
  previousValue:    number;
  comparisonLabel:  string;
  changePercentage: number;
  trend:            "up" | "down" | "neutral";
}

export interface PerformancePoint {
  date:   string; // "2026-05-01"
  orders: number;
  sales:  number;
}

export interface DashboardPerformanceData {
  role:      string;
  startDate: string;
  endDate:   string;
  summary:   PerformanceSummary;
  series:    PerformancePoint[];
}

export interface DashboardPerformanceResponse {
  status: boolean;
  data:   DashboardPerformanceData;
}

/* ── period helpers ── */
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export type PeriodKey = "thisMonth" | "lastMonth";

export function getPeriodDates(period: PeriodKey): { startDate: string; endDate: string } {
  const now = new Date();

  if (period === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toIso(start), endDate: toIso(now) };
  }

  // lastMonth
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastOfLastMonth  = new Date(now.getFullYear(), now.getMonth(), 0); // day 0 = last day of prev month
  return { startDate: toIso(firstOfLastMonth), endDate: toIso(lastOfLastMonth) };
}

/* ── query key ── */
export const performanceKeys = {
  all: () => ["dashboard", "performance"] as const,
  byRange: (startDate: string, endDate: string) =>
    ["dashboard", "performance", startDate, endDate] as const,
};

/* ── fetcher ── */
async function fetchDashboardPerformance(
  startDate: string,
  endDate: string
): Promise<DashboardPerformanceResponse> {
  const { data } = await axiosRequest.get("/dashboard/performance", {
    params: { startDate, endDate },
  });
  return data;
}

/* ── hook ── */
export function useDashboardPerformance(startDate: string, endDate: string) {
  return useQuery({
    queryKey: performanceKeys.byRange(startDate, endDate),
    queryFn:  () => fetchDashboardPerformance(startDate, endDate),
    enabled:  Boolean(startDate && endDate),
    staleTime: 1000 * 60 * 2,
  });
}
