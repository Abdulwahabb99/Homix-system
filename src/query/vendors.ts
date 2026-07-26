/**
 * قائمة الموردين المشتركة — `GET /vendors`.
 *
 * تستخدم نفس مفتاح `vendorKeys.list()` ونفس ترتيب `layouts/Vendors/hooks/useVendors`
 * (تصاعدياً بالمعرّف) حتى يتقاسم المكوّنان نفس الذاكرة المؤقتة بلا اختلاف في الترتيب.
 * لذلك لا تُرتَّب الخيارات داخل queryFn — الترتيب/التحويل يحدث عند الاستهلاك.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { vendorKeys } from "./keys";
import type { Vendor } from "layouts/Vendors/utils/types";

export interface VendorOption {
  value: string;
  label: string;
}

export async function fetchVendors(): Promise<Vendor[]> {
  const { data } = await axiosRequest.get("/vendors");
  const items: Vendor[] = Array.isArray(data?.data) ? data.data : [];
  return [...items].sort((a, b) => Number(a.id) - Number(b.id));
}

export function useVendorsQuery() {
  return useQuery({
    queryKey: vendorKeys.list(),
    queryFn: fetchVendors,
    staleTime: 60_000,
  });
}

/** خيارات جاهزة للقوائم المنسدلة — المعرّف كنص والاسم كتسمية، مرتّبة أبجدياً. */
export function useVendorOptions() {
  const { data = [], isLoading } = useVendorsQuery();

  const options = useMemo<VendorOption[]>(
    () =>
      data
        .filter((v) => (v?.name ?? "").trim() !== "")
        .map((v) => ({ value: String(v.id), label: String(v.name) }))
        .sort((a, b) => a.label.localeCompare(b.label, "ar")),
    [data]
  );

  return { options, isLoading };
}
