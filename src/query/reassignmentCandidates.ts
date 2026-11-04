import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "./keys";

export interface ReassignmentCandidate {
  id: number;
  operationNumber: string | null;
  orderNumber: string | null;
  customerName: string | null;
  shipmentStatusLabel: string;
  sku: string | null;
  quantity: number | null;
  eligible: boolean;
  reason: "final_status" | "already_reassigned" | "item_mismatch" | null;
  reasonLabel: string | null;
}

export function useReassignmentCandidates(sourceOrderId: number | undefined, q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: shipmentKeys.reassignmentCandidates(sourceOrderId ?? 0, term),
    enabled: Boolean(sourceOrderId) && term.length > 0,
    staleTime: 15_000,
    queryFn: async (): Promise<ReassignmentCandidate[]> => {
      const res = await axiosRequest.get("/shipments/reassignments/candidates", { params: { sourceOrderId, q: term } });
      return res.data?.data ?? [];
    },
  });
}
