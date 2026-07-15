/**
 * منطق صفحة المستخدمين: جلب `GET /users` (نفس الـ API) + فلترة (بحث/دور)
 * وترقيم من جانب العميل + مؤشرات + حذف. عند دعم الـ BE للفلاتر لاحقاً،
 * حوّل الفلترة لمعاملات استعلام هنا دون تغيير المكوّنات.
 */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { userKeys } from "query/keys";
import { ALL_ROLES, PAGE_SIZE } from "../utils/constants";
import { AppUser, RoleFilter } from "../utils/types";

async function fetchUsers(): Promise<AppUser[]> {
  const { data } = await axiosRequest.get("/users");
  const items: AppUser[] = Array.isArray(data?.data) ? data.data : [];
  return [...items].sort((a, b) => Number(a.id) - Number(b.id));
}

function fullName(u: AppUser): string {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
}

export interface UsersKpis {
  total: number;
  admins: number;
}

export function useUsers() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
    staleTime: 60_000,
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>(ALL_ROLES);
  const [page, setPage] = useState(1);

  // إعادة الترقيم للصفحة الأولى عند تغيّر الفلاتر
  useEffect(() => { setPage(1); }, [search, role]);

  useEffect(() => {
    if (isError) NotificationMeassage("error", "حدث خطأ");
  }, [isError]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== ALL_ROLES && String(u.userType) !== role) return false;
      if (!q) return true;
      return fullName(u).toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    });
  }, [users, search, role]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const kpis: UsersKpis = useMemo(
    () => ({ total: users.length, admins: users.filter((u) => String(u.userType) === "1").length }),
    [users]
  );

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_ROLES]: users.length };
    users.forEach((u) => {
      const k = String(u.userType);
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return counts;
  }, [users]);

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => axiosRequest.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.list() });
      NotificationMeassage("success", "تم حذف المستخدم");
    },
    onError: () => NotificationMeassage("error", "حدث خطأ"),
  });

  return {
    users,
    filtered,
    paged,
    total: filtered.length,
    page: safePage,
    pageCount,
    setPage,
    search,
    setSearch,
    role,
    setRole,
    roleCounts,
    kpis,
    isLoading,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
