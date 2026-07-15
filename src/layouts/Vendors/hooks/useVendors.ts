/**
 * منطق صفحة الموردين: جلب `GET /vendors` (نفس الـ API) + فلترة (بحث/حالة) وترقيم
 * من جانب العميل + مؤشرات + تبديل الحالة + التعديل. الإضافة/الحذف غير مدعومَين
 * من الـ BE (يُعرضان كأزرار مؤقتة في المكوّنات).
 */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { vendorKeys } from "query/keys";
import { PAGE_SIZE } from "../utils/constants";
import { Vendor, VendorStatusFilter } from "../utils/types";

async function fetchVendors(): Promise<Vendor[]> {
  const { data } = await axiosRequest.get("/vendors");
  const items: Vendor[] = Array.isArray(data?.data) ? data.data : [];
  return [...items].sort((a, b) => Number(a.id) - Number(b.id));
}

const email = (v: Vendor) => (v.user?.email ?? "").toLowerCase();

export interface VendorsKpis {
  total: number;
  active: number;
  inactive: number;
  /** متوسط مدة الشحن (بالأيام) للموردين الذين لديهم قيمة > 0 — null إن لا يوجد */
  avgShipDays: number | null;
  /** نسبة النشاط % */
  activePct: number;
}

export function useVendors() {
  const queryClient = useQueryClient();
  const { data: vendors = [], isLoading, isError } = useQuery({
    queryKey: vendorKeys.list(),
    queryFn: fetchVendors,
    staleTime: 60_000,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VendorStatusFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, status]);
  useEffect(() => { if (isError) NotificationMeassage("error", "حدث خطأ"); }, [isError]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter((v) => {
      if (status === "active" && !v.active) return false;
      if (status === "inactive" && v.active) return false;
      if (!q) return true;
      return (v.name ?? "").toLowerCase().includes(q) || email(v).includes(q);
    });
  }, [vendors, search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const kpis: VendorsKpis = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.active).length;
    const shipVals = vendors
      .map((v) => Number(v.daysToDeliver))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avgShipDays = shipVals.length
      ? Math.round((shipVals.reduce((a, b) => a + b, 0) / shipVals.length) * 10) / 10
      : null;
    return {
      total,
      active,
      inactive: total - active,
      avgShipDays,
      activePct: total ? Math.round((active / total) * 100) : 0,
    };
  }, [vendors]);

  /* تبديل الحالة — تحديث متفائل للذاكرة المؤقتة مع رجوع عند الفشل */
  const toggleMutation = useMutation({
    mutationFn: (id: number | string) => axiosRequest.put(`/vendors/${id}/activeStatus`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: vendorKeys.list() });
      const prev = queryClient.getQueryData<Vendor[]>(vendorKeys.list());
      queryClient.setQueryData<Vendor[]>(vendorKeys.list(), (old) =>
        (old ?? []).map((v) => (v.id === id ? { ...v, active: !v.active } : v))
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(vendorKeys.list(), ctx.prev);
      NotificationMeassage("error", "حدث خطأ");
    },
    onSuccess: () => NotificationMeassage("success", "تم تغيير الحالة"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: vendorKeys.list() }),
  });

  /* تعديل المورد — daysToDeliver / password / accountManager (ما يقبله الـ API) */
  const editMutation = useMutation({
    mutationFn: (payload: {
      id: number | string;
      daysToDeliver?: string | number;
      password?: string;
      accountManager?: number | string | null;
    }) => {
      const body: Record<string, unknown> = {};
      if (payload.daysToDeliver !== undefined && payload.daysToDeliver !== "") body.daysToDeliver = payload.daysToDeliver;
      if (payload.password) body.password = payload.password;
      if (payload.accountManager !== undefined && payload.accountManager !== "") body.accountManager = payload.accountManager;
      return axiosRequest.put(`/vendors/${payload.id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.list() });
      NotificationMeassage("success", "تم تعديل المورد بنجاح");
    },
    onError: () => NotificationMeassage("error", "حدث خطأ"),
  });

  return {
    vendors,
    paged,
    total: filtered.length,
    page: safePage,
    pageCount,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    kpis,
    isLoading,
    toggleActive: toggleMutation.mutate,
    editVendor: (payload: {
      id: number | string;
      daysToDeliver?: string | number;
      password?: string;
      accountManager?: number | string | null;
    }) => editMutation.mutateAsync(payload),
    isEditing: editMutation.isPending,
  };
}
