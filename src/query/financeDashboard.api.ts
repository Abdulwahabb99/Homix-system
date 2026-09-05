import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

export interface FinanceOpexItem {
  id?: number;
  label: string;
  amount: number;
  sortOrder: number;
}

export interface FinanceDashboardData {
  month: string;
  gmvOnline: number;
  gmvShowroom: number;
  cancellations: number;
  discounts: number;
  gmv: number;
  nmv: number;
  cancellationRate: number;
  deliveredHomix: number;
  deliveredVendor: number;
  g2n: number;
  g2nRate: number;
  cogsGmv: number;
  cogsNmv: number;
  cogsG2n: number;
  grossMargin: number;
  grossMarginRate: number;
  opex: FinanceOpexItem[];
  totalOpex: number;
  ebitda: number;
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
