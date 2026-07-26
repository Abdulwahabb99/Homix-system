/**
 * منطق صفحة الصنّاع: الفلاتر + الترتيب + الترقيم + طريقة العرض + نموذج
 * الإضافة/التعديل + الحذف.
 *
 * نقطة الربط الوحيدة: `STATIC_FACTORIES` أدناه. عند جهوز الـ API تُستبدل بـ
 * `useQuery({ queryKey: factoryKeys.list(), queryFn: fetchFactories })` وتتحوّل
 * دوال الحفظ/الحذف إلى mutations — بقيّة الملف والمكوّنات تبقى كما هي.
 */
import { useCallback, useMemo, useState } from "react";
import { STATIC_FACTORIES, STATIC_KPI_EXTRAS } from "../data/staticFactories";
import { buildKpis, factoryToForm, filterFactories, formToFactory, sortFactories } from "../utils/calc";
import { DEFAULT_VIEW, EMPTY_FILTERS, EMPTY_FORM, FACTORIES_PAGE_SIZE } from "../utils/constants";
import {
  FactoriesView,
  Factory,
  FactoryFilters,
  FactoryFormValues,
  FactoryKpis,
} from "../utils/types";

type SortKey = "name" | "spec" | null;
type SortDir = "asc" | "desc";

export interface UseFactoriesPage {
  /** الصفحة الحالية من النتائج بعد الفلترة والترتيب */
  pageItems: Factory[];
  /** كل النتائج بعد الفلترة (لعدّاد الترويسة والترقيم) */
  filteredCount: number;
  kpis: FactoryKpis;

  filters: FactoryFilters;
  setFilter: <K extends keyof FactoryFilters>(key: K, value: FactoryFilters[K]) => void;
  resetFilters: () => void;

  sortKey: SortKey;
  sortDir: SortDir;
  toggleSort: (key: Exclude<SortKey, null>) => void;

  view: FactoriesView;
  setView: (v: FactoriesView) => void;

  page: number;
  totalPages: number;
  setPage: (p: number) => void;

  /** نموذج الإضافة/التعديل */
  isFormOpen: boolean;
  editingFactory: Factory | null;
  formInitialValues: FactoryFormValues;
  openAdd: () => void;
  openEdit: (id: number) => void;
  closeForm: () => void;
  saveFactory: (values: FactoryFormValues) => void;

  /** الحذف */
  pendingDeleteId: number | null;
  askDelete: (id: number) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}

export function useFactoriesPage(): UseFactoriesPage {
  const [factories, setFactories] = useState<Factory[]>(STATIC_FACTORIES);

  const [filters, setFilters] = useState<FactoryFilters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [view, setView] = useState<FactoriesView>(DEFAULT_VIEW);
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  /* ── الفلترة ثم الترتيب ── */
  const visible = useMemo(() => {
    const matched = filterFactories(factories, filters);
    return sortFactories(matched, sortKey, sortDir);
  }, [factories, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / FACTORIES_PAGE_SIZE));
  /** الصفحة تُقصَر عند تقلّص النتائج بدل أن تُعرض صفحة فارغة */
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => visible.slice((safePage - 1) * FACTORIES_PAGE_SIZE, safePage * FACTORIES_PAGE_SIZE),
    [visible, safePage]
  );

  const kpis = useMemo(() => buildKpis(factories, STATIC_KPI_EXTRAS), [factories]);

  /* ── الفلاتر ── */
  const setFilter = useCallback(
    <K extends keyof FactoryFilters>(key: K, value: FactoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  /** نفس العمود يقلب الاتجاه، وعمود جديد يبدأ تصاعدياً */
  const toggleSort = useCallback((key: Exclude<SortKey, null>) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
    setPage(1);
  }, []);

  /* ── النموذج ── */
  const editingFactory = useMemo(
    () => (editingId != null ? factories.find((f) => f.id === editingId) ?? null : null),
    [editingId, factories]
  );

  const formInitialValues = useMemo(
    () => (editingFactory ? factoryToForm(editingFactory) : EMPTY_FORM),
    [editingFactory]
  );

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
    (values: FactoryFormValues) => {
      const patch = formToFactory(values);
      setFactories((prev) => {
        if (editingId != null) {
          return prev.map((f) => (f.id === editingId ? { ...f, ...patch } : f));
        }
        // TODO(BE): المعرّف يأتي من الـ API؛ مؤقّتاً أعلى معرّف + 1 لتجنّب التكرار
        const nextId = prev.reduce((max, f) => Math.max(max, f.id), 0) + 1;
        return [{ ...patch, id: nextId, orders: 0, sales: 0 }, ...prev];
      });
      closeForm();
    },
    [editingId, closeForm]
  );

  /* ── الحذف ── */
  const askDelete = useCallback((id: number) => setPendingDeleteId(id), []);
  const cancelDelete = useCallback(() => setPendingDeleteId(null), []);
  const confirmDelete = useCallback(() => {
    setFactories((prev) => prev.filter((f) => f.id !== pendingDeleteId));
    setPendingDeleteId(null);
  }, [pendingDeleteId]);

  return {
    pageItems,
    filteredCount: visible.length,
    kpis,
    filters,
    setFilter,
    resetFilters,
    sortKey,
    sortDir,
    toggleSort,
    view,
    setView,
    page: safePage,
    totalPages,
    setPage,
    isFormOpen,
    editingFactory,
    formInitialValues,
    openAdd,
    openEdit,
    closeForm,
    saveFactory,
    pendingDeleteId,
    askDelete,
    cancelDelete,
    confirmDelete,
  };
}
