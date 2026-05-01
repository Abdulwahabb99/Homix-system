export type DashboardRole = "admin" | "vendor";

export type DashboardCardKey =
  | "totalSales"
  | "totalOrders"
  | "pendingOrders"
  | "activeMakers"
  | "activeProducts";

export interface DateRangeInput {
  endDate: string;
  startDate: string;
}

export interface DashboardMetricsInput extends DateRangeInput {
  role: DashboardRole;
  vendorId?: number;
}

export interface DashboardMetricSnapshot {
  activeMakers: number;
  activeProducts: number;
  pendingOrders: number;
  totalOrders: number;
  totalSales: number;
}

export interface DashboardCardResponse {
  changePercentage: number;
  comparisonLabel: string;
  currentValue: number;
  key: DashboardCardKey;
  label: string;
  previousValue: number;
  trend: "down" | "flat" | "up";
}

export interface DashboardCardsPayload {
  cards: DashboardCardResponse[];
  endDate: string;
  role: DashboardRole;
  startDate: string;
}
