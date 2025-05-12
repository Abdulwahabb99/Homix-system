import React, { useEffect, useReducer } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Spinner from "components/Spinner/Spinner";
import { ToastContainer } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import moment from "moment";
import { useDateRange } from "hooks/useDateRange";
import EditShipmentModal from "./components/EditShipmentModal";
import { SHIPMENT_STATUS_VALUES } from "shared/utils/constants";
import { SHIPMENT_TYPE_VALUES } from "shared/utils/constants";
import { GOVERNORATES_VALUES } from "shared/utils/constants";
import { getGovernorateLabel } from "shared/utils/constants";
import { getShipmentTypeLabel } from "shared/utils/constants";
import { getShipmentStatusLabel } from "shared/utils/constants";
import ShipmentsGrid from "./components/ShipmentsGrid/ShipmentsGrid";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import SearchDialog from "./components/SearchDialog/SearchDialog";
const ITEMS_PER_PAGE = 150;

// Reducer Initial State

export default function Shipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isVendor = user.userType === "2";
  const { startDate, endDate, handleDatesChange } = useDateRange({
    defaultDays: 0,
  });
  const page = parseInt(searchParams.get("page")) || 1;
  const initialState = {
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
    isSearchModalOpen: false,
    selectedShipment: null,
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  function reducer(state, action) {
    switch (action.type) {
      case "FETCH_START":
        return { ...state, isLoading: true };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          shipments: action.payload.shipments,
          totalPages: action.payload.totalPages,
        };
      case "FETCH_ERROR":
        return { ...state, isLoading: false, error: action.payload };
      case "SET_FIELD":
        return { ...state, [action.field]: action.value };
      case "SET_VENDORS":
        return { ...state, vendors: action.payload };
      case "SET_Modal_open":
        return { ...state, isModalOpen: action.payload };
      case "SET_DELETE_MODAL_OPEN":
        return { ...state, isDeleteModalOpen: action.payload };
      case "SET_SEARCH_MODAL_OPEN":
        return { ...state, isSearchModalOpen: action.payload };
      default:
        return state;
    }
  }

  const getShipments = (startDateParam, endDateParam) => {
    const query = new URLSearchParams({
      page,
      size: ITEMS_PER_PAGE,
      ...(state.selectedShipmentStatus && { shipmentStatus: state.selectedShipmentStatus }),
      ...(state.selectedShipmentTybe && { shipmentType: state.selectedShipmentTybe }),
      ...(state.selectedGovernorate && { governorate: state.selectedGovernorate }),
      ...(state.selectedDeliveryStatus && { deliveryStatus: state.selectedDeliveryStatus }),
      ...(state.orderNumber && { orderNumber: state.orderNumber }),
      ...(state.shippingCompany && { shippingCompany: state.shippingCompany }),
      ...(startDate && startDateParam && { shipmentStartDate: startDate.utc().toISOString() }),
      ...(endDate && endDateParam && { shipmentEndDate: endDate.utc().toISOString() }),
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
        const newShipments = data.data.shipments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            shipments: newShipments,
            totalPages: data.data.totalPages,
          },
        });
      })
      .catch((error) => {
        dispatch({ type: "FETCH_ERROR", payload: error });
      });
  };

  const fetchVendors = () => {
    axiosRequest.get(`${process.env.REACT_APP_API_URL}/vendors`).then(({ data: { data } }) => {
      const options = data.map((v) => ({ label: v.name, value: v.id }));
      dispatch({ type: "SET_VENDORS", payload: options });
    });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    dispatch({ type: "SET_FIELD", field, value });

    const urlParams = new URLSearchParams(window.location.search);
    const paramKeyMap = {
      selectedShipmentStatus: "shipmentStatus",
      selectedShipmentTybe: "shipmentType",
      selectedGovernorate: "governorate",
      selectedDeliveryStatus: "deliveryStatus",
    };

    const paramKey = paramKeyMap[field];

    if (paramKey) {
      if (value) {
        urlParams.set(paramKey, value);
      } else {
        urlParams.delete(paramKey);
      }

      const url = new URL(window.location.href);
      url.search = urlParams.toString();
      window.history.pushState({}, "", url);
    }
  };

  const handleOrderNumberChange = (orderNumber, shippingCompany) => {
    dispatch({ type: "SET_FIELD", field: "orderNumber", value: orderNumber });
    dispatch({ type: "SET_FIELD", field: "shippingCompany", value: shippingCompany });

    // update only orderNumber param in URL
    const urlParams = new URLSearchParams(window.location.search);

    if (orderNumber) {
      urlParams.set("orderNumber", orderNumber);
    } else {
      urlParams.delete("orderNumber");
    }
    if (shippingCompany) {
      urlParams.set("shippingCompany", shippingCompany);
    } else {
      urlParams.delete("shippingCompany");
    }

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

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("shipmentStatus");
    urlParams.delete("shipmentType");
    urlParams.delete("governorate");
    urlParams.delete("deliveryStatus");
    urlParams.delete("orderNumber");
    urlParams.delete("shippingCompany");
    urlParams.delete("page");
    urlParams.delete("startDate");
    urlParams.delete("endDate");
    const url = new URL(window.location.href);
    url.search = urlParams.toString();
    window.history.pushState({}, "", url);
    setTimeout(() => {
      getShipments();
    }, 300);
  };
  const handleModalOpen = () => {
    dispatch({ type: "SET_Modal_open", payload: true });
  };
  const handleModalClose = () => {
    dispatch({ type: "SET_Modal_open", payload: false });
  };
  const handleEditShipment = (
    id,
    shipmentStatus,
    shipmentType,
    governorate,
    shippingCompany,
    shippingFees,
    shippingReceiveDate,
    deliveryDate
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
        dispatch({ type: "SET_Modal_open", payload: false });
        const updatedShipments = state.shipments.map((shipment) =>
          shipment.id === id ? { ...data, customer: shipment.customer } : shipment
        );
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            shipments: updatedShipments,
            totalPages: state.totalPages,
          },
        });
      })
      .catch((error) => {
        dispatch({ type: "FETCH_ERROR", payload: error });
      });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const searchParam = new URLSearchParams(window.location.search);

    const startDateParam = searchParam.get("startDate");
    const endDateParam = searchParam.get("endDate");

    getShipments(startDateParam, endDateParam);
  }, [
    page,
    state.selectedShipmentStatus,
    state.selectedShipmentTybe,
    state.selectedGovernorate,
    state.selectedDeliveryStatus,
    startDate,
    endDate,
    searchParams,
    state.orderNumber,
    state.shippingCompany,
  ]);

  const handlePageChange = (_, value) => {
    updateParams({ page: value });
  };

  const deleteShipment = () => {
    axiosRequest
      .delete(`${process.env.REACT_APP_API_URL}/shipments/${state.selectedShipment.id}`)
      .then(() => {
        const updatedShipments = state.shipments.filter(
          (shipment) => shipment.id !== state.selectedShipment.id
        );
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            shipments: updatedShipments,
            totalPages: state.totalPages,
          },
        });
        dispatch({ type: "SET_DELETE_MODAL_OPEN", payload: false });
      })
      .catch((error) => {
        dispatch({ type: "FETCH_ERROR", payload: error });
      });
  };

  const colDefs = [
    {
      field: "code",
      headerName: "الكود التعريفي",
      sortable: true,
      minWidth: 120,
    },
    {
      field: "orderNumber",
      headerName: "رقم الشحنة",
      sortable: true,
      minWidth: 100,
      cellRenderer: (params) => (
        <LinkRenderer
          data={params.data}
          value={params.data.orderNumber}
          openInNewTab
          url={`/shipments/${params.data.id}`}
        />
      ),
    },
    {
      field: "customerName",
      headerName: "اسم العميل",
      sortable: true,
      minWidth: 170,
      valueGetter: ({ data }) => {
        return `${data.customer?.firstName} ${data.customer?.lastName}`;
      },
    },
    {
      field: "shipmentStatus",
      headerName: "حالة الشحنة",
      sortable: true,
      minWidth: 130,
      valueGetter: ({ data }) => getShipmentStatusLabel(data.shipmentStatus),
    },
    {
      field: "shipmentType",
      headerName: "نوع الشحنة",
      sortable: true,
      minWidth: 130,
      valueGetter: ({ data }) => getShipmentTypeLabel(Number(data.shipmentType)),
    },
    {
      field: "governorate",
      headerName: "المحافظة",
      sortable: false,
      minWidth: 100,
      valueGetter: ({ data }) => {
        return getGovernorateLabel(Number(data.governorate));
      },
    },
    {
      field: "shippingCompany",
      headerName: "شركة الشحن",
      sortable: true,
      minWidth: 110,
    },
    {
      field: "shippingFees",
      headerName: "تكلفة الشحن",
      minWidth: 130,
    },
    {
      field: "shippingReceiveDate",
      headerName: "تاريخ استلام الشحنة",
      sortable: true,
      minWidth: 150,
      valueGetter: ({ data }) =>
        data.shippingReceiveDate ? moment(data.shippingReceiveDate).format("DD/MM/YYYY") : "",
    },
    {
      field: "deliveryDate",
      headerName: "تاريخ التسليم",
      sortable: true,
      minWidth: 110,
      valueGetter: ({ data }) =>
        data.deliveryDate ? moment(data.deliveryDate).format("DD/MM/YYYY") : "",
    },
    ...(!isVendor
      ? [
          {
            headerName: "",
            minWidth: 120,
            sortable: false,
            cellRenderer: (params) => {
              return (
                <>
                  <IconButton
                    onClick={() => {
                      handleModalOpen();
                      dispatch({
                        type: "SET_FIELD",
                        field: "selectedShipment",
                        value: params.data,
                      });
                    }}
                    sx={{ fontSize: "1.2rem" }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      dispatch({
                        type: "SET_DELETE_MODAL_OPEN",
                        payload: true,
                      });
                      dispatch({
                        type: "SET_FIELD",
                        field: "selectedShipment",
                        value: params.data,
                      });
                    }}
                    sx={{ color: "#d32f2f", fontSize: "1.3rem" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              );
            },
          },
        ]
      : []),
  ];

  const { shipments, isLoading, vendors } = state;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      {state.isSearchModalOpen && (
        <SearchDialog
          open={state.isSearchModalOpen}
          onClose={() => dispatch({ type: "SET_SEARCH_MODAL_OPEN", payload: false })}
          handleSearch={handleOrderNumberChange}
          data={{ orderNumber: state.orderNumber, shippingCompany: state.shippingCompany }}
        />
      )}
      {state.isModalOpen && (
        <EditShipmentModal
          open={state.isModalOpen}
          onClose={handleModalClose}
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
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6} md={4} lg={3}>
              <FormControl fullWidth>
                <InputLabel>حالة الشحنة</InputLabel>
                <Select
                  value={state.selectedShipmentStatus}
                  onChange={handleChange("selectedShipmentStatus")}
                  label="حالة الشحنة"
                  sx={{ height: 40 }}
                >
                  {SHIPMENT_STATUS_VALUES.map((option) => {
                    return (
                      <MenuItem key={option?.value} value={option?.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}{" "}
                </Select>
              </FormControl>
            </Grid>

            {!isVendor && (
              <>
                <Grid item xs={6} md={4} lg={3}>
                  <FormControl fullWidth>
                    <InputLabel>نوع الشحنة</InputLabel>
                    <Select
                      value={state.selectedShipmentTybe}
                      onChange={handleChange("selectedShipmentTybe")}
                      label="نوع الشحنة"
                      sx={{ height: 40 }}
                    >
                      {SHIPMENT_TYPE_VALUES.map((option) => (
                        <MenuItem key={option?.value} value={option?.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4} lg={3}>
                  <FormControl fullWidth>
                    <InputLabel>المحافظة</InputLabel>
                    <Select
                      value={state.selectedGovernorate}
                      onChange={handleChange("selectedGovernorate")}
                      label="المحافظة"
                      sx={{ height: 40 }}
                    >
                      {GOVERNORATES_VALUES.map((option) => (
                        <MenuItem key={option?.value} value={option?.value}>
                          {option.label}
                        </MenuItem>
                      ))}{" "}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6} lg={3}>
              <DateRangePickerWrapper
                startDate={startDate}
                endDate={endDate}
                allowPastDays={true}
                allowFutureDays={false}
                useDefaultPresets={true}
                handleDatesChange={handleDatesChange}
              />
            </Grid>
          </Grid>

          <ShipmentsGrid
            rowData={shipments}
            columnDefs={colDefs}
            defaultColDef={{
              resizable: true,
            }}
            handleSearchClick={() => dispatch({ type: "SET_SEARCH_MODAL_OPEN", payload: true })}
            handleReset={handleReset}
            enableExcel
          />
          <Pagination
            count={state.totalPages}
            page={page}
            onChange={handlePageChange}
            sx={{ display: "flex", justifyContent: "center", marginTop: "55px" }}
          />
        </>
      )}
    </DashboardLayout>
  );
}
