import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

/* ── types ── */
export interface ActivityItem {
  id:         number;
  entityId:   number;
  entityType: string;
  text:       string;
  createdAt:  string;
}

export interface DashboardActivitiesData {
  role:  string;
  items: ActivityItem[];
}

export interface DashboardActivitiesResponse {
  status: boolean;
  data:   DashboardActivitiesData;
}

/* ── query key ── */
export const activitiesKeys = {
  byRange: (startDate: string, endDate: string) =>
    ["dashboard", "activities", startDate, endDate] as const,
};

/* ── fetcher ── */
async function fetchDashboardActivities(
  startDate: string,
  endDate: string
): Promise<DashboardActivitiesResponse> {
  const { data } = await axiosRequest.get("/dashboard/activities", {
    params: { startDate, endDate },
  });
  return data;
}

/* ── hook ── */
export function useDashboardActivities(startDate: string, endDate: string) {
  return useQuery({
    queryKey: activitiesKeys.byRange(startDate, endDate),
    queryFn:  () => fetchDashboardActivities(startDate, endDate),
    enabled:  Boolean(startDate && endDate),
    staleTime: 30_000,
  });
}
