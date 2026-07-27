/**
 * مساعدات عرض صفحة الصنّاع — بلا حالة ولا تأثيرات جانبية.
 * الفلترة والترتيب والترقيم صارت على الخادم، فلم يبقَ هنا حساب قوائم.
 */
import moment from "moment";
import { CURRENCY, SPEC_PALETTE, SpecPalette } from "./constants";
import { FactoryDetail, FactoryFormValues } from "./types";
import type { FactoryPayload } from "query/factoryMutations";

/** أرقام لاتينية بفواصل */
export function fmt(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** مبلغ مع العملة */
export function money(n: number | null | undefined): string {
  return `${fmt(n)} ${CURRENCY}`;
}

/** تاريخ ميلادي مختصر بأرقام لاتينية */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).locale("en");
  return m.isValid() ? m.format("YYYY-MM-DD") : "—";
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

/**
 * لون ثابت لكل تخصّص. التخصصات تأتي من الـ meta ولا يمكن ربطها بخريطة ثابتة،
 * فنستخدم تجزئة بسيطة لاسم التخصّص لاختيار لون من لوحة التصميم — نفس الاسم
 * يعطي نفس اللون دائماً.
 */
export function specPalette(spec: string): SpecPalette {
  const s = String(spec ?? "");
  if (!s) return SPEC_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) % 100_000;
  }
  return SPEC_PALETTE[hash % SPEC_PALETTE.length];
}

/** الجزء المعروض من رابط الويب سايت — اسم المضيف + المسار المختصر */
export function websiteLabel(website: string): string {
  const raw = String(website ?? "").trim();
  if (!raw) return "—";
  return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

/** نسبة النشاط % من الملخّص */
export function activityPct(online: number, total: number): number {
  if (!total) return 0;
  return Math.round((online / total) * 1000) / 10;
}

/** يختصر المبالغ الكبيرة (847000 → 847K) */
export function compactNumber(n: number): string {
  const v = Number(n ?? 0);
  if (Math.abs(v) >= 1_000_000) return `${Math.round(v / 100_000) / 10}M`;
  if (Math.abs(v) >= 1_000) return `${Math.round(v / 1_000)}K`;
  return fmt(v);
}

/** تفاصيل مصنع → قيم النموذج (وضع التعديل) */
export function detailToForm(d: FactoryDetail): FactoryFormValues {
  return {
    name: d.name,
    description: d.description,
    factoryCategory: d.factoryCategory,
    status: d.status,
    joinDate: d.joinDate ? moment(d.joinDate).locale("en").format("YYYY-MM-DD") : "",
    website: d.website,
    email: d.email,
    phoneNumber: d.phoneNumber,
    address: d.address,
    city: d.city,
    country: d.country,

    responsibleName: d.responsibleName,
    responsiblePhone: d.responsiblePhone,
    responsibleEmail: d.responsibleEmail,
    responsibleRole: d.responsibleRole,

    contactPersonName: d.contactPersonName,
    contactPersonPhoneNumber: d.contactPersonPhoneNumber,
    contactPersonEmail: d.contactPersonEmail,
    contactPersonRole: d.contactPersonRole,

    cairoGizaShipping: d.cairoGizaShipping != null ? String(d.cairoGizaShipping) : "",
    otherCitiesShipping: d.otherCitiesShipping != null ? String(d.otherCitiesShipping) : "",

    bankName: d.bankName,
    bankAccountHolderName: d.bankAccountHolderName,
    bankAccountNumber: d.bankAccountNumber,
    bankAccountType: d.bankAccountType,
    walletNumber: d.walletNumber,
    walletProvider: d.walletProvider,
    instapayNumber: d.instapayNumber,
  };
}

/** رقم من نص حقل إدخال، أو undefined إن كان فارغاً/غير صالح */
function num(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** نص مُشذّب، أو undefined إن كان فارغاً — حتى لا نُرسل حقولاً فارغة */
function text(v: string): string | undefined {
  const t = String(v ?? "").trim();
  return t === "" ? undefined : t;
}

/** قيم النموذج → جسم POST/PUT (الحقول الفارغة تُحذف) */
export function formToPayload(v: FactoryFormValues): FactoryPayload {
  return {
    name: v.name.trim(),
    factoryCategory: v.factoryCategory,
    status: Number(v.status),
    description: text(v.description),
    joinDate: text(v.joinDate),
    website: text(v.website),
    email: text(v.email),
    phoneNumber: text(v.phoneNumber),
    address: text(v.address),
    city: text(v.city),
    country: text(v.country),

    responsibleName: text(v.responsibleName),
    responsiblePhone: text(v.responsiblePhone),
    responsibleEmail: text(v.responsibleEmail),
    responsibleRole: text(v.responsibleRole),

    contactPersonName: text(v.contactPersonName),
    contactPersonPhoneNumber: text(v.contactPersonPhoneNumber),
    contactPersonEmail: text(v.contactPersonEmail),
    contactPersonRole: text(v.contactPersonRole),

    cairoGizaShipping: num(v.cairoGizaShipping),
    otherCitiesShipping: num(v.otherCitiesShipping),

    bankName: text(v.bankName),
    bankAccountHolderName: text(v.bankAccountHolderName),
    bankAccountNumber: text(v.bankAccountNumber),
    bankAccountType: text(v.bankAccountType),
    walletNumber: text(v.walletNumber),
    walletProvider: text(v.walletProvider),
    instapayNumber: text(v.instapayNumber),
  };
}

/** حجم الملف بصيغة مقروءة (KB / MB) */
export function fileSizeLabel(size: number): string {
  return size > 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(size / 1024)} KB`;
}
