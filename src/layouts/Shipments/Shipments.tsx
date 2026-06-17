import React, { useEffect, useReducer, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ToastContainer } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { useDateRange } from "hooks/useDateRange";
import moment from "moment";
import EditShipmentModal from "./components/EditShipmentModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { HX } from "layouts/Orders/ordersHomixTheme";
import ShipmentsKpiRow from "./components/ShipmentsKpiRow";
import ShipmentsFiltersBar from "./components/ShipmentsFiltersBar";
import ShipmentsTable from "./components/ShipmentsTable";
import ReturnsPanel from "./components/panels/ReturnsPanel";
import InventoryPanel from "./components/panels/InventoryPanel";
import AccountsPanel from "./components/panels/AccountsPanel";
import ReportsPanel from "./components/panels/ReportsPanel";

const ITEMS_PER_PAGE = 150;
const FONT = "'Cairo', sans-serif";

const MAIN_TABS: { id: string; label: string; icon: React.ReactNode }[] = [
  {
    id: "shipments",
    label: "الشحنات",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    id: "returns",
    label: "المرتجعات",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
      </svg>
    ),
  },
  {
    id: "inventory",
    label: "المخزن",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: "accounts",
    label: "الحسابات",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: "reports",
    label: "تقارير الأداء",
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

function rangeDateToIso(d: any) {
  if (!d) return null;
  return (moment.isMoment(d) ? d : moment.utc(String(d), "DD-MM-YYYY")).toISOString();
}

interface State {
  shipments: any[];
  isLoading: boolean;
  totalPages: number;
  error: any;
  selectedShipmentStatus: string;
  selectedShipmentTybe: string;
  selectedGovernorate: string;
  selectedDeliveryStatus: string;
  orderNumber: string;
  shippingCompany: string;
  vendors: { label: string; value: any }[];
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedShipment: any;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { shipments: any[]; totalPages: number } }
  | { type: "FETCH_ERROR"; payload: any }
  | { type: "SET_FIELD"; field: string; value: any }
  | { type: "SET_VENDORS"; payload: any[] }
  | { type: "SET_MODAL_OPEN"; payload: boolean }
  | { type: "SET_DELETE_MODAL_OPEN"; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true };
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, shipments: action.payload.shipments, totalPages: action.payload.totalPages };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_VENDORS":
      return { ...state, vendors: action.payload };
    case "SET_MODAL_OPEN":
      return { ...state, isModalOpen: action.payload };
    case "SET_DELETE_MODAL_OPEN":
      return { ...state, isDeleteModalOpen: action.payload };
    default:
      return state;
  }
}

