import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ToastContainer, toast } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import EditShipmentModal from "./components/EditShipmentModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { HX } from "layouts/Orders/ordersHomixTheme";
import ShipmentsKpiRow from "./components/ShipmentsKpiRow";
import ShipmentsFiltersBar, { type FilterValues } from "./components/ShipmentsFiltersBar";
import ShipmentsTable from "./components/ShipmentsTable";
import ReturnsPanel from "./components/panels/ReturnsPanel";
import InventoryPanel from "./components/panels/InventoryPanel";
import AccountsPanel from "./components/panels/AccountsPanel";
import ReportsPanel from "./components/panels/ReportsPanel";
import {
  useShipmentsListQuery,
  useShipmentsSummaryQuery,
  SHIPMENTS_LIST_PAGE_SIZE,
  type ShipmentItem,
} from "query/shipmentsList";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import { shipmentKeys } from "query/keys";
import moment from "moment";

const FONT = "'Cairo', sans-serif";

const MAIN_TABS: { id: string; label: string; icon: React.ReactNode }[] = [
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
    label: "المخزن",
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

export default function Shipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const isVendor = user.userType === "2";

  const page = parseInt(searchParams.get("page")) || 1;
  const [activeTab, setActiveTab] = useState("shipments");

  // All filter values come from URL
  const operationCode  = searchParams.get("operationCode")  || "";
  const customerName   = searchParams.get("customerName")   || "";
  const customerPhone  = searchParams.get("customerPhone")  || "";
  const shipmentStatus = searchParams.get("shipmentStatus") || "";
  const paymentStatus  = searchParams.get("paymentStatus")  || "";
  const shipmentType   = searchParams.get("shipmentType")   || "";
  const deliveryBy     = searchParams.get("deliveryBy")     || "";
  const vendorName     = searchParams.get("vendorName")     || "";
  const startDate      = dateFromUrl(searchParams.get("startDate") || "");
  const endDate        = dateFromUrl(searchParams.get("endDate")   || "");

  // Modal state
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment]   = useState<ShipmentItem | null>(null);
  const [vendors, setVendors] = useState<{ label: string; value: any }[]>([]);
  const [isExportLoading, setIsExportLoading]     = useState(false);

  // React Query
  const queryParams = {
    page, operationCode, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, vendorName,
    startDate, endDate,
  };

  const { data, isLoading, isFetching }                       = useShipmentsListQuery(queryParams);
  const { data: summaryData, isLoading: isSummaryLoading }    = useShipmentsSummaryQuery({ ...queryParams, page: 1 });
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

  // Fetch vendors for EditShipmentModal
  React.useEffect(() => {
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/vendors`)
      .then(({ data: { data: d } }) => setVendors(d.map((v: any) => ({ label: v.name, value: v.id }))));
  }, []);

  // Apply all filter values to URL at once
  const handleApply = (values: FilterValues) => {
    const urlParams = new URLSearchParams();
    if (values.operationCode)  urlParams.set("operationCode",  values.operationCode);
    if (values.customerName)   urlParams.set("customerName",   values.customerName);
    if (values.customerPhone)  urlParams.set("customerPhone",  values.customerPhone);
    if (values.shipmentStatus) urlParams.set("shipmentStatus", values.shipmentStatus);
    if (values.paymentStatus)  urlParams.set("paymentStatus",  values.paymentStatus);
    if (values.shipmentType)   urlParams.set("shipmentType",   values.shipmentType);
    if (values.deliveryBy)     urlParams.set("deliveryBy",     values.deliveryBy);
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
  };

  const handleReset = () => navigate("?");

  const updatePageParam = (value: number) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", String(value));
    navigate(`?${urlParams.toString()}`);
  };

  // Export
  const handleExport = () => {
    const q = new URLSearchParams();
    if (operationCode)  q.set("operationCode",  operationCode);
    if (customerName)   q.set("customerName",   customerName);
    if (customerPhone)  q.set("customerPhone",  customerPhone);
    if (shipmentStatus) q.set("shipmentStatus", shipmentStatus);
    if (paymentStatus)  q.set("paymentStatus",  paymentStatus);
    if (shipmentType)   q.set("shipmentType",   shipmentType);
    if (deliveryBy)     q.set("deliveryBy",     deliveryBy);
    if (vendorName)     q.set("vendorName",     vendorName);
    const sIso = toIso(startDate);
    const eIso = toIso(endDate);
    if (sIso) q.set("startDate", sIso);
    if (eIso) q.set("endDate",   eIso);

    setIsExportLoading(true);
    axiosRequest
      .get(`/shipments/export?${q}`)
      .then(({ request: { responseURL } }: any) => { window.location.href = responseURL; })
      .catch(() => toast.error("حدث خطأ أثناء التصدير"))
      .finally(() => setIsExportLoading(false));
  };

  // Mutations
  const handleEditShipment = (
    id: any, shipmentStatusVal: any, shipmentTypeVal: any, governorateVal: any,
    shippingCompanyVal: any, shippingFees: any, shippingReceiveDate: any, deliveryDate: any
  ) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/shipments/${id}`, {
        shipmentStatus: shipmentStatusVal, shipmentType: shipmentTypeVal, governorate: governorateVal,
        shippingCompany: shippingCompanyVal, shippingFees, shippingReceiveDate, deliveryDate,
      })
      .then(() => {
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: shipmentKeys.all() });
      });
  };

  const deleteShipment = () => {
    if (!selectedShipment) return;
    axiosRequest
      .delete(`${process.env.REACT_APP_API_URL}/shipments/${selectedShipment.id}`)
      .then(() => {
        setIsDeleteModalOpen(false);
        queryClient.invalidateQueries({ queryKey: shipmentKeys.all() });
      });
  };

  // Default values snapshot for filter bar (from current URL)
  const filterDefaults: FilterValues = {
    operationCode, customerName, customerPhone,
    shipmentStatus, paymentStatus, shipmentType, deliveryBy, vendorName,
    startDate, endDate,
  };

  return (
    <DashboardLayout
      pageTitle="الشحن والتوصيل"
      pageSubtitle="إدارة الشحنات، المرتجعات، المخزون، الحسابات، وتقارير الأداء"
      pageActions={
        <>
          <Box
            component="button"
            type="button"
            title="تصدير"
            onClick={handleExport}
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
          </Box>
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

      {isModalOpen && selectedShipment && (
        <EditShipmentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedShipment}
          vendors={vendors}
          onEdit={handleEditShipment}
        />
      )}

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
          {MAIN_TABS.map((tab) => {
            const active = activeTab === tab.id;
            const count = tabCounts[tab.id as keyof typeof tabCounts] ?? 0;
            return (
              <Box
                key={tab.id}
                component="button"
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

        {/* Shipments tab */}
        {activeTab === "shipments" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <ShipmentsKpiRow cards={summaryData} isLoading={isSummaryLoading} />

            <ShipmentsFiltersBar
              key={`${operationCode}|${customerName}|${shipmentStatus}|${vendorName}`}
              defaultValues={filterDefaults}
              meta={metaData}
              isVendor={isVendor}
              onApply={handleApply}
              onReset={handleReset}
            />

            <ShipmentsTable
              shipments={shipments}
              isVendor={isVendor}
              isLoading={isLoading}
              isFetching={isFetching}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={updatePageParam}
              onEdit={(s) => { setSelectedShipment(s); setIsModalOpen(true); }}
              onDelete={(s) => { setSelectedShipment(s); setIsDeleteModalOpen(true); }}
            />
          </Box>
        )}

        {activeTab === "returns"   && <ReturnsPanel />}
        {activeTab === "inventory" && <InventoryPanel />}
        {activeTab === "accounts"  && <AccountsPanel />}
        {activeTab === "reports"   && <ReportsPanel />}
      </Box>
    </DashboardLayout>
  );
}
