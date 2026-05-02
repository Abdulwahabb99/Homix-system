import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

/* ── types ── */
export interface LatestOrderItem {
  id:          number;
  orderNumber: string;
  customerName:string;
  productName: string;
  amount:      number;
  status:      number;
  statusLabel: string;
  orderDate:   string;
}

export interface DashboardLatestOrdersData {
  role:  string;
  items: LatestOrderItem[];
}

export interface DashboardLatestOrdersResponse {
  status: boolean;
  data:   DashboardLatestOrdersData;
}

/* ── query key ── */
export const latestOrdersKeys = {
  byRange: (startDate: string, endDate: string) =>
    ["dashboard", "latest-orders", startDate, endDate] as const,
};

/* ── fetcher ── */
async function fetchLatestOrders(
  startDate: string,
  endDate: string
): Promise<DashboardLatestOrdersResponse> {
  const { data } = await axiosRequest.get("/dashboard/latest-orders", {
    params: { startDate, endDate },
  });
  return data;
}

/* ── hook ── */
export function useDashboardLatestOrders(startDate: string, endDate: string) {
  return useQuery({
    queryKey: latestOrdersKeys.byRange(startDate, endDate),
    queryFn:  () => fetchLatestOrders(startDate, endDate),
    enabled:  Boolean(startDate && endDate),
    staleTime: 1000 * 60,
  });
}
