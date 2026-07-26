/**
 * حسابات ومساعدات عرض صفحة الصنّاع — بلا أي حالة أو تأثيرات جانبية.
 */
import {
  Factory,
  FactoryFilters,
  FactoryFormValues,
  FactoryKpis,
  FactorySpec,
} from "./types";
import { CURRENCY } from "./constants";

/** أرقام لاتينية بفواصل — نفس ما يستخدمه باقي لوحات Homix */
export function fmt(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** مبلغ مع العملة */
export function money(n: number | null | undefined): string {
  return `${fmt(n)} ${CURRENCY}`;
}

/** حرفان من أول كلمتين للاسم (avatar) */
export function initials(name: string): string {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** الجزء المعروض من رابط الويب سايت — ما بعد `/...` كما في التصميم */
export function websiteLabel(website: string): string {
  if (!website) return "رابط";
  return website.split("/...")[1] || "رابط";
}

/** فلترة بالبحث النصي (الاسم/العنوان/المسؤول) + التخصّص + الحالة */
export function filterFactories(list: Factory[], filters: FactoryFilters): Factory[] {
  const q = filters.search.trim().toLowerCase();
  return list.filter((f) => {
    if (filters.spec && f.spec !== filters.spec) return false;
    if (filters.status !== "" && f.status !== filters.status) return false;
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      (f.addr ?? "").toLowerCase().includes(q) ||
      (f.resp ?? "").toLowerCase().includes(q)
    );
  });
}

/** ترتيب تصاعدي/تنازلي حسب الاسم أو التخصّص (مقارنة نصية عربية-آمنة) */
export function sortFactories(
  list: Factory[],
  key: "name" | "spec" | null,
  dir: "asc" | "desc"
): Factory[] {
  if (!key) return list;
  const factor = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "ar") * factor);
}

/**
 * مؤشرات أعلى الصفحة. العدد/النشاط/المبيعات تُشتق من القائمة، أمّا عدد المنتجات
 * و«تحتاج مراجعة» فلا يوفّرهما مصدر الصنّاع — تُمرَّر من طبقة البيانات.
 */
export function buildKpis(
  list: Factory[],
  extras: { totalProducts: number; needsReview: number }
): FactoryKpis {
  const total = list.length;
  const online = list.filter((f) => f.status === 1).length;
  const totalSales = list.reduce((sum, f) => sum + Number(f.sales ?? 0), 0);
  return {
    total,
    online,
    activePct: total ? Math.round((online / total) * 1000) / 10 : 0,
    totalProducts: extras.totalProducts,
    totalSales,
    needsReview: extras.needsReview,
  };
}

/** يختصر المبالغ الكبيرة (847000 → 847K) كما في بطاقة المبيعات */
export function compactMoney(n: number): string {
  const v = Number(n ?? 0);
  if (Math.abs(v) >= 1_000_000) return `${Math.round(v / 100_000) / 10}M`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}K`;
  return fmt(v);
}

/** مصنع → قيم النموذج (وضع التعديل) */
export function factoryToForm(f: Factory): FactoryFormValues {
  return {
    name: f.name ?? "",
    addr: f.addr ?? "",
    spec: f.spec ?? "",
    status: f.status ?? 1,
    website: f.website ?? "",
    resp: f.resp ?? "",
    phone: f.phone ?? "",
    shipCairo: f.shipCairo != null ? String(f.shipCairo) : "",
    shipOther: f.shipOther != null ? String(f.shipOther) : "",
    bankName: f.bankName ?? "",
    bankHolder: f.bankHolder ?? "",
    bankAccount: f.bankAccount ?? "",
    bankWallet: f.bankWallet ?? "",
    // التصميم يعرض المحفظة كقيمة افتراضية لـ InstaPay عند غيابه
    bankInstapay: f.bankInstapay ?? f.bankWallet ?? "",
  };
}

/** قيم النموذج → حقول المصنع القابلة للحفظ (بدون id والمؤشرات المحسوبة) */
export function formToFactory(
  v: FactoryFormValues
): Omit<Factory, "id" | "orders" | "sales" | "bankIban"> {
  return {
    name: v.name.trim(),
    addr: v.addr.trim(),
    spec: (v.spec || "Furniture") as FactorySpec,
    status: v.status,
    website: v.website.trim(),
    resp: v.resp.trim(),
    phone: v.phone.trim(),
    shipCairo: parseInt(v.shipCairo, 10) || 0,
    shipOther: parseInt(v.shipOther, 10) || 0,
    bankName: v.bankName.trim(),
    bankHolder: v.bankHolder.trim(),
    bankAccount: v.bankAccount.trim(),
    bankWallet: v.bankWallet.trim(),
    bankInstapay: v.bankInstapay.trim(),
  };
}

/** حجم الملف بصيغة مقروءة (KB / MB) */
export function fileSizeLabel(size: number): string {
  return size > 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(size / 1024)} KB`;
}
