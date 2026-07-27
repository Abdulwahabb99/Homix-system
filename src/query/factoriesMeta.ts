/**
 * `GET /factories/meta` — خيارات قوائم صفحة الصنّاع (التخصصات، الحالات،
 * أنواع المستندات، حالات التوثيق). نفس نهج `shipmentsMeta` / `ordersMeta`.
 */
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { factoryKeys } from "./keys";

export interface FactoryMetaOption {
  value: number;
  label: string;
}

/**
 * خيار التخصّص: الـ API يستقبل/يُرجع التخصّص كنص (`factoryCategory` / `specialty`)
 * لكن الـ meta تعطي معرّفاً وتسمية — لذلك التسمية هي القيمة المُرسَلة، والمعرّف
 * يُحفظ للرجوع إليه إن احتاجه الـ BE لاحقاً.
 */
export interface FactorySpecialtyOption {
  /** القيمة المُرسَلة للـ API (نص) */
  value: string;
  label: string;
  id: number;
}

export interface FactoriesMeta {
  specialties: FactorySpecialtyOption[];
  statuses: FactoryMetaOption[];
  documentTypes: FactoryMetaOption[];
  documentStatuses: FactoryMetaOption[];
}

const EMPTY_META: FactoriesMeta = {
  specialties: [],
  statuses: [],
  documentTypes: [],
  documentStatuses: [],
};

function toOptions(raw: unknown): FactoryMetaOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((o) => o && o.id != null && String(o.label ?? "").trim() !== "")
    .map((o) => ({ value: Number(o.id), label: String(o.label) }));
}

function toSpecialties(raw: unknown): FactorySpecialtyOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((o) => o && String(o.label ?? "").trim() !== "")
    .map((o) => ({ value: String(o.label), label: String(o.label), id: Number(o.id) }));
}

function normalize(raw: any): FactoriesMeta {
  if (!raw || typeof raw !== "object") return EMPTY_META;
  return {
    specialties: toSpecialties(raw.specialties),
    statuses: toOptions(raw.statuses),
    documentTypes: toOptions(raw.documentTypes),
    documentStatuses: toOptions(raw.documentStatuses),
  };
}

export async function fetchFactoriesMeta(): Promise<FactoriesMeta> {
  const { data } = await axiosRequest.get("/factories/meta");
  return normalize(data?.data);
}

export function useFactoriesMetaQuery() {
  return useQuery({
    queryKey: factoryKeys.meta(),
    queryFn: fetchFactoriesMeta,
    staleTime: 5 * 60_000,
  });
}
