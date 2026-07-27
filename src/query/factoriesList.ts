/**
 * `GET /factories` — قائمة الصنّاع مع الترقيم والملخّص.
 * الفلترة والترتيب من جانب الخادم بالكامل (`search`, `status`, `factoryCategory`,
 * `sort[...]=1|-1`).
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { factoryKeys } from "./keys";

export const FACTORIES_PAGE_SIZE = 20;

/** صف واحد كما يرجع من القائمة (لا يشمل البيانات البنكية أو جهة الاتصال) */
export interface FactoryListItem {
  id: number;
  code: string;
  name: string;
  address: string;
  specialty: string;
  responsibleName: string;
  responsiblePhone: string;
  cairoGizaShipping: number;
  otherCitiesShipping: number;
  status: number;
  statusLabel: string;
  website: string;
  joinDate: string | null;
  documentsCount: number;
}

export interface FactoriesPagination {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface FactoriesSummary {
  totalFactories: number;
  onlineFactories: number;
  offlineFactories: number;
  specialtiesCount: number;
}

export interface FactoriesListResponse {
  items: FactoryListItem[];
  pagination: FactoriesPagination;
  summary: FactoriesSummary;
}

/** أعمدة الترتيب المدعومة من الـ API */
export type FactorySortField = "name" | "status" | "joinDate" | "createdAt";
export type FactorySortDir = 1 | -1;

export interface FactoriesParams {
  page: number;
  search?: string;
  /** 1 أونلاين / 2 أوفلاين */
  status?: number | "";
  /** التخصّص كنص (نفس قيمة `specialty` في الاستجابة) */
  factoryCategory?: string;
  sortField?: FactorySortField | null;
  sortDir?: FactorySortDir;
}

export function buildFactoriesQuery(p: FactoriesParams): string {
  const q = new URLSearchParams({
    page: String(p.page),
    size: String(FACTORIES_PAGE_SIZE),
  });
  if (p.search?.trim()) q.set("search", p.search.trim());
  if (p.status !== "" && p.status != null) q.set("status", String(p.status));
  if (p.factoryCategory) q.set("factoryCategory", p.factoryCategory);
  if (p.sortField && p.sortDir) q.set(`sort[${p.sortField}]`, String(p.sortDir));
  return q.toString();
}

function normalizeItem(raw: any): FactoryListItem {
  return {
    id: Number(raw?.id),
    code: raw?.code ?? "",
    name: raw?.name ?? "",
    address: raw?.address ?? "",
    specialty: raw?.specialty ?? "",
    responsibleName: raw?.responsibleName ?? "",
    responsiblePhone: raw?.responsiblePhone ?? "",
    cairoGizaShipping: Number(raw?.cairoGizaShipping ?? 0),
    otherCitiesShipping: Number(raw?.otherCitiesShipping ?? 0),
    status: Number(raw?.status ?? 0),
    statusLabel: raw?.statusLabel ?? "",
    website: raw?.website ?? "",
    joinDate: raw?.joinDate ?? null,
    documentsCount: Number(raw?.documentsCount ?? 0),
  };
}

function normalizeResponse(body: any, requestedPage: number): FactoriesListResponse {
  const root = body?.data ?? body ?? {};
  const items = Array.isArray(root.items) ? root.items.map(normalizeItem) : [];
  const pg = root.pagination ?? {};
  const sm = root.summary ?? {};
  return {
    items,
    pagination: {
      page: Number(pg.page ?? requestedPage),
      size: Number(pg.size ?? FACTORIES_PAGE_SIZE),
      totalItems: Number(pg.totalItems ?? items.length),
      totalPages: Number(pg.totalPages ?? 1),
    },
    summary: {
      totalFactories: Number(sm.totalFactories ?? 0),
      onlineFactories: Number(sm.onlineFactories ?? 0),
      offlineFactories: Number(sm.offlineFactories ?? 0),
      specialtiesCount: Number(sm.specialtiesCount ?? 0),
    },
  };
}

export async function fetchFactoriesList(params: FactoriesParams): Promise<FactoriesListResponse> {
  const { data } = await axiosRequest.get(`/factories?${buildFactoriesQuery(params)}`);
  return normalizeResponse(data, params.page);
}

export function useFactoriesListQuery(params: FactoriesParams) {
  return useQuery({
    queryKey: factoryKeys.list(JSON.stringify(params)),
    queryFn: () => fetchFactoriesList(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
