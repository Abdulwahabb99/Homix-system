import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";
import moment from "moment";

export interface PerformanceOverviewCard {
  key: string;
  label: string;
  value: number | string;
  description?: string;
}

export interface PerformanceChartPoint {
  date: string;
  delivered: number;
  returned: number;
  pending: number;
}

export interface ProviderRow {
  name: string;
  total: number;
  delivered: number;
  returned: number;
  deliveryRate: number;
  avgDays: number;
}

export interface ShipmentsPerformanceData {
  overview: PerformanceOverviewCard[];
  chart: PerformanceChartPoint[];
  providers: ProviderRow[];
}

export interface PerformanceParams {
  startDate?: any;
  endDate?: any;
}

function buildQuery(p: PerformanceParams): string {
  const q = new URLSearchParams();
  if (p.startDate) {
    const m = moment.isMoment(p.startDate) ? p.startDate : moment.utc(String(p.startDate), "DD-MM-YYYY");
    if (m.isValid()) q.set("startDate", m.toISOString());
  }
  if (p.endDate) {
    const m = moment.isMoment(p.endDate) ? p.endDate : moment.utc(String(p.endDate), "DD-MM-YYYY");
    if (m.isValid()) q.set("endDate", m.toISOString());
  }
  return q.toString();
}

function normalizePerformance(data: any): ShipmentsPerformanceData {
  const raw = data?.data ?? data ?? {};
  return {
    overview:  Array.isArray(raw.overview)  ? raw.overview  : [],
    chart:     Array.isArray(raw.chart)     ? raw.chart     : [],
    providers: Array.isArray(raw.providers) ? raw.providers : [],
  };
}

export async function fetchShipmentsPerformance(params: PerformanceParams): Promise<ShipmentsPerformanceData> {
  const qs = buildQuery(params);
  const { data } = await axiosRequest.get(`/shipments/performance${qs ? `?${qs}` : ""}`);
  return normalizePerformance(data);
}

export function useShipmentsPerformanceQuery(params: PerformanceParams) {
  return useQuery({
    queryKey: shipmentKeys.performance(JSON.stringify(params)),
    queryFn: () => fetchShipmentsPerformance(params),
    staleTime: 60_000,
  });
}
