import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";
import moment from "moment";

export type PerformancePeriod = "daily" | "weekly" | "monthly" | "custom";

export interface PerformanceOverview {
  deliveredOrdersCount: number;
  totalGmv: number;
}

export interface PerformanceChartPoint {
  label: string;
  deliveredOrdersCount: number;
}

export interface ProviderRow {
  deliveredOrdersCount: number;
  deliveryBy: number | null;
  deliveryByLabel: string;
  returnsCount: number;
  shippingCompanyName: string;
  totalGmv: number;
}

export interface ShipmentsPerformanceData {
  overview: PerformanceOverview;
  chart: PerformanceChartPoint[];
  providers: ProviderRow[];
}

export interface PerformanceParams {
  startDate?: string;
  endDate?: string;
  period?: PerformancePeriod;
}

function toIsoDate(value?: string, boundary: "start" | "end" = "start"): string | undefined {
  if (!value) return undefined;
  const parsed = moment.utc(value, ["YYYY-MM-DD", moment.ISO_8601], true);
  if (!parsed.isValid()) return undefined;
  return (boundary === "start" ? parsed.startOf("day") : parsed.endOf("day")).toISOString();
}

function buildQuery(params: PerformanceParams): string {
  const query = new URLSearchParams();
  query.set("period", params.period ?? "daily");
  const startDate = toIsoDate(params.startDate, "start");
  const endDate = toIsoDate(params.endDate, "end");
  if (startDate) query.set("startDate", startDate);
  if (endDate) query.set("endDate", endDate);
  return query.toString();
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function normalizePerformance(response: unknown): ShipmentsPerformanceData {
  const envelope = response && typeof response === "object" ? response as Record<string, any> : {};
  const raw = envelope.data && typeof envelope.data === "object" ? envelope.data : envelope;
  const overview = raw.overview && typeof raw.overview === "object" ? raw.overview : {};

  return {
    overview: {
      deliveredOrdersCount: toNumber(overview.deliveredOrdersCount),
      totalGmv: toNumber(overview.totalGmv),
    },
    chart: Array.isArray(raw.chart)
      ? raw.chart.map((point: Record<string, unknown>) => ({
          deliveredOrdersCount: toNumber(point.deliveredOrdersCount),
          label: String(point.label ?? ""),
        }))
      : [],
    providers: Array.isArray(raw.providers)
      ? raw.providers.map((provider: Record<string, unknown>) => ({
          deliveredOrdersCount: toNumber(provider.deliveredOrdersCount),
          deliveryBy: provider.deliveryBy == null ? null : toNumber(provider.deliveryBy),
          deliveryByLabel: String(provider.deliveryByLabel ?? ""),
          returnsCount: toNumber(provider.returnsCount),
          shippingCompanyName: String(provider.shippingCompanyName ?? ""),
          totalGmv: toNumber(provider.totalGmv),
        }))
      : [],
  };
}

export async function fetchShipmentsPerformance(params: PerformanceParams): Promise<ShipmentsPerformanceData> {
  const { data } = await axiosRequest.get(`/shipments/performance?${buildQuery(params)}`);
  return normalizePerformance(data);
}

export function useShipmentsPerformanceQuery(params: PerformanceParams) {
  return useQuery({
    queryKey: shipmentKeys.performance(JSON.stringify(params)),
    queryFn: () => fetchShipmentsPerformance(params),
    staleTime: 60_000,
  });
}