export default function Shipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const isVendor = user.userType === "2";

  const { startDate, endDate, handleDatesChange, handleReset: resetDates } = useDateRange({ defaultDays: 0 });

  const page = parseInt(searchParams.get("page")) || 1;

  const [activeTab, setActiveTab] = useState("shipments");

  const initialState: State = {
    shipments: [],
    isLoading: false,
    totalPages: 0,
    error: null,
    selectedShipmentStatus: searchParams.get("shipmentStatus") || "",
    selectedShipmentTybe: searchParams.get("shipmentType") || "",
    selectedGovernorate: searchParams.get("governorate") || "",
    selectedDeliveryStatus: searchParams.get("deliveryStatus") || "",
    orderNumber: searchParams.get("orderNumber") || "",
    shippingCompany: searchParams.get("shippingCompany") || "",
    vendors: [],
    isModalOpen: false,
    isDeleteModalOpen: false,
    selectedShipment: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const getShipments = () => {
    const shipmentStartIso = startDate ? rangeDateToIso(startDate) : null;
    const shipmentEndIso = endDate ? rangeDateToIso(endDate) : null;
    const query = new URLSearchParams({
      page: String(page),
      size: String(ITEMS_PER_PAGE),
      ...(state.selectedShipmentStatus && { shipmentStatus: state.selectedShipmentStatus }),
      ...(state.selectedShipmentTybe && { shipmentType: state.selectedShipmentTybe }),
      ...(state.selectedGovernorate && { governorate: state.selectedGovernorate }),
      ...(state.selectedDeliveryStatus && { deliveryStatus: state.selectedDeliveryStatus }),
      ...(state.orderNumber && { orderNumber: state.orderNumber }),
      ...(state.shippingCompany && { shippingCompany: state.shippingCompany }),
      ...(shipmentStartIso ? { shipmentStartDate: shipmentStartIso } : {}),
      ...(shipmentEndIso ? { shipmentEndDate: shipmentEndIso } : {}),
    });

    dispatch({ type: "FETCH_START" });
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/shipments?${query.toString()}`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
          return;
        }
        const sorted = [...data.data.shipments].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        dispatch({ type: "FETCH_SUCCESS", payload: { shipments: sorted, totalPages: data.data.totalPages } });
      })
      .catch((error) => dispatch({ type: "FETCH_ERROR", payload: error }));
  };

  const fetchVendors = () => {
    axiosRequest.get(`${process.env.REACT_APP_API_URL}/vendors`).then(({ data: { data } }) => {
      dispatch({ type: "SET_VENDORS", payload: data.map((v: any) => ({ label: v.name, value: v.id })) });
    });
  };

  const updateParams = (params: Record<string, any> = {}) => {
    const urlParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.set(key, String(value));
      } else {
        urlParams.delete(key);
      }
    });
    navigate(`?${urlParams.toString()}`);
  };

  const handleDropdownChange = (field: string, paramKey: string) => (value: string) => {
    dispatch({ type: "SET_FIELD", field, value });
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", "1");
    if (value) urlParams.set(paramKey, value);
    else urlParams.delete(paramKey);
    const url = new URL(window.location.href);
    url.search = urlParams.toString();
    window.history.pushState({}, "", url);
  };

  const handleReset = () => {
    dispatch({ type: "SET_FIELD", field: "selectedShipmentStatus", value: "" });
    dispatch({ type: "SET_FIELD", field: "selectedShipmentTybe", value: "" });
    dispatch({ type: "SET_FIELD", field: "selectedGovernorate", value: "" });
    dispatch({ type: "SET_FIELD", field: "selectedDeliveryStatus", value: "" });
    dispatch({ type: "SET_FIELD", field: "orderNumber", value: "" });
    dispatch({ type: "SET_FIELD", field: "shippingCompany", value: "" });
    if (resetDates) resetDates();
    const urlParams = new URLSearchParams();
    const url = new URL(window.location.href);
    url.search = urlParams.toString();
    window.history.pushState({}, "", url);
    setTimeout(() => getShipments(), 50);
  };

  const handleEditShipment = (
    id: any,
    shipmentStatus: any,
    shipmentType: any,
    governorate: any,
    shippingCompany: any,
    shippingFees: any,
    shippingReceiveDate: any,
    deliveryDate: any
  ) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/shipments/${id}`, {
        shipmentStatus,
        shipmentType,
        governorate,
        shippingCompany,
        shippingFees,
        shippingReceiveDate,
        deliveryDate,
      })
      .then(({ data: { data } }) => {
        dispatch({ type: "SET_MODAL_OPEN", payload: false });
        const updated = state.shipments.map((s) =>
          s.id === id ? { ...data, customer: s.customer } : s
        );
        dispatch({ type: "FETCH_SUCCESS", payload: { shipments: updated, totalPages: state.totalPages } });
      })
      .catch((error) => dispatch({ type: "FETCH_ERROR", payload: error }));
  };

  const deleteShipment = () => {
    axiosRequest
      .delete(`${process.env.REACT_APP_API_URL}/shipments/${state.selectedShipment.id}`)
      .then(() => {
        const updated = state.shipments.filter((s) => s.id !== state.selectedShipment.id);
        dispatch({ type: "FETCH_SUCCESS", payload: { shipments: updated, totalPages: state.totalPages } });
        dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: false });
      })
      .catch((error) => dispatch({ type: "FETCH_ERROR", payload: error }));
  };

  useEffect(() => { fetchVendors(); }, []);

  useEffect(() => {
    getShipments();
  }, [
    page,
    state.selectedShipmentStatus,
    state.selectedShipmentTybe,
    state.selectedGovernorate,
    state.selectedDeliveryStatus,
    startDate,
    endDate,
    state.orderNumber,
    state.shippingCompany,
  ]);

  const { shipments, isLoading, vendors, totalPages } = state;

  return (
    <DashboardLayout>
      <ToastContainer />

      {state.isModalOpen && (
        <EditShipmentModal
          open={state.isModalOpen}
          onClose={() => dispatch({ type: "SET_MODAL_OPEN", payload: false })}
          data={state.selectedShipment}
          vendors={vendors}
          onEdit={handleEditShipment}
        />
      )}

      {state.isDeleteModalOpen && state.selectedShipment && (
        <ConfirmDeleteModal
          open={state.isDeleteModalOpen}
          onClose={() => dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: false })}
          handleConfirmDelete={deleteShipment}
        />
      )}

      <Box sx={{ fontFamily: FONT }}>
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "20px", flexWrap: "wrap", gap: "10px" }}>
          <Box>
            <Box sx={{ fontSize: "20px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
              الشحنات
            </Box>
            <Box sx={{ fontSize: "12px", color: HX.tx2, fontFamily: FONT, mt: "2px" }}>
              إدارة ومتابعة الشحنات
            </Box>
          </Box>
          {!isVendor && (
            <Box
              component="button"
              type="button"
              onClick={() => navigate("/shipments/add")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                px: "16px",
                py: "9px",
                borderRadius: "10px",
                border: "none",
                bgcolor: HX.accent,
                color: "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: FONT,
                fontWeight: 700,
                transition: ".2s",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              إضافة شحنة
            </Box>
          )}
        </Box>

        {/* Main tabs */}
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            mb: "20px",
            bgcolor: HX.surface,
            borderRadius: "14px",
            border: `1px solid ${HX.border}`,
            p: "5px",
            width: "100%",
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {MAIN_TABS.map((tab) => {
            const active = activeTab === tab.id;
            const count = tab.id === "shipments" ? shipments.length : null;
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
                  gap: "7px",
                  py: "10px",
                  px: "6px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  bgcolor: active ? HX.accent : "transparent",
                  color: active ? "#fff" : HX.tx2,
                  boxShadow: active ? "0 2px 10px rgba(99,102,241,0.30)" : "none",
                  transition: "background .15s, box-shadow .15s, color .15s",
                  "&:hover": !active ? { bgcolor: HX.surface3, color: HX.tx } : {},
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    opacity: active ? 1 : 0.65,
                  }}
                >
                  {tab.icon}
                </Box>

                {/* Label */}
                <Box
                  component="span"
                  sx={{ fontSize: "13px", fontWeight: 600, fontFamily: FONT }}
                >
                  {tab.label}
                </Box>

                {/* Count badge */}
                {count != null && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "22px",
                      height: "20px",
                      px: "6px",
                      borderRadius: "100px",
                      fontSize: "11px",
                      fontWeight: 700,
                      fontFamily: FONT,
                      flexShrink: 0,
                      bgcolor: active ? "rgba(255,255,255,0.22)" : HX.surface3,
                      color: active ? "#fff" : HX.tx2,
                    }}
                  >
                    {count}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Shipments tab */}
        {activeTab === "shipments" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ShipmentsKpiRow shipments={shipments} isLoading={isLoading} />

            <ShipmentsFiltersBar
              selectedShipmentStatus={state.selectedShipmentStatus}
              selectedShipmentType={state.selectedShipmentTybe}
              selectedGovernorate={state.selectedGovernorate}
              orderNumber={state.orderNumber}
              shippingCompany={state.shippingCompany}
              isVendor={isVendor}
              startDate={startDate}
              endDate={endDate}
              onStatusChange={handleDropdownChange("selectedShipmentStatus", "shipmentStatus")}
              onTypeChange={handleDropdownChange("selectedShipmentTybe", "shipmentType")}
              onGovernorateChange={handleDropdownChange("selectedGovernorate", "governorate")}
              onOrderNumberChange={(v) => {
                dispatch({ type: "SET_FIELD", field: "orderNumber", value: v });
                updateParams({ orderNumber: v || undefined, page: 1 });
              }}
              onShippingCompanyChange={(v) => {
                dispatch({ type: "SET_FIELD", field: "shippingCompany", value: v });
                updateParams({ shippingCompany: v || undefined, page: 1 });
              }}
              onDatesChange={handleDatesChange}
              onDateReset={resetDates}
              onReset={handleReset}
            />

            <ShipmentsTable
              shipments={shipments}
              isVendor={isVendor}
              isLoading={isLoading}
              page={page}
              totalPages={totalPages}
              onPageChange={(value) => updateParams({ page: value })}
              onEdit={(s) => {
                dispatch({ type: "SET_FIELD", field: "selectedShipment", value: s });
                dispatch({ type: "SET_MODAL_OPEN", payload: true });
              }}
              onDelete={(s) => {
                dispatch({ type: "SET_FIELD", field: "selectedShipment", value: s });
                dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: true });
              }}
            />
          </Box>
        )}

        {activeTab === "returns" && <ReturnsPanel />}
        {activeTab === "inventory" && <InventoryPanel />}
        {activeTab === "accounts" && <AccountsPanel />}
        {activeTab === "reports" && <ReportsPanel />}
      </Box>
    </DashboardLayout>
  );
}
