import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

/* ── types ── */
export interface SalesDistributionItem {
  label:      string;
  value:      number;
  percentage: number;
  color:      string;
}

export interface DashboardSalesDistributionData {
  role:  string;
  items: SalesDistributionItem[];
}

export interface DashboardSalesDistributionResponse {
  status: boolean;
  data:   DashboardSalesDistributionData;
}

/* ── query key ── */
export const salesDistributionKeys = {
  byRange: (startDate: string, endDate: string) =>
    ["dashboard", "sales-distribution", startDate, endDate] as const,
};

/* ── fetcher ── */
async function fetchSalesDistribution(
  startDate: string,
  endDate: string
): Promise<DashboardSalesDistributionResponse> {
  const { data } = await axiosRequest.get("/dashboard/sales-distribution", {
    params: { startDate, endDate },
  });
  return data;
}

/* ── hook ── */
export function useDashboardSalesDistribution(startDate: string, endDate: string) {
  return useQuery({
    queryKey: salesDistributionKeys.byRange(startDate, endDate),
    queryFn:  () => fetchSalesDistribution(startDate, endDate),
    enabled:  Boolean(startDate && endDate),
    staleTime: 30_000,
  });
}
