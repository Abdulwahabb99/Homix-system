import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ToastContainer, toast } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { HX } from "layouts/Orders/ordersHomixTheme";
import ShipmentsKpiRow from "./components/ShipmentsKpiRow";
import ShipmentsFiltersBar, { type FilterValues } from "./components/ShipmentsFiltersBar";
import ShipmentsTable from "./components/ShipmentsTable";
import ReturnsPanel from "./components/panels/ReturnsPanel";
import InventoryPanel from "./components/panels/InventoryPanel";
import AccountsPanel, { type AccountsPanelExporter } from "./components/panels/AccountsPanel";
import { usePermissions, type PermissionKey } from "shared/permissions";
import ReportsPanel from "./components/panels/ReportsPanel";
import {
  useShipmentsListQuery,
  useShipmentsSummaryQuery,
  SHIPMENTS_LIST_PAGE_SIZE,
  type ShipmentItem,
  type ShipmentSummaryCard,
} from "query/shipmentsList";
import { fetchVendorReturns, type ReturnsParams } from "query/shipmentsReturns";
import { fetchShipmentsInventory, type InventoryParams } from "query/shipmentsInventory";
import { fetchDeliveryAccounts, type AccountsParams } from "query/shipmentsAccounts";
import { fetchShipmentsPerformance, type PerformanceParams } from "query/shipmentsPerformance";
import { useShipmentsMetaQuery, type ShipmentsMeta } from "query/shipmentsMeta";
import { shipmentKeys } from "query/keys";
import moment from "moment";

const FONT = "'Cairo', sans-serif";

type ShipmentTabId = "shipments" | "returns" | "inventory" | "accounts" | "reports";

const DEFAULT_VENDOR_RETURNS_PARAMS: ReturnsParams = {
  page: 1, orderNumber: "", operationCode: "", status: "", sellerName: "",
};
const DEFAULT_INVENTORY_PARAMS: InventoryParams = { page: 1 };
const DEFAULT_ACCOUNTS_PARAMS: AccountsParams = {
  page: 1, accountingStatus: "", orderNumber: "", paymentMethod: "", settledDate: "",
};
const DEFAULT_PERFORMANCE_PARAMS: PerformanceParams = {
  endDate: moment().format("YYYY-MM-DD"),
  period: "daily",
  startDate: moment().startOf("month").format("YYYY-MM-DD"),
};

// Once a panel has been visited it stays mounted; memoization prevents an
// unrelated main-tab click from rendering every hidden panel again.
const MemoizedReturnsPanel = React.memo(ReturnsPanel);
const MemoizedInventoryPanel = React.memo(InventoryPanel);
const MemoizedAccountsPanel = React.memo(AccountsPanel);
const MemoizedReportsPanel = React.memo(ReportsPanel);

