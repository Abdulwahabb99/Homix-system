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
const ITEMS_PER_PAGE = 150;

// Reducer Initial State
const initialState = {
  shipments: [],
  isLoading: false,
  totalPages: 0,
  error: null,
  selectedShipmentStatus: "",
  selectedShipmentTybe: "",
  selectedGovernorate: "",
  selectedDeliveryStatus: "",
  vendors: [],
  isModalOpen: false,
  selectedShipment: null,
};

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
    default:
      return state;
  }
}

export default function Shipments() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isVendor = user.userType === "2";
  const { startDate, endDate, handleDatesChange } = useDateRange({
    defaultDays: 0,
  });
  console.log("startDate", startDate);
  console.log("endDate", endDate);

  const page = parseInt(searchParams.get("page")) || 1;

  const getShipments = () => {
    const query = new URLSearchParams({
      page,
      size: ITEMS_PER_PAGE,
      ...(state.selectedShipmentStatus && { shipmentStatus: state.selectedShipmentStatus }),
      ...(state.selectedShipmentTybe && { shipmentType: state.selectedShipmentTybe }),
      ...(state.selectedGovernorate && { paymentStatus: state.selectedGovernorate }),
      ...(state.selectedDeliveryStatus && { deliveryStatus: state.selectedDeliveryStatus }),
      ...(startDate && { shipmentStartDate: startDate.utc().toISOString() }),
      ...(endDate && { shipmentEndDate: endDate.utc().toISOString() }),
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
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            shipments: data.data.shipments,
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
    dispatch({ type: "SET_FIELD", field, value: e.target.value });
  };

  const handleReset = () => {
    navigate("/shipments", { replace: true });
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
        console.log(data);
        dispatch({ type: "SET_Modal_open", payload: false });
        const updatedShipments = state.shipments.map((shipment) =>
          shipment.id === id ? { ...data, customer: shipment.customer } : shipment
        );
        console.log(updatedShipments);

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
    getShipments();
  }, [
    page,
    state.selectedShipmentStatus,
    state.selectedShipmentTybe,
    state.selectedGovernorate,
    state.selectedDeliveryStatus,
    startDate,
    endDate,
  ]);

  const handlePageChange = (_, value) => {
    updateParams({ page: value });
  };

  const updateShipment = (shipment) => {
    dispatch({ type: "SET_FIELD", field: "selectedShipmentStatus", value: shipment });
  };

  const colDefs = [
    // {
    //   field: "name",
    //   headerName: "الكود التعريفي",
    //   sortable: true,
    //   minWidth: 110,
    // },
    {
      field: "orderNumber",
      headerName: "رقم الطلب",
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
                  <IconButton onClick={() => {}} sx={{ color: "#d32f2f", fontSize: "1.3rem" }}>
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
      {state.isModalOpen && (
        <EditShipmentModal
          open={state.isModalOpen}
          onClose={handleModalClose}
          data={state.selectedShipment}
          vendors={vendors}
          onEdit={handleEditShipment}
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

                <Grid item xs={6} md={4} lg={3}>
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

                <Grid item xs={6} md={4} lg={3}>
                  <FormControl fullWidth>
                    <InputLabel>حالة التصنيع</InputLabel>
                    <Select
                      value={state.selectedDeliveryStatus}
                      onChange={handleChange("selectedDeliveryStatus")}
                      label="حالة التصنيع"
                      sx={{ height: 40 }}
                    >
                      {/* Map Delivery Status Options Here */}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6} lg={4}>
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
            handleSearchClick={() => setIsSearchModalOpen(true)}
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
