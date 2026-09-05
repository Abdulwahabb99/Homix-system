import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

export interface FinanceOpexItem {
  id?: number;
  label: string;
  amount: number;
  sortOrder: number;
}

export interface FinanceAdjustmentItem {
  id?: number;
  label: string;
  amount: number;
  sortOrder: number;
  type: "positive" | "negative";
}

export interface FinanceDashboardData {
  adjustments: FinanceAdjustmentItem[];
  month: string;
  gmvOnline: number;
  gmvShowroom: number;
  cancellations: number;
  discounts: number;
  gmv: number;
  nmv: number;
  cancellationRate: number;
  discountRate: number;
  nmvRate: number;
  onlineRate: number;
  showroomRate: number;
  deliveredHomix: number;
  deliveredVendor: number;
  g2n: number;
  g2nRate: number;
  deliveredHomixRate: number;
  deliveredVendorRate: number;
  cogsGmv: number;
  cogsNmv: number;
  cogsG2n: number;
  cogsGmvRate: number;
  cogsNmvRate: number;
  cogsG2nRate: number;
  grossMargin: number;
  grossMarginRate: number;
  opex: FinanceOpexItem[];
  totalOpex: number;
  opexRate: number;
  ebitda: number;
  ebitdaRate: number;
}

const financeDashboardKey = (month: string) => ["dashboard", "finance", month] as const;

export function useFinanceDashboard(month: string) {
  return useQuery({
    queryKey: financeDashboardKey(month),
    queryFn: async () => {
      const response = await axiosRequest.get<{ data: FinanceDashboardData }>("/dashboard/finance", {
        params: { month },
      });
      return response.data.data;
    },
    enabled: Boolean(month),
    staleTime: 30_000,
  });
}

export function useSaveFinanceOpex(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<Pick<FinanceOpexItem, "amount" | "label">>) => {
      const response = await axiosRequest.put<{ data: FinanceDashboardData }>(
        "/dashboard/finance/opex",
        { items },
        { params: { month } },
      );
      return response.data.data;
    },
    onSuccess: (data) => queryClient.setQueryData(financeDashboardKey(month), data),
  });
}

export function useSaveFinanceAdjustments(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<Pick<FinanceAdjustmentItem, "amount" | "label" | "type">>) => {
      const response = await axiosRequest.put<{ data: FinanceDashboardData }>(
        "/dashboard/finance/adjustments",
        { items },
        { params: { month } },
      );
      return response.data.data;
    },
    onSuccess: (data) => queryClient.setQueryData(financeDashboardKey(month), data),
  });
}
