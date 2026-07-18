/**
 * منطق صفحة تفاصيل المستخدم: جلب `GET /users/:id` واشتقاق كل ما تعرضه المكوّنات
 * من الاستجابة الحقيقية (الاسم/الدور/الحالة/الصلاحيات المجمّعة/سجل النشاط/البنك/الوظيفة).
 */
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { userKeys } from "query/keys";
import { roleMeta } from "../../utils/constants";
import { ACTIVITY_TONE, ACTIVITY_TONE_FALLBACK, PLACEHOLDER } from "../utils/constants";
import { ActivityView, BankInfo, JobInfo, PermissionsSummary, UserDetail } from "../utils/types";

async function fetchUser(id: string): Promise<UserDetail | null> {
  const { data } = await axiosRequest.get(`/users/${id}`);
  return (data?.data ?? data) as UserDetail | null;
}

/**
 * الـ API قد يعيد userType كرمز رقمي ("1".."4") أو كاسم نصّي ("admin"...).
 * نوحّده إلى الرمز الرقمي المعتمد في بقية التطبيق قبل حساب ألوان الدور.
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

function fullName(u?: UserDetail | null): string {
  if (!u) return PLACEHOLDER;
  const name = (u.fullName ?? "").trim() || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return name || PLACEHOLDER;
}

function initials(name: string): string {
  if (!name || name === PLACEHOLDER) return "؟";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w?.[0] ?? "").toUpperCase())
    .join("") || "؟";
}

/** تنسيق تاريخ ميلادي عربي (يوم شهر سنة) */
function formatDate(raw?: string | null): string {
  if (!raw) return PLACEHOLDER;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return PLACEHOLDER;
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}

/** وقت نسبي عربي ("قبل ٥ دقائق") من تاريخ ISO */
function relativeTime(raw?: string | null): string {
  if (!raw) return PLACEHOLDER;
  const then = new Date(raw).getTime();
  if (Number.isNaN(then)) return PLACEHOLDER;
  const diffSec = Math.round((Date.now() - then) / 1000);
  const rtf = new Intl.RelativeTimeFormat("ar-EG", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diffSec) >= secs) return rtf.format(-Math.floor(diffSec / secs), unit);
  }
  return rtf.format(-diffSec, "second");
}

/** راتب: رقم → "12,500 ج.م / شهرياً"، نص غير فارغ كما هو، وإلا بديل */
function formatSalary(salary?: number | string | null): string {
  if (salary == null || salary === "") return PLACEHOLDER;
  const n = Number(salary);
  if (!Number.isNaN(n) && String(salary).trim() !== "") {
    return `${n.toLocaleString("en-US")} ج.م / شهرياً`;
  }
  return String(salary);
}

const orDash = (v?: string | null) => (v && String(v).trim() !== "" ? String(v) : PLACEHOLDER);

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

  return useMemo(() => {
    const name = fullName(user);
    const role = { ...roleMeta(normalizeUserType(user?.userType)) };
    if (user?.roleName) role.label = user.roleName;

    const permissionsSummary: PermissionsSummary =
      user?.permissionsSummary ?? { activeCount: 0, totalCount: 0, groups: [] };

    const activity: ActivityView[] = (user?.activity ?? []).map((a) => ({
      id: a.id,
      action: a.action,
      message: a.message,
      detail: (a.field ?? "").trim(),
      time: relativeTime(a.createdAt),
      tone: ACTIVITY_TONE[a.action] ?? ACTIVITY_TONE_FALLBACK,
    }));

    const bank: BankInfo = {
      bankName: orDash(user?.bankName),
      accountType: orDash(user?.bankAccountType),
      accountName: orDash(user?.bankAccountHolderName),
      accountNumber: orDash(user?.bankAccountNumber),
      wallet: orDash(user?.walletNumber),
      instaPay: orDash(user?.instaPayNumber),
    };

    const job: JobInfo = {
      jobTitle: orDash(user?.jobTitle),
      salary: formatSalary(user?.salary),
    };

    return {
      user,
      isLoading,
      isError,
      name,
      initials: initials(name),
      email: orDash(user?.email),
      phone: orDash(user?.phoneNumber),
      role,
      isActive: user?.isActive !== false && user != null,
      statusLabel: user?.statusLabel || (user?.status === "online" ? "متصل الآن" : "غير متصل"),
      statusOnline: user?.status === "online",
      accountStatusLabel: user?.accountStatusLabel || (user?.isActive === false ? "موقوف" : "نشط"),
      joined: formatDate(user?.createdAt),
      lastPasswordChange: user?.lastPasswordChangeAt ? relativeTime(user.lastPasswordChangeAt) : PLACEHOLDER,
      lastSeen: relativeTime(user?.lastSeenAt),
      permissionsSummary,
      activity,
      bank,
      job,
    };
  }, [user, isLoading, isError]);
}
