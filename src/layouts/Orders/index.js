import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Spinner from "components/Spinner/Spinner";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material";
import SearchDialog from "./components/SearchDialog/SearchDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOrdarModal from "./components/EditOrderModal";
import { ToastContainer } from "react-toastify";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import OrdersGrid from "./components/OrdersGrid/OrdersGrid";
import moment from "moment";
import "moment-timezone";
import "moment/locale/ar";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { useDateRange } from "hooks/useDateRange";
import { DELIVERY_STATUS, deliveryStatusValues, PAYMENT_STATUS } from "./utils/constants";
import { useSelector } from "react-redux";
import axiosRequest from "shared/functions/axiosRequest";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import BulkEditModal from "./components/BulkEditModal";
import SearchIcon from "@mui/icons-material/Search";

const ITEMS_PER_PAGE = 150;
const statusValues = {
  1: "معلق",
  3: "مؤكد",
  4: "ملغي",
  2: "قيد التصنيع ",
  5: "تم التسليم",
  6: "مسترجع ",
  7: "مستبدل ",
  8: "في المخزن ",
};
export const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "مؤكد", value: 3 },
  { label: "ملغي", value: 4 },
  { label: "قيد التصنيع ", value: 2 },
  { label: "تم التسليم", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "مستبدل ", value: 7 },
  { label: "في المخزن ", value: 8 },
];
const paymentStatus = { 2: "مدفوع", 1: "دفع عند الاستلام" };
const baseURI = `${process.env.REACT_APP_API_URL}`;
const PAGE = "page";

