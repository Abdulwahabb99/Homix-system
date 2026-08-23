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
import ShipmentsBulkEditModal from "./components/ShipmentsBulkEditModal";
import { useBulkUpdateShipmentsMutation, type BulkUpdateShipmentPayload } from "query/shipmentEdit";
import CombinedOrderInvoiceDocument from "layouts/Orders/orderInvoice/CombinedOrderInvoiceDocument";
import {
  downloadOrderInvoicePdf,
  printElementNatively,
} from "layouts/Orders/utils/invoicePdf";
import { normalizeOrderDetailPayload } from "layouts/Orders/orderDetail/orderDetailNormalize";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
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
import { useShipmentsMetaQuery, type ShipmentsMeta } from "query/shipmentsMeta";
import { shipmentKeys } from "query/keys";
import moment from "moment";

const FONT = "'Cairo', sans-serif";

type ShipmentTabId = "shipments" | "returns" | "inventory" | "accounts" | "reports";

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
    permission: "ship_returns_view",
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
    permission: "ship_inventory_view",
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
    permission: "ship_accounts_view",
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
    permission: "ship_performance_view",
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
  selectionModel: number[];
  onToggleSelect: (id: number) => void;
  onToggleAll: () => void;
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
  selectionModel,
  onToggleSelect,
  onToggleAll,
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
        selectionModel={selectionModel}
        onToggleSelect={onToggleSelect}
        onToggleAll={onToggleAll}
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
  const { can } = usePermissions();

  /* Tabs the user has no permission for are hidden outright — showing them only
     to fail with a 403 reads as a broken module. */
  const visibleTabs = MAIN_TABS.filter((tab) => !tab.permission || can(tab.permission));
  const isTabVisible = (id: string) => visibleTabs.some((tab) => tab.id === id);

  const clearTabQueries = (tabId: ShipmentTabId) => {
    switch (tabId) {
      case "returns":
        queryClient.removeQueries({ queryKey: shipmentKeys.returnsRoot() });
        break;
      case "inventory":
        queryClient.removeQueries({ queryKey: shipmentKeys.inventoryRoot() });
        break;
      case "accounts":
        queryClient.removeQueries({ queryKey: shipmentKeys.accountsRoot() });
        break;
      case "reports":
        queryClient.removeQueries({ queryKey: shipmentKeys.performanceRoot() });
        break;
      case "shipments":
        queryClient.removeQueries({ queryKey: shipmentKeys.lists() });
        queryClient.removeQueries({ queryKey: shipmentKeys.summariesRoot() });
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tabId: ShipmentTabId) => {
    if (tabId === activeTab) return;
    clearTabQueries(activeTab);
    clearTabQueries(tabId);
    setActiveTab(tabId);
    setShipmentSelectionModel([]);
    void queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() });
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
  const governorate    = searchParams.get("governorate")    || "";
  const vendorName     = searchParams.get("vendorName")     || "";
  const startDateParam = searchParams.get("startDate") || "";
  const endDateParam   = searchParams.get("endDate") || "";
  const startDate      = React.useMemo(() => dateFromUrl(startDateParam), [startDateParam]);
  const endDate        = React.useMemo(() => dateFromUrl(endDateParam), [endDateParam]);
  const deliveryDateFromParam = searchParams.get("deliveryDateFrom") || "";
  const deliveryDateToParam   = searchParams.get("deliveryDateTo") || "";
  const deliveryDateFrom      = React.useMemo(() => dateFromUrl(deliveryDateFromParam), [deliveryDateFromParam]);
  const deliveryDateTo        = React.useMemo(() => dateFromUrl(deliveryDateToParam), [deliveryDateToParam]);
  const scheduledDateFromParam = searchParams.get("scheduledDateFrom") || "";
  const scheduledDateToParam   = searchParams.get("scheduledDateTo") || "";
  const scheduledDateFrom      = React.useMemo(() => dateFromUrl(scheduledDateFromParam), [scheduledDateFromParam]);
  const scheduledDateTo        = React.useMemo(() => dateFromUrl(scheduledDateToParam), [scheduledDateToParam]);

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
    scheduleStatus, governorate, vendorName, startDate, endDate,
    deliveryDateFrom, deliveryDateTo, scheduledDateFrom, scheduledDateTo,
  }), [
    page, operationCode, orderNumber, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, shippingCompany,
    scheduleStatus, governorate, vendorName, startDate, endDate,
    deliveryDateFrom, deliveryDateTo, scheduledDateFrom, scheduledDateTo,
  ]);

  const isShipmentsTab = activeTab === "shipments";
  const { data, isLoading, isFetching }                       = useShipmentsListQuery(queryParams, isShipmentsTab);
  const { data: summaryData, isLoading: isSummaryLoading }    = useShipmentsSummaryQuery({ ...queryParams, page: 1 }, isShipmentsTab);
  const { data: metaData }                                    = useShipmentsMetaQuery();

  const shipments  = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / SHIPMENTS_LIST_PAGE_SIZE);

  // Bulk edit — shipment status / type / governorate / delivery-by / assignee
  const [shipmentSelectionModel, setShipmentSelectionModel] = useState<number[]>([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const bulkUpdateShipmentsMutation = useBulkUpdateShipmentsMutation();

  const toggleShipmentSelect = React.useCallback((id: number) => {
    setShipmentSelectionModel((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }, []);

  const toggleShipmentSelectAll = React.useCallback(() => {
    setShipmentSelectionModel((current) => {
      const allSelected = shipments.length > 0 && shipments.every((s) => current.includes(s.id));
      if (allSelected) {
        return current.filter((id) => !shipments.some((s) => s.id === id));
      }
      const toAdd = shipments.map((s) => s.id).filter((id) => !current.includes(id));
      return [...current, ...toAdd];
    });
  }, [shipments]);

  const handleBulkEditShipments = (bulkData: BulkUpdateShipmentPayload) => {
    bulkUpdateShipmentsMutation.mutate(
      { data: bulkData, shipmentIds: shipmentSelectionModel },
      {
        onSuccess: () => {
          setIsBulkEditModalOpen(false);
          setShipmentSelectionModel([]);
        },
      }
    );
  };

  // طباعة الشحنات المحددة كفاتورة واحدة — شحنة = صف طلب، فتُجلب بنفس نقطة
  // /orders/:id ويُبنى منها نفس مستند الفاتورة المجمّعة المستخدم في صفحة الطلبات.
  const [printOrders, setPrintOrders] = useState<any[] | null>(null);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);
  const printContainerRef = React.useRef<HTMLDivElement | null>(null);

  const handleBulkPrintInvoice = async () => {
    if (!shipmentSelectionModel.length) return;
    setIsPrintingInvoice(true);
    try {
      const results = await Promise.all(
        shipmentSelectionModel.map((id) =>
          axiosRequest
            .get(`/orders/${id}`)
            .then((res) => normalizeOrderDetailPayload(res.data))
            .catch(() => null)
        )
      );
      const validOrders = results.filter(Boolean);
      if (validOrders.length === 0) {
        NotificationMeassage("error", "تعذر تجهيز الفاتورة المجمّعة");
        setIsPrintingInvoice(false);
        return;
      }
      if (validOrders.length < shipmentSelectionModel.length) {
        NotificationMeassage(
          "error",
          `تعذر تحميل ${shipmentSelectionModel.length - validOrders.length} من الشحنات المحددة`
        );
      }
      setPrintOrders(validOrders);
    } catch {
      NotificationMeassage("error", "حدث خطأ أثناء تجهيز الفاتورة");
      setIsPrintingInvoice(false);
    }
  };

  React.useEffect(() => {
    if (!printOrders || printOrders.length === 0) return;
    let cancelled = false;
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (cancelled) return;
      if (!printContainerRef.current) {
        NotificationMeassage("error", "تعذر تجهيز الفاتورة المجمّعة");
        setIsPrintingInvoice(false);
        setPrintOrders(null);
        return;
      }
      try {
        await downloadOrderInvoicePdf(
          printContainerRef.current,
          `فاتورة-مجمعة-${printOrders.length}-شحنات-${moment().format("YYYY-MM-DD")}`
        );
        NotificationMeassage("success", "تم تحميل الفاتورة المجمّعة");
      } catch {
        // الموبايل قد يعجز عن رسم canvas بهذا الحجم — نرجع لطباعة المتصفح الأصلية.
        NotificationMeassage("error", "تعذر تصدير الفاتورة — سيُفتح مربع الطباعة");
        if (printContainerRef.current) printElementNatively(printContainerRef.current);
      } finally {
        if (!cancelled) {
          setIsPrintingInvoice(false);
          setPrintOrders(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [printOrders]);

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
    if (values.governorate)    urlParams.set("governorate",    values.governorate);
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
    const setDateParam = (key: string, value: any) => {
      if (!value) return;
      const m = moment.isMoment(value) ? value : moment(value, "DD-MM-YYYY");
      if (m.isValid()) urlParams.set(key, m.format("DD-MM-YYYY"));
    };
    setDateParam("deliveryDateFrom", values.deliveryDateFrom);
    setDateParam("deliveryDateTo", values.deliveryDateTo);
    setDateParam("scheduledDateFrom", values.scheduledDateFrom);
    setDateParam("scheduledDateTo", values.scheduledDateTo);
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
    if (governorate)    q.set("governorate",    governorate);
    const sIso = toIso(startDate);
    const eIso = toIso(endDate);
    if (sIso) q.set("startDate", sIso);
    if (eIso) q.set("endDate",   eIso);
    const dIso  = toIso(deliveryDateFrom);
    const dtIso = toIso(deliveryDateTo);
    if (dIso)  q.set("deliveryDateFrom", dIso);
    if (dtIso) q.set("deliveryDateTo",   dtIso);
    const schIso  = toIso(scheduledDateFrom);
    const schtIso = toIso(scheduledDateTo);
    if (schIso)  q.set("scheduledDateFrom", schIso);
    if (schtIso) q.set("scheduledDateTo",   schtIso);

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
    scheduleStatus, governorate, vendorName, startDate, endDate,
    deliveryDateFrom, deliveryDateTo, scheduledDateFrom, scheduledDateTo,
  }), [
    operationCode, orderNumber, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, shippingCompany,
    scheduleStatus, governorate, vendorName, startDate, endDate,
    deliveryDateFrom, deliveryDateTo, scheduledDateFrom, scheduledDateTo,
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
          {!isVendor && activeTab === "shipments" && shipmentSelectionModel.length > 0 && (
            <Box
              component="button"
              type="button"
              onClick={() => setIsBulkEditModalOpen(true)}
              sx={{
                display: "flex", alignItems: "center", gap: "6px",
                px: "13px", height: 36, borderRadius: "9px",
                border: `1px solid ${HX.accent}`, bgcolor: HX.accentLight,
                color: HX.accent, cursor: "pointer",
                fontSize: "13px", fontFamily: FONT, fontWeight: 700, flexShrink: 0,
                transition: ".15s", "&:hover": { bgcolor: HX.accent, color: "#fff" },
              }}
            >
              تعديل المحدد ({shipmentSelectionModel.length})
            </Box>
          )}
          {!isVendor && activeTab === "shipments" && shipmentSelectionModel.length > 0 && (
            <Box
              component="button"
              type="button"
              onClick={() => void handleBulkPrintInvoice()}
              disabled={isPrintingInvoice}
              sx={{
                display: "flex", alignItems: "center", gap: "6px",
                px: "13px", height: 36, borderRadius: "9px",
                border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
                color: HX.tx2, cursor: isPrintingInvoice ? "default" : "pointer",
                fontSize: "13px", fontFamily: FONT, fontWeight: 700, flexShrink: 0,
                opacity: isPrintingInvoice ? 0.6 : 1,
                transition: ".15s", "&:hover": { bgcolor: HX.surface3, color: HX.tx },
              }}
            >
              {isPrintingInvoice ? "جارٍ التجهيز..." : `طباعة كفاتورة واحدة (${shipmentSelectionModel.length})`}
            </Box>
          )}
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

      {printOrders && printOrders.length > 0 && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: 800,
            zIndex: -1,
            pointerEvents: "none",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <CombinedOrderInvoiceDocument ref={printContainerRef} orders={printOrders} />
        </div>
      )}

      {isDeleteModalOpen && selectedShipment && (
        <ConfirmDeleteModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          handleConfirmDelete={deleteShipment}
        />
      )}

      {isBulkEditModalOpen && (
        <ShipmentsBulkEditModal
          open={isBulkEditModalOpen}
          selectedCount={shipmentSelectionModel.length}
          onEdit={handleBulkEditShipments}
          onClose={() => setIsBulkEditModalOpen(false)}
          isSaving={bulkUpdateShipmentsMutation.isPending}
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
            {activeTab === "shipments" && <ShipmentsTabContent
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
              selectionModel={shipmentSelectionModel}
              onToggleSelect={toggleShipmentSelect}
              onToggleAll={toggleShipmentSelectAll}
            />}
        </Box>

        {activeTab === "returns" && (
          <Box id="shipment-tab-panel-returns" role="tabpanel">
            <MemoizedReturnsPanel onExporterChange={setReturnsExporter} />
          </Box>
        )}
        {activeTab === "inventory" && isTabVisible("inventory") && (
          <Box id="shipment-tab-panel-inventory" role="tabpanel">
            <MemoizedInventoryPanel onExporterChange={setInventoryExporter} />
          </Box>
        )}
        {activeTab === "accounts" && isTabVisible("accounts") && (
          <Box id="shipment-tab-panel-accounts" role="tabpanel">
            <MemoizedAccountsPanel onExporterChange={setAccountsExporter} />
          </Box>
        )}
        {activeTab === "reports" && (
          <Box id="shipment-tab-panel-reports" role="tabpanel">
            <MemoizedReportsPanel onExporterChange={setReportsExporter} />
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