const MAIN_TABS: { id: ShipmentTabId; label: string; icon: React.ReactNode; permission?: PermissionKey }[] = [
  {
    id: "shipments",
    label: "الشحنات",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "returns",
    label: "المرتجعات",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.1" />
      </svg>
    ),
  },
  {
    id: "inventory",
    label: "المخزون",
    permission: "ship_view",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "accounts",
    label: "الحسابات",
    permission: "finance_view",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "تقارير الأداء",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

function toIso(v: any): string | undefined {
  if (!v) return undefined;
  const m = moment.isMoment(v) ? v : moment.utc(String(v), "DD-MM-YYYY");
  return m.isValid() ? m.toISOString() : undefined;
}

function dateFromUrl(str: string): any {
  if (!str) return null;
  const m = moment(str, "DD-MM-YYYY");
  return m.isValid() ? m : null;
}

interface ShipmentsTabContentProps {
  cards?: ShipmentSummaryCard[];
  isSummaryLoading: boolean;
  filterDefaults: FilterValues;
  meta?: ShipmentsMeta;
  isVendor: boolean;
  onApply: (values: FilterValues) => void;
  onReset: () => void;
  shipments: ShipmentItem[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (shipment: ShipmentItem) => void;
  onDelete: (shipment: ShipmentItem) => void;
}

const ShipmentsTabContent = React.memo(function ShipmentsTabContent({
  cards,
  isSummaryLoading,
  filterDefaults,
  meta,
  isVendor,
  onApply,
  onReset,
  shipments,
  isLoading,
  isFetching,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
}: ShipmentsTabContentProps) {
  return (
    <>
      <ShipmentsKpiRow cards={cards} isLoading={isSummaryLoading} />
      <ShipmentsFiltersBar
        defaultValues={filterDefaults}
        meta={meta}
        isVendor={isVendor}
        onApply={onApply}
        onReset={onReset}
      />
      <ShipmentsTable
        shipments={shipments}
        isVendor={isVendor}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
});

export default function Shipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const isVendor = user.userType === "2";

  const page = parseInt(searchParams.get("page")) || 1;
  const [activeTab, setActiveTab] = useState<ShipmentTabId>("shipments");
  const [visitedTabs, setVisitedTabs] = useState<Set<ShipmentTabId>>(
    () => new Set<ShipmentTabId>(["shipments"])
  );
  const { can } = usePermissions();

  /* Tabs the user has no permission for are hidden outright — showing them only
     to fail with a 403 reads as a broken module. */
  const visibleTabs = MAIN_TABS.filter((tab) => !tab.permission || can(tab.permission));
  const isTabVisible = (id: string) => visibleTabs.some((tab) => tab.id === id);

  // Start the default request during the user's pointer/focus travel to the tab.
  // React Query de-duplicates it if the panel mounts before the request finishes.
  const prefetchTab = (tabId: ShipmentTabId) => {
    switch (tabId) {
      case "returns":
        void queryClient.prefetchQuery({
          queryKey: shipmentKeys.returns("vendor", JSON.stringify(DEFAULT_VENDOR_RETURNS_PARAMS)),
          queryFn: () => fetchVendorReturns(DEFAULT_VENDOR_RETURNS_PARAMS),
          staleTime: 30_000,
        });
        break;
      case "inventory":
        void queryClient.prefetchQuery({
          queryKey: shipmentKeys.inventory(JSON.stringify(DEFAULT_INVENTORY_PARAMS)),
          queryFn: () => fetchShipmentsInventory(DEFAULT_INVENTORY_PARAMS),
          staleTime: 30_000,
        });
        break;
      case "accounts":
        void queryClient.prefetchQuery({
          queryKey: shipmentKeys.accounts("deliveries", JSON.stringify(DEFAULT_ACCOUNTS_PARAMS)),
          queryFn: () => fetchDeliveryAccounts(DEFAULT_ACCOUNTS_PARAMS),
          staleTime: 30_000,
        });
        break;
      case "reports":
        void queryClient.prefetchQuery({
          queryKey: shipmentKeys.performance(JSON.stringify(DEFAULT_PERFORMANCE_PARAMS)),
          queryFn: () => fetchShipmentsPerformance(DEFAULT_PERFORMANCE_PARAMS),
          staleTime: 60_000,
        });
        break;
      default:
        break;
    }
  };

  const markTabVisited = (tabId: ShipmentTabId) => {
    setVisitedTabs((current) => {
      if (current.has(tabId)) return current;
      const next = new Set(current);
      next.add(tabId);
      return next;
    });
  };

  const prepareTab = (tabId: ShipmentTabId) => {
    prefetchTab(tabId);
    if (tabId !== "shipments") {
      // Render the panel at low priority while the pointer is travelling to it,
      // rather than doing all of that synchronous work in the click itself.
      React.startTransition(() => markTabVisited(tabId));
    }
  };

  const handleTabChange = (tabId: ShipmentTabId) => {
    if (tabId === activeTab) return;
    markTabVisited(tabId);
    setActiveTab(tabId);
  };

  // All filter values come from URL
  const operationCode  = searchParams.get("operationCode")  || "";
  const orderNumber    = searchParams.get("orderNumber")    || "";
  const customerName   = searchParams.get("customerName")   || "";
  const customerPhone  = searchParams.get("customerPhone")  || "";
  const shipmentStatus = searchParams.get("shipmentStatus") || "";
  const paymentStatus  = searchParams.get("paymentStatus")  || "";
  const shipmentType   = searchParams.get("shipmentType")   || "";
  const deliveryBy     = searchParams.get("deliveryBy")     || "";
  const shippingCompany = searchParams.get("shippingCompany") || "";
  const scheduleStatus = searchParams.get("scheduleStatus") || "";
  const vendorName     = searchParams.get("vendorName")     || "";
  const startDateParam = searchParams.get("startDate") || "";
  const endDateParam   = searchParams.get("endDate") || "";
  const startDate      = React.useMemo(() => dateFromUrl(startDateParam), [startDateParam]);
  const endDate        = React.useMemo(() => dateFromUrl(endDateParam), [endDateParam]);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment]   = useState<ShipmentItem | null>(null);
  const [isExportLoading, setIsExportLoading]     = useState(false);
  const [accountsExporter, setAccountsExporter] = useState<AccountsPanelExporter | null>(null);
  const [returnsExporter, setReturnsExporter] = useState<AccountsPanelExporter | null>(null);
  const [inventoryExporter, setInventoryExporter] = useState<AccountsPanelExporter | null>(null);
  const [reportsExporter, setReportsExporter] = useState<AccountsPanelExporter | null>(null);

  // React Query
  const queryParams = React.useMemo(() => ({
    page, operationCode, orderNumber, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, shippingCompany,
    scheduleStatus, vendorName, startDate, endDate,
  }), [
    page, operationCode, orderNumber, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, shippingCompany,
    scheduleStatus, vendorName, startDate, endDate,
  ]);

  const isShipmentsTab = activeTab === "shipments";
  const { data, isLoading, isFetching }                       = useShipmentsListQuery(queryParams, isShipmentsTab);
  const { data: summaryData, isLoading: isSummaryLoading }    = useShipmentsSummaryQuery({ ...queryParams, page: 1 }, isShipmentsTab);
  const { data: metaData }                                    = useShipmentsMetaQuery();

  const shipments  = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / SHIPMENTS_LIST_PAGE_SIZE);

  const tabCountMap = Object.fromEntries(
    (metaData?.tabs ?? []).map((t) => [t.id, t.count ?? 0])
  );
  const tabCounts = {
    shipments: tabCountMap["shipments"] ?? totalCount,
    returns:   tabCountMap["returns"]   ?? 0,
    inventory: tabCountMap["inventory"] ?? 0,
    accounts:  tabCountMap["accounts"]  ?? 0,
    reports:   tabCountMap["performance"] ?? 0,
  };

  // Apply all filter values to URL at once
  const handleApply = React.useCallback((values: FilterValues) => {
    const urlParams = new URLSearchParams();
    if (values.operationCode)  urlParams.set("operationCode",  values.operationCode);
    if (values.orderNumber)    urlParams.set("orderNumber",    values.orderNumber);
    if (values.customerName)   urlParams.set("customerName",   values.customerName);
    if (values.customerPhone)  urlParams.set("customerPhone",  values.customerPhone);
    if (values.shipmentStatus) urlParams.set("shipmentStatus", values.shipmentStatus);
    if (values.paymentStatus)  urlParams.set("paymentStatus",  values.paymentStatus);
    if (values.shipmentType)   urlParams.set("shipmentType",   values.shipmentType);
    if (values.deliveryBy)     urlParams.set("deliveryBy",     values.deliveryBy);
    if (values.shippingCompany) urlParams.set("shippingCompany", values.shippingCompany);
    if (values.scheduleStatus) urlParams.set("scheduleStatus", values.scheduleStatus);
    if (values.vendorName)     urlParams.set("vendorName",     values.vendorName);
    if (values.startDate) {
      const m = moment.isMoment(values.startDate)
        ? values.startDate
        : moment(values.startDate, "DD-MM-YYYY");
      if (m.isValid()) urlParams.set("startDate", m.format("DD-MM-YYYY"));
    }
    if (values.endDate) {
      const m = moment.isMoment(values.endDate)
        ? values.endDate
        : moment(values.endDate, "DD-MM-YYYY");
      if (m.isValid()) urlParams.set("endDate", m.format("DD-MM-YYYY"));
    }
    urlParams.set("page", "1");
    navigate(`?${urlParams.toString()}`);
  }, [navigate]);

  const handleReset = React.useCallback(() => navigate("?"), [navigate]);

  const updatePageParam = React.useCallback((value: number) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", String(value));
    navigate(`?${urlParams.toString()}`);
  }, [navigate]);

  // Export
  const handleExport = async () => {
    const panelExporter = activeTab === "accounts"
      ? accountsExporter
      : activeTab === "returns"
        ? returnsExporter
        : activeTab === "inventory"
          ? inventoryExporter
          : activeTab === "reports"
            ? reportsExporter
            : null;
    if (activeTab !== "shipments") {
      if (!panelExporter) return;
      setIsExportLoading(true);
      try {
        await panelExporter.run();
        toast.success(panelExporter.successMessage);
      } catch {
        toast.error("حدث خطأ أثناء التصدير");
      } finally {
        setIsExportLoading(false);
      }
      return;
    }

    if (activeTab !== "shipments") return;
    const q = new URLSearchParams();
    if (operationCode)  q.set("operationCode",  operationCode);
    if (orderNumber)    q.set("orderNumber",    orderNumber);
    if (customerName)   q.set("customerName",   customerName);
    if (customerPhone)  q.set("customerPhone",  customerPhone);
    if (shipmentStatus) q.set("shipmentStatus", shipmentStatus);
    if (paymentStatus)  q.set("paymentStatus",  paymentStatus);
    if (shipmentType)   q.set("shipmentType",   shipmentType);
    if (deliveryBy)     q.set("deliveryBy",     deliveryBy);
    if (shippingCompany) q.set("shippingCompany", shippingCompany);
    if (scheduleStatus) q.set("scheduleStatus", scheduleStatus);
    if (vendorName)     q.set("vendorName",     vendorName);
    const sIso = toIso(startDate);
    const eIso = toIso(endDate);
    if (sIso) q.set("startDate", sIso);
    if (eIso) q.set("endDate",   eIso);

    setIsExportLoading(true);
    // طلب GET واحد موثّق بالتوكن، ثم يُحفظ الملف من نفس الاستجابة — بلا تنقّل
    try {
      const response = await axiosRequest.get(`/shipments/export?${q}`, { responseType: "blob" });
      downloadBlobResponse(response, `shipments-${moment().locale("en").format("YYYY-MM-DD")}.xlsx`);
    } catch {
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExportLoading(false);
    }
  };

  const canExportActiveTab = activeTab === "shipments"
    || (activeTab === "accounts" && accountsExporter !== null)
    || (activeTab === "returns" && returnsExporter !== null)
    || (activeTab === "inventory" && inventoryExporter !== null)
    || (activeTab === "reports" && reportsExporter !== null);

  // Mutations
  const deleteShipment = () => {
    if (!selectedShipment) return;
    axiosRequest
      .delete(`${process.env.REACT_APP_API_URL}/shipments/${selectedShipment.id}`)
      .then(() => {
        setIsDeleteModalOpen(false);
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.summariesRoot() });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() });
      });
  };

  // Default values snapshot for filter bar (from current URL)
  const filterDefaults: FilterValues = React.useMemo(() => ({
    operationCode, orderNumber, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, shippingCompany,
    scheduleStatus, vendorName, startDate, endDate,
  }), [
    operationCode, orderNumber, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, shippingCompany,
    scheduleStatus, vendorName, startDate, endDate,
  ]);

  const handleEditShipment = React.useCallback(
    (shipment: ShipmentItem) => navigate(`/shipments/edit/${shipment.id}`),
    [navigate]
  );
  const handleDeleteShipment = React.useCallback((shipment: ShipmentItem) => {
    setSelectedShipment(shipment);
    setIsDeleteModalOpen(true);
  }, []);

  return (
    <DashboardLayout
      pageTitle="الشحن والتوصيل"
      pageSubtitle="إدارة الشحنات، المرتجعات، المخزون، الحسابات، وتقارير الأداء"
      pageActions={
        <>
          {canExportActiveTab && <Box
            component="button"
            type="button"
            title="تصدير"
            onClick={() => void handleExport()}
            disabled={isExportLoading}
            sx={{
              display: "flex", alignItems: "center", gap: "5px",
              px: "13px", height: 36, borderRadius: "9px",
              border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
              color: HX.tx2, cursor: isExportLoading ? "default" : "pointer",
              fontSize: "13px", fontFamily: FONT, fontWeight: 600, flexShrink: 0,
              opacity: isExportLoading ? 0.6 : 1,
              transition: ".15s", "&:hover": { bgcolor: HX.surface3, color: HX.tx },
            }}
          >
            {isExportLoading
              ? <CircularProgress size={14} sx={{ color: HX.tx2 }} />
              : <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
            }
            تصدير
          </Box>}
          {!isVendor && (
            <Box
              component="button"
              type="button"
              onClick={() => navigate("/shipments/add")}
              sx={{
                display: "flex", alignItems: "center", gap: "6px",
                px: "15px", height: 36, borderRadius: "9px",
                border: "none", bgcolor: HX.accent, color: "#fff",
                cursor: "pointer", fontSize: "13px", fontFamily: FONT,
                fontWeight: 700, flexShrink: 0,
                transition: ".2s", "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              شحنة جديدة
            </Box>
          )}
        </>
      }
    >
      <ToastContainer />

      {isDeleteModalOpen && selectedShipment && (
        <ConfirmDeleteModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          handleConfirmDelete={deleteShipment}
        />
      )}

      <Box sx={{ fontFamily: FONT, mt: "16px" }}>
        {/* Main tabs */}
        <Box
          role="tablist"
          aria-label="أقسام الشحن والتوصيل"
          sx={{
            display: "flex",
            gap: "4px",
            mb: "16px",
            bgcolor: HX.surface,
            borderRadius: "12px",
            border: `1px solid ${HX.border}`,
            p: "4px",
            width: "100%",
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {visibleTabs.map((tab) => {
            const active = activeTab === tab.id;
            const count = tabCounts[tab.id as keyof typeof tabCounts] ?? 0;
            return (
              <Box
                key={tab.id}
                component="button"
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`shipment-tab-panel-${tab.id}`}
                onPointerEnter={() => prepareTab(tab.id)}
                onFocus={() => prepareTab(tab.id)}
                onClick={() => handleTabChange(tab.id)}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  py: "7px",
                  px: "6px",
                  borderRadius: "9px",
                  border: "none",
                  cursor: "pointer",
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  bgcolor: active ? HX.accent : "#FFFFFF",
                  color: active ? "#fff" : HX.tx2,
                  boxShadow: active ? "0 2px 10px rgba(99,102,241,0.28)" : "none",
                  transition: "background .15s, box-shadow .15s, color .15s",
                  "&:hover": !active ? { bgcolor: HX.surface3, color: HX.tx } : {},
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, opacity: active ? 1 : 0.6 }}>
                  {tab.icon}
                </Box>
                <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 600, fontFamily: FONT }}>
                  {tab.label}
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    minWidth: "20px", height: "18px", px: "5px", borderRadius: "100px",
                    fontSize: "10.5px", fontWeight: 700, fontFamily: FONT, flexShrink: 0,
                    bgcolor: active ? "rgba(255,255,255,0.22)" : HX.surface3,
                    color: active ? "#fff" : HX.tx2,
                  }}
                >
                  {count}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Keep visited panels mounted so returning to a tab does not rebuild its
            table, filters and local state. `display: none` also removes hidden
            panels from layout and accessibility navigation. */}
        <Box
          id="shipment-tab-panel-shipments"
          role="tabpanel"
          hidden={activeTab !== "shipments"}
          sx={{ display: activeTab === "shipments" ? "flex" : "none", flexDirection: "column", gap: "14px" }}
        >
            <ShipmentsTabContent
              cards={summaryData}
              isSummaryLoading={isSummaryLoading}
              filterDefaults={filterDefaults}
              meta={metaData}
              isVendor={isVendor}
              shipments={shipments}
              isLoading={isLoading}
              isFetching={isFetching}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={updatePageParam}
              onApply={handleApply}
              onReset={handleReset}
              onEdit={handleEditShipment}
              onDelete={handleDeleteShipment}
            />
        </Box>

        {visitedTabs.has("returns") && (
          <Box id="shipment-tab-panel-returns" role="tabpanel" hidden={activeTab !== "returns"} sx={{ display: activeTab === "returns" ? "block" : "none" }}>
            <MemoizedReturnsPanel onExporterChange={setReturnsExporter} />
          </Box>
        )}
        {visitedTabs.has("inventory") && isTabVisible("inventory") && (
          <Box id="shipment-tab-panel-inventory" role="tabpanel" hidden={activeTab !== "inventory"} sx={{ display: activeTab === "inventory" ? "block" : "none" }}>
            <MemoizedInventoryPanel onExporterChange={setInventoryExporter} />
          </Box>
        )}
        {visitedTabs.has("accounts") && isTabVisible("accounts") && (
          <Box id="shipment-tab-panel-accounts" role="tabpanel" hidden={activeTab !== "accounts"} sx={{ display: activeTab === "accounts" ? "block" : "none" }}>
            <MemoizedAccountsPanel onExporterChange={setAccountsExporter} />
          </Box>
        )}
        {visitedTabs.has("reports") && (
          <Box id="shipment-tab-panel-reports" role="tabpanel" hidden={activeTab !== "reports"} sx={{ display: activeTab === "reports" ? "block" : "none" }}>
            <MemoizedReportsPanel onExporterChange={setReportsExporter} />
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
