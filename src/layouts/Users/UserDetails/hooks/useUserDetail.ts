/**
 * منطق صفحة تفاصيل المستخدم: جلب `GET /users/:id` (نفس الـ API المستخدم في نافذة التعديل).
 * يعيد بيانات المستخدم + مشتقّاتها (الاسم/الأحرف الأولى/تاريخ الانضمام). أقسام الصلاحيات
 * وسجل النشاط وبيانات التحويل ثابتة حالياً وتُقرأ من ملف الثوابت لحين ربط الـ BE.
 */
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { userKeys } from "query/keys";
import { roleMeta } from "../../utils/constants";
import { AppUser } from "../utils/types";
import { ACCOUNT_STATIC, PLACEHOLDER } from "../utils/constants";

async function fetchUser(id: string): Promise<AppUser | null> {
  const { data } = await axiosRequest.get(`/users/${id}`);
  return (data?.data ?? data) as AppUser | null;
}

/**
 * الـ API قد يعيد userType كرمز رقمي ("1".."4") أو كاسم نصّي ("admin"...).
 * نوحّده إلى الرمز الرقمي المعتمد في بقية التطبيق قبل حساب بيانات الدور.
 */
const ROLE_ALIASES: Record<string, string> = {
  admin: "1",
  vendor: "2",
  operation: "3",
  operations: "3",
  logistic: "4",
  logistics: "4",
};
function normalizeUserType(userType: unknown): string {
  const raw = String(userType ?? "").trim().toLowerCase();
  return ROLE_ALIASES[raw] ?? raw;
}

function fullName(u?: AppUser | null): string {
  if (!u) return PLACEHOLDER;
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || PLACEHOLDER;
}

function initials(u?: AppUser | null): string {
  if (!u) return "؟";
  const parts = [u.firstName, u.lastName].filter(Boolean) as string[];
  const src = parts.length ? parts : String(u.email ?? "؟").split("@");
  return src.slice(0, 2).map((w) => (w?.[0] ?? "").toUpperCase()).join("") || "؟";
}

/** تنسيق تاريخ الانضمام من createdAt إن وُجد، وإلا القيمة الافتراضية الثابتة */
function joinedLabel(u?: AppUser | null): string {
  const raw = (u?.createdAt ?? u?.created_at) as string | undefined;
  if (!raw) return ACCOUNT_STATIC.joinedFallback;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return ACCOUNT_STATIC.joinedFallback;
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

export function useUserDetail(id?: string) {
  const {
    data: user = null,
    isLoading,
    isError,
  } = useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => fetchUser(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) NotificationMeassage("error", "حدث خطأ");
  }, [isError]);

  const derived = useMemo(
    () => ({
      name: fullName(user),
      initials: initials(user),
      email: user?.email || PLACEHOLDER,
      role: roleMeta(normalizeUserType(user?.userType)),
      joined: joinedLabel(user),
      /** حالة الحساب الحقيقية من الـ API (تُستخدم لشارة الحالة وحلقة الاتصال) */
      isActive: user?.isActive !== false && user != null,
    }),
    [user]
  );

  return { user, isLoading, isError, ...derived };
}
