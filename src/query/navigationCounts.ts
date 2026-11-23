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

/**
 * Sidebar badges. The server caches the counters for 60 s, so asking more often only costs database time:
 * with `staleTime: 0` + refetch "always" on mount/focus every page navigation and tab switch re-ran the
 * count query (~620k runs, ~2.7 h of DB time). Now a fresh result is reused for 60 s across navigations;
 * real changes still arrive through the socket event, which invalidates the query (see App.tsx).
 */
export const NAVIGATION_COUNTS_STALE_MS = 60_000;

export function useNavigationCounts() {
  return useQuery({
    queryKey: navigationCountKeys.all,
    queryFn: fetchNavigationCounts,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: NAVIGATION_COUNTS_STALE_MS,
  });
}