function Orders() {
  const { startDate, endDate, handleDatesChange, handleReset } = useDateRange({
    defaultDays: 0,
    useEndOfDay: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const orderNumberParam = searchParams.get("orderNumber");
  const vendorIdParam = searchParams.get("vendorId");
  const orderStatusParam = searchParams.get("status");
  const paymentStatusParam = searchParams.get("paymentStatus");
  const deliveryStatusParam = searchParams.get("deliveryStatus");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(
    vendorIdParam ? vendorIdParam?.split(",").map(Number) : []
  );
  const [orderStatus, setOrderStatus] = useState(
    orderStatusParam ? orderStatusParam?.split(",").map(Number) : []
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(paymentStatusParam || "");
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState(
    deliveryStatusParam ? deliveryStatusParam?.split(",").map(Number) : []
  );
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkEdited, setIsBulkEdited] = useState(false);

  const gridRef = useRef();

  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  moment.locale("en");
  const { user, token } = useSelector((state) => state.auth);
  const isVendor = user.userType === "2";

  function calculateDaysFromPoDate(date) {
    if (!date) return;
    const start = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 0) return "اليوم";
    return today > start ? `منذ ${diffDays} يوم` : "";
  }
  const updateParams = (params) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
      if (key !== PAGE) {
        updated.set("page", "1");
      }
    });

    setSearchParams(updated);
  };

  const handlePageChange = (_, value) => {
    updateParams({ page: value });
  };

  const getStatusValue = (status) => {
    const resultValue = statusValues[status];
    return resultValue;
  };
  const getDeliveryStatusValue = (status) => {
    const resultValue = deliveryStatusValues[status];
    return resultValue;
  };
  const getPaymentValue = (status) => {
    const resultValue = paymentStatus[status];
    return resultValue;
  };
  const handleChangeStatus = (value) => {
    setOrderStatus(value);
    updateParams({ status: value });
  };
  const handleChangeVendor = (value) => {
    setSelectedVendor(value);
    updateParams({ vendorId: value });
  };

  const handleChangePaymentStatus = (value) => {
    setSelectedPaymentStatus(value);
    updateParams({ paymentStatus: value });
  };
  const handleChangeDeliveryStatus = (value) => {
    setSelectedDeliveryStatus(value);
    updateParams({ deliveryStatus: value });
  };

  const getVendors = () => {
    axiosRequest
      .get("/vendors")
      .then(({ data: { data } }) => {
        const newData = data.map((vendor) => ({ label: vendor.name, value: vendor.id }));
        setVendors([{ label: "هومكس", value: "0" }, ...newData]);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const fetchOrders = (startDateParam, endDateParam) => {
    setIsLoading(true);

    const query = new URLSearchParams({
      page,
      size: ITEMS_PER_PAGE,
      ...(orderNumberParam && { orderNumber: orderNumberParam }),
      ...(vendorIdParam && { vendorId: vendorIdParam }),
      ...(orderStatusParam && { status: orderStatusParam }),
      ...(paymentStatusParam && { paymentStatus: paymentStatusParam }),
      ...(deliveryStatusParam && { deliveryStatus: deliveryStatusParam }),
      ...(startDate && startDateParam && { startDate: startDate.utc().toISOString() }),
      ...(endDate && endDateParam && { endDate: endDate.utc().toISOString() }),
    });

    axiosRequest
      .get(`/orders?${query}`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
          return;
        }
        const newOrders = data.data.orders
          .map((order) => {
            return {
              orderNumber: order.orderNumber,
              items: order.orderLines,
              totalPrice: order.totalPrice,
              subTotalPrice: order.subTotalPrice,
              status: order.status,
              deliveryStatus: order.deliveryStatus,
              customerName: order.customer
                ? `${order.customer.firstName} ${order.customer.lastName}`
                : "",
              orderId: order.id,
              date: order.orderDate,
              toBeCollected: order.toBeCollected,
              shippingFees: order.shippingFees,
              paymentStatus: order.paymentStatus,
              notes: order.notes,
              commission: order.commission,
              PoDate: order.PoDate,
              totalCost: Number(order.totalCost).toFixed(1),
              orderData: order,
              receivedAmount: order.receivedAmount,
              totalDiscounts: order.totalDiscounts,
              code: order.code,
              createdAt: order.createdAt,
              userId: order.userId,
              downPayment: order.downPayment,
              totalVendorDue: order.totalVendorDue,
              totalCompanyDue: order.totalCompanyDue,
              expectedDeliveryDate: order.expectedDeliveryDate,
              type: order.orderLines[0]?.product?.type?.name,
            };
          })
          .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));

        setOrders(newOrders);
        setTotalPages(data.data.totalPages);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onEditConfirm = (
    id,
    orderStatus,
    commission,
    totalVendorDue,
    paymentStatus,
    downPayment,
    toBeCollected,
    shippingFees,
    selectedVendor,
    administrator,
    shippedFromInventory,
    totalCompanyDue,
    expectedDeliveryDate
  ) => {
    setIsSubmitting(true);
    axiosRequest
      .put(`${baseURI}/orders/${id}`, {
        ...(orderStatus && { status: orderStatus }),
        ...(expectedDeliveryDate &&
          expectedDeliveryDate !== "Invalid date" && {
            expectedDeliveryDate: expectedDeliveryDate,
          }),
        ...(selectedVendor && { vendorId: selectedVendor }),
        ...(administrator && { userId: administrator }),
        commission: commission,
        paymentStatus: paymentStatus,
        downPayment: downPayment,
        shippingFees: shippingFees,
        toBeCollected: toBeCollected,
        shippedFromInventory: shippedFromInventory,
        totalVendorDue: totalVendorDue,
        totalCompanyDue: totalCompanyDue,
      })
      .then(({ data: { data } }) => {
        const newOrders = orders.map((order) => {
          if (order.orderId === data.id) {
            return {
              ...order,
              status: data.status,
              commission: data.commission,
              toBeCollected: data.toBeCollected,
              paymentStatus: data.paymentStatus,
              PoDate: data.PoDate,
              shippingFees: data.shippingFees,
              selectedVendor: data.selectedVendor,
              deliveryStatus: data.deliveryStatus,
              userId: data.userId,
              shippedFromInventory: data.shippedFromInventory,
              downPayment: data.downPayment,
              totalVendorDue: data.totalVendorDue,
              totalCompanyDue: data.totalCompanyDue,
              expectedDeliveryDate: data.expectedDeliveryDate,
              items: data.orderLines,
              totalPrice: data.totalPrice,
            };
          }
          return order;
        });
        setOrders(newOrders);
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsEditModalOpen(false);
      });
  };
  const openEditModal = (value) => {
    setSelectedEditOrder(value);
  };
  const handleResetGrid = () => {
    const urlParams = new URLSearchParams(window.location.search);
    handleReset();
    urlParams.delete("startDate");
    urlParams.delete("endDate");
    urlParams.delete("page");
    urlParams.delete("orderNumber");
    urlParams.delete("vendorId");
    urlParams.delete("status");
    urlParams.delete("paymentStatus");
    urlParams.delete("deliveryStatus");
    setSearchParams(urlParams);
    setSelectedPaymentStatus("");
    setSelectedDeliveryStatus([]);
    setSelectedVendor([]);
    setOrderStatus([]);
    setTimeout(() => {
      // fetchOrders();
      window.location.href = "/orders";
      // navigate("/orders");
    }, 300);
  };

  const deleteOrder = () => {
    axiosRequest
      .delete(`${process.env.REACT_APP_API_URL}/orders/${selectedEditOrder.orderId}`)
      .then(() => {
        const updatedorders = orders.filter((order) => order.orderId !== selectedEditOrder.orderId);
        setOrders(updatedorders);
        NotificationMeassage("success", "تم حذف الطلب");
        setIsDeleteModalOpen(false);
      })
      .catch((error) => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };
  const onSelectionChanged = () => {
    const selected = gridRef.current.api.getSelectedRows();
    setSelectedRows(selected);
  };
  const bulkEdit = (orderStatus, paymentStatus, shippedFromInventory) => {
    const orderIds = selectedRows.map((order) => order.orderId);

    axiosRequest
      .put(`${baseURI}/orders/bulk-update`, {
        orderIds: orderIds,
        orderData: {
          ...(orderStatus && { status: orderStatus }),
          ...(paymentStatus && { paymentStatus: paymentStatus }),
          shippedFromInventory: shippedFromInventory,
        },
      })
      .then(() => {
        const idsSet = new Set(orderIds);

        const updatedOrders = orders.map((order) => {
          if (idsSet.has(order.orderId)) {
            return {
              ...order,
              ...(orderStatus && { status: orderStatus }),
              ...(paymentStatus && { paymentStatus: paymentStatus }),
              shippedFromInventory: shippedFromInventory,
            };
          }
          return order;
        });

        setOrders(updatedOrders);
        setIsBulkEdited(false);
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });

    setIsBulkEditModalOpen(false);
  };

  const bulkDelete = () => {
    const orderIds = selectedRows.map((order) => order.orderId);

    if (orderIds.length > 0) {
      axiosRequest
        .delete(`${baseURI}/orders/bulk-delete`, {
          data: { orderIds: orderIds },
        })

        .then(() => {
          const idsSet = new Set(orderIds);
          const newOrders = orders.filter((order) => !idsSet.has(order.orderId));
          setOrders(newOrders);
          NotificationMeassage("success", "تم الحذف بنجاح");
          setIsBulkDeleteModalOpen(false);
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        });
    }
  };

  const handleExport = (startDateParam, endDateParam) => {
    const query = new URLSearchParams({
      ...(vendorIdParam && { vendorId: vendorIdParam }),
      ...(orderStatusParam && { status: orderStatusParam }),
      ...(paymentStatusParam && { paymentStatus: paymentStatusParam }),
      ...(deliveryStatusParam && { deliveryStatus: deliveryStatusParam }),
      ...(startDate && startDateParam && { startDate: startDate.utc().toISOString() }),
      ...(endDate && endDateParam && { endDate: endDate.utc().toISOString() }),
    });
    axiosRequest
      .get(`${baseURI}/orders/export?${query}`)
      .then(({ request: { responseURL } }) => {
        window.location.href = responseURL;
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const colDefs = [
    {
      field: "code",
      headerName: "رقم العملية",
      sortable: true,
      minWidth: 120,
      cellRenderer: (params) => (
        <LinkRenderer
          data={params.data}
          value={params.data.code}
          openInNewTab
          url={`/orders/${params.data.orderId}`}
        />
      ),
    },
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
          url={`/orders/${params.data.orderId}`}
        />
      ),
    },
    { field: "customerName", headerName: "اسم العميل", sortable: true, minWidth: 170 },
    {
      field: "status",
      headerName: "حالة الطلب",
      sortable: true,
      minWidth: 100,
      valueGetter: (node) => getStatusValue(node.data.status),
    },
    {
      field: "totalPrice",
      headerName: "سعر البيع",
      sortable: false,
      minWidth: 100,
    },
    {
      field: "totalCost",
      headerName: "سعر التكلفة",
      sortable: true,
      minWidth: 100,
      valueGetter: ({ data }) => {
        let ordercost = 0;
        data.items?.forEach((item) => {
          ordercost += Number(item.unitCost) * Number(item.quantity);
        });
        return Number(ordercost).toFixed(0);
      },
    },
    {
      field: "paymentStatus",
      headerName: "طريقة الدفع",
      minWidth: 130,
      valueGetter: (node) => getPaymentValue(node.data.paymentStatus),
    },
    {
      field: "date",
      headerName: "تاريخ أمر التصنيع",
      sortable: true,
      minWidth: 150,
      valueGetter: ({ data }) =>
        data.PoDate ? moment.utc(data.PoDate).tz("Africa/Cairo").format("YY/MM/DD") : "",
    },
    {
      headerName: "الأيام المنقضيه",
      sortable: true,
      minWidth: 120,
      valueGetter: (node) => (node.data.PoDate ? calculateDaysFromPoDate(node.data.PoDate) : ""),
    },
    {
      field: "deliveryStatus",
      headerName: "الحالة",
      sortable: true,
      minWidth: 130,
      valueGetter: (node) => getDeliveryStatusValue(node.data.deliveryStatus),
    },
    !isVendor && {
      field: "type",
      headerName: "النوع",
      sortable: true,
      minWidth: 130,
    },
    !isVendor && {
      field: "administrator",
      headerName: "المسؤول",
      sortable: true,
      minWidth: 140,
      valueGetter: (node) => {
        const user = users.find((user) => user.id === node.data.userId);
        return user ? `${user.firstName} ${user.lastName}` : "";
      },
    },
    ...(!isVendor
      ? [
          {
            headerName: "",
            minWidth: 120,
            sortable: false,
            cellRenderer: (params) => (
              <>
                <IconButton
                  onClick={() => {
                    openEditModal(params.data);
                    setIsEditModalOpen(true);
                  }}
                  sx={{ fontSize: "1.2rem" }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  onClick={() => {
                    openEditModal(params.data);
                    setIsDeleteModalOpen(true);
                  }}
                  sx={{ color: "#d32f2f", fontSize: "1.3rem" }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]
      : []),
  ];

  useEffect(() => {
    const searchParam = new URLSearchParams(window.location.search);

    const startDateParam = searchParam.get("startDate");
    const endDateParam = searchParam.get("endDate");

    fetchOrders(startDateParam, endDateParam);
    if (!vendors.length) {
      getVendors();
    }
  }, [
    page,
    // orderStatusParam,
    orderNumberParam,
    // vendorIdParam,
    // startDate,
    // endDate,
    // paymentStatusParam,
    // deliveryStatusParam,
  ]);

  useEffect(() => {
    axiosRequest.get(`${process.env.REACT_APP_API_URL}/users`).then(({ data: { data } }) => {
      setUsers(data);
    });
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      {isSearchModalOpen && (
        <SearchDialog
          onConfirm={onEditConfirm}
          open={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          setSearchParams={setSearchParams}
        />
      )}
      {isEditModalOpen && selectedEditOrder && vendors.length > 0 && (
        <EditOrdarModal
          data={selectedEditOrder}
          open={isEditModalOpen}
          onEdit={onEditConfirm}
          onClose={() => setIsEditModalOpen(false)}
          vendors={vendors}
          isSubmitting={isSubmitting}
        />
      )}
      {isDeleteModalOpen && selectedEditOrder && (
        <ConfirmDeleteModal
          title="الطلب"
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          handleConfirmDelete={deleteOrder}
        />
      )}
      {isBulkEditModalOpen && selectedRows.length > 0 && (
        <BulkEditModal
          open={isBulkEditModalOpen}
          onEdit={bulkEdit}
          onClose={() => setIsBulkEditModalOpen(false)}
        />
      )}

      {isBulkDeleteModalOpen && selectedRows.length > 0 && (
        <ConfirmDeleteModal
          title="الطلبات المحددة"
          open={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          handleConfirmDelete={bulkDelete}
        />
      )}
      {!isLoading ? (
        <>
          <Grid container spacing={1}>
            <Grid item xs={6} md={6} lg={3}>
              <FormControl fullWidth style={{ width: "100%" }}>
                <InputLabel id="orderStatus">حالة الطلب</InputLabel>
                <Select
                  fullWidth
                  labelId="orderStatus"
                  id="orderStatus-select"
                  value={orderStatus}
                  multiple
                  label="حالة الطلب"
                  onChange={(e) => handleChangeStatus(e.target.value)}
                  sx={{ height: 35 }}
                >
                  {statusoptions.map((option) => {
                    return (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            {!isVendor && (
              <Grid item xs={6} md={6} lg={3}>
                <FormControl fullWidth style={{ width: "100%" }}>
                  <InputLabel id="orderStatus">المصنعين</InputLabel>
                  <Select
                    labelId="vendors"
                    id="vendors"
                    value={selectedVendor}
                    label="المصنعين"
                    fullWidth
                    multiple
                    onChange={(e) => {
                      setSelectedVendor(e.target.value);
                      updateParams({ vendorId: e.target.value });
                    }}
                    sx={{ height: 35 }}
                  >
                    {vendors.map((option) => {
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>{" "}
              </Grid>
            )}
            {!isVendor && (
              <>
                <Grid item xs={6} md={6} lg={3}>
                  <FormControl fullWidth style={{ width: "100%" }}>
                    <InputLabel id="deliveryStatus">طريقة الدفع</InputLabel>
                    <Select
                      labelId="deliveryStatus"
                      id="deliveryStatus"
                      value={selectedPaymentStatus}
                      label="حاله الدفع"
                      fullWidth
                      onChange={(e) => handleChangePaymentStatus(e.target.value)}
                      sx={{ height: 35 }}
                    >
                      {PAYMENT_STATUS.map((option) => {
                        return (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>{" "}
                </Grid>
              </>
            )}
            <Grid item xs={6} md={6} lg={3}>
              <FormControl fullWidth style={{ width: "100%" }}>
                <InputLabel id="deliveryStatus">حاله التصنيع</InputLabel>
                <Select
                  labelId="deliveryStatus"
                  id="deliveryStatus"
                  value={selectedDeliveryStatus}
                  label="حاله التصنيع"
                  fullWidth
                  multiple
                  onChange={(e) => {
                    setSelectedDeliveryStatus(e.target.value);
                    updateParams({ deliveryStatus: e.target.value });
                  }}
                  sx={{ height: 35 }}
                >
                  {DELIVERY_STATUS.map((option) => {
                    return (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>{" "}
            </Grid>

            <Grid item xs={10} md={4} lg={4}>
              <DateRangePickerWrapper
                startDate={startDate}
                endDate={endDate}
                allowPastDays={true}
                allowFutureDays={false}
                useDefaultPresets={true}
                handleDatesChange={handleDatesChange}
              />{" "}
            </Grid>
            <Grid item xs={2} md={2} lg={2}>
              <Button
                variant="contained"
                fontSize="large"
                sx={{ color: "#fff" }}
                disabled={
                  !startDate &&
                  !endDate &&
                  !orderStatus.length &&
                  !selectedDeliveryStatus.length &&
                  !selectedVendor.length
                }
                // className={styles.downloadBtn}
                onClick={() => {
                  const searchParam = new URLSearchParams(window.location.search);
                  const startDateParam = searchParam.get("startDate");
                  const endDateParam = searchParam.get("endDate");
                  fetchOrders(startDateParam, endDateParam);
                }}
              >
                <SearchIcon />
              </Button>
            </Grid>
          </Grid>

          <OrdersGrid
            rowData={orders}
            columnDefs={colDefs}
            defaultColDef={{
              resizable: true,
            }}
            handleSearchClick={() => setIsSearchModalOpen(true)}
            handleReset={handleResetGrid}
            enableExcel
            gridRef={gridRef}
            onSelectionChanged={onSelectionChanged}
            setIsBulkEditModalOpen={setIsBulkEditModalOpen}
            selectedRows={selectedRows}
            setIsBulkDeleteModalOpen={setIsBulkDeleteModalOpen}
            handleExport={handleExport}
            isOrdersPage
            isBulkEdited={isBulkEdited}
            enableBulkEdit={() => setIsBulkEdited((prev) => !prev)}
          />
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            sx={{ display: "flex", justifyContent: "center", marginTop: "55px" }}
          />
        </>
      ) : (
        <Spinner />
      )}
    </DashboardLayout>
  );
}

export default Orders;
