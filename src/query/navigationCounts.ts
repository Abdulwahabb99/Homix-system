import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

export type NavigationCountKey = "factories" | "orders" | "products";

export type NavigationCounts = Record<NavigationCountKey, number> & {
  updatedAt: string;
};

export const navigationCountKeys = {
  all: ["navigation-counts"] as const,
};

const toCount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
};

async function fetchNavigationCounts(): Promise<NavigationCounts> {
  const { data: response } = await axiosRequest.get("/navigation/counts");
  const envelope = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const raw = envelope.data && typeof envelope.data === "object"
    ? envelope.data as Record<string, unknown>
    : envelope;

  return {
    factories: toCount(raw.factories),
    orders: toCount(raw.orders),
    products: toCount(raw.products),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
  };
}

export function useNavigationCounts() {
  return useQuery({
    queryKey: navigationCountKeys.all,
    queryFn: fetchNavigationCounts,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
    staleTime: 0,
  });
}
