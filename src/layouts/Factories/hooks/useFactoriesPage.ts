/**
 * منطق صفحة الصنّاع فوق الـ API:
 *   GET /factories/meta   → خيارات القوائم
 *   GET /factories        → القائمة + الترقيم + الملخّص (فلترة وترتيب على الخادم)
 *   POST/PUT/DELETE       → عبر `query/factoryMutations`
 *
 * القوائم تُطبَّق فوراً وحقل البحث بعد تهدئة الكتابة، حتى لا نُطلق طلباً لكل حرف.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useFactoriesListQuery,
  type FactoriesParams,
  type FactoriesSummary,
  type FactoryListItem,
  type FactorySortDir,
} from "query/factoriesList";
import { useFactoriesMetaQuery, type FactoriesMeta } from "query/factoriesMeta";
import {
  useDeleteFactoryMutation,
  useSaveFactoryMutation,
  type FactoryUploadFile,
} from "query/factoryMutations";
import { DEFAULT_VIEW, EMPTY_FILTERS, SEARCH_DEBOUNCE_MS } from "../utils/constants";
import {
  FactoriesView,
  FactoryFilters,
  FactoryFormValues,
  FactorySortKey,
} from "../utils/types";
import { formToPayload } from "../utils/calc";

const EMPTY_SUMMARY: FactoriesSummary = {
  totalFactories: 0,
  onlineFactories: 0,
  offlineFactories: 0,
  specialtiesCount: 0,
};

export interface UseFactoriesPage {
  meta: FactoriesMeta | undefined;
  items: FactoryListItem[];
  /** ملخّص عام للمؤشرات (لا يتأثّر بالفلاتر) */
  summary: FactoriesSummary;
  /** عدد النتائج بعد الفلترة — للعدّاد والترقيم */
  totalItems: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;

  /** قيمة الحقل كما يكتبها المستخدم (قبل التهدئة) */
  filters: FactoryFilters;
  setFilter: <K extends keyof FactoryFilters>(key: K, value: FactoryFilters[K]) => void;
  applyNow: () => void;
  resetFilters: () => void;

  sortKey: FactorySortKey | null;
  sortDir: "asc" | "desc";
  toggleSort: (key: FactorySortKey) => void;

  view: FactoriesView;
  setView: (v: FactoriesView) => void;

  page: number;
  totalPages: number;
  setPage: (p: number) => void;

  /** النموذج */
  isFormOpen: boolean;
  editingId: number | null;
  openAdd: () => void;
  openEdit: (id: number) => void;
  closeForm: () => void;
  saveFactory: (values: FactoryFormValues, documents: FactoryUploadFile[]) => void;
  isSaving: boolean;

  /** الحذف */
  pendingDeleteId: number | null;
  askDelete: (id: number) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  isDeleting: boolean;
}

export function useFactoriesPage(): UseFactoriesPage {
  /** ما يظهر في الحقول */
  const [filters, setFilters] = useState<FactoryFilters>(EMPTY_FILTERS);
  /** ما يُرسل فعلاً للخادم (البحث بعد التهدئة) */
  const [applied, setApplied] = useState<FactoryFilters>(EMPTY_FILTERS);

  const [sortKey, setSortKey] = useState<FactorySortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<FactoriesView>(DEFAULT_VIEW);
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const { data: meta } = useFactoriesMetaQuery();

  const params: FactoriesParams = useMemo(
    () => ({
      page,
      search: applied.search || undefined,
      status: applied.status,
      factoryCategory: applied.factoryCategory || undefined,
      sortField: sortKey,
      sortDir: (sortDir === "asc" ? 1 : -1) as FactorySortDir,
    }),
    [page, applied, sortKey, sortDir]
  );

  const listQuery = useFactoriesListQuery(params);

  const items = listQuery.data?.items ?? [];
  const summary = listQuery.data?.summary ?? EMPTY_SUMMARY;
  const totalPages = Math.max(1, listQuery.data?.pagination.totalPages ?? 1);
  const totalItems = listQuery.data?.pagination.totalItems ?? 0;

  const saveMutation = useSaveFactoryMutation();
  const deleteMutation = useDeleteFactoryMutation();

  /* ── الفلاتر ── */
  const commit = useCallback((next: FactoryFilters) => {
    setApplied(next);
    setPage(1);
  }, []);

  const setFilter = useCallback(
    <K extends keyof FactoryFilters>(key: K, value: FactoryFilters[K]) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (key === "search") {
        debounceRef.current = setTimeout(() => commit(next), SEARCH_DEBOUNCE_MS);
      } else {
        commit(next);
      }
    },
    [filters, commit]
  );

  const applyNow = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commit(filters);
  }, [filters, commit]);

  const resetFilters = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters(EMPTY_FILTERS);
    commit(EMPTY_FILTERS);
  }, [commit]);

  /** نفس العمود يقلب الاتجاه، وعمود جديد يبدأ تصاعدياً */
  const toggleSort = useCallback((key: FactorySortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
    setPage(1);
  }, []);

  /* ── النموذج ── */
  const openAdd = useCallback(() => {
    setEditingId(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((id: number) => {
    setEditingId(id);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingId(null);
  }, []);

  const saveFactory = useCallback(
    (values: FactoryFormValues, documents: FactoryUploadFile[]) => {
      saveMutation.mutate(
        { id: editingId, body: formToPayload(values), documents },
        { onSuccess: () => closeForm() }
      );
    },
    [editingId, saveMutation, closeForm]
  );

  /* ── الحذف ── */
  const askDelete = useCallback((id: number) => setPendingDeleteId(id), []);
  const cancelDelete = useCallback(() => setPendingDeleteId(null), []);
  const confirmDelete = useCallback(() => {
    if (pendingDeleteId == null) return;
    deleteMutation.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) });
  }, [pendingDeleteId, deleteMutation]);

  return {
    meta,
    items,
    summary,
    totalItems,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,

    filters,
    setFilter,
    applyNow,
    resetFilters,

    sortKey,
    sortDir,
    toggleSort,

    view,
    setView,

    page,
    totalPages,
    setPage,

    isFormOpen,
    editingId,
    openAdd,
    openEdit,
    closeForm,
    saveFactory,
    isSaving: saveMutation.isPending,

    pendingDeleteId,
    askDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
