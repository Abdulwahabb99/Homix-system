import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

/* ── types ── */
export interface DashboardCard {
  key:               string;
  label:             string;
  currentValue:      number;
  previousValue:     number;
  changePercentage:  number;
  comparisonLabel:   string;
  trend:             "up" | "down" | "neutral";
}

export interface DashboardCardsData {
  cards:     DashboardCard[];
  startDate: string;
  endDate:   string;
  role:      string;
}

export interface DashboardCardsResponse {
  data:   DashboardCardsData;
  status: boolean;
}

/* ── query key ── */
export const dashboardKeys = {
  cards: (startDate: string, endDate: string) =>
    ["dashboard", "cards", startDate, endDate] as const,
};

/* ── fetcher ── */
async function fetchDashboardCards(
  startDate: string,
  endDate: string
): Promise<DashboardCardsResponse> {
  const { data } = await axiosRequest.get("/dashboard/cards", {
    params: { startDate, endDate },
  });
  return data;
}

/* ── hook ── */
export function useDashboardCards(startDate: string, endDate: string) {
  return useQuery({
    queryKey: dashboardKeys.cards(startDate, endDate),
    queryFn:  () => fetchDashboardCards(startDate, endDate),
    enabled:  Boolean(startDate && endDate),
    staleTime: 30_000,
  });
}
