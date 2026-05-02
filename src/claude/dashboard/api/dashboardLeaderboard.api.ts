import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

/* ── types ── */
export interface LeaderboardItem {
  id:             number;
  name:           string;
  rank:           number;
  secondaryLabel: string;
  totalSales:     number;
}

export interface DashboardLeaderboardData {
  role:  string;
  items: LeaderboardItem[];
}

export interface DashboardLeaderboardResponse {
  status: boolean;
  data:   DashboardLeaderboardData;
}

/* ── query key ── */
export const leaderboardKeys = {
  byRange: (startDate: string, endDate: string) =>
    ["dashboard", "leaderboard", startDate, endDate] as const,
};

/* ── fetcher ── */
async function fetchLeaderboard(
  startDate: string,
  endDate: string
): Promise<DashboardLeaderboardResponse> {
  const { data } = await axiosRequest.get("/dashboard/leaderboard", {
    params: { startDate, endDate },
  });
  return data;
}

/* ── hook ── */
export function useDashboardLeaderboard(startDate: string, endDate: string) {
  return useQuery({
    queryKey: leaderboardKeys.byRange(startDate, endDate),
    queryFn:  () => fetchLeaderboard(startDate, endDate),
    enabled:  Boolean(startDate && endDate),
    staleTime: 30_000,
  });
}
