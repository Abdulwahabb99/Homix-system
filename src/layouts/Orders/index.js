import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { ToastContainer } from "react-toastify";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import moment from "moment";
import "moment-timezone";
import "moment/locale/ar";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { useDateRange } from "hooks/useDateRange";
import { deliveryStatusValues } from "layouts/Orders/utils/constants";
import { useSelector } from "react-redux";
import axiosRequest from "shared/functions/axiosRequest";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import BulkEditModal from "layouts/Orders/components/BulkEditModal";
import EditOrdarModal from "layouts/Orders/components/EditOrderModal";
import HomixDataTable from "shared/components/HomixDataTable/HomixDataTable";
import HomixFilterIconButton from "shared/components/HomixFilterIconButton/HomixFilterIconButton";
import OrdersFilterDialog from "layouts/Orders/components/OrdersFilterDialog";
import OrdersPageSkeleton from "layouts/Orders/components/OrdersPageSkeleton";

const baseURI = `${process.env.REACT_APP_API_URL}`;
const ITEMS_PER_PAGE = 30;

/* يطابق الـ API — أسماء العرض */
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
const paymentStatus = { 2: "مدفوع", 1: "دفع عند الاستلام" };

function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    startDate,
    endDate,
    handleDatesChange,
    handleReset: handleDateReset,
  } = useDateRange({
    defaultDays: 0,
    useEndOfDay: true,
  });

  const page = parseInt(searchParams.get("page"), 10) || 1;
  const orderNumber = searchParams.get("orderNumber") || "";
  const orderStatus = useMemo(() => {
    const raw = searchParams.get("status");
    if (!raw) return [];
    return raw
      .split(",")
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));
  }, [searchParams]);
  const selectedVendor = useMemo(() => {
    const raw = searchParams.get("vendorId");
    if (!raw) return [];
    return raw.split(",");
  }, [searchParams]);
  const payment = searchParams.get("paymentStatus") || "";
  const deliveryStatusList = useMemo(() => {
    const raw = searchParams.get("deliveryStatus");
    if (!raw) return [];
    return raw
      .split(",")
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));
  }, [searchParams]);

  const setParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            if (value.length) next.set(key, value.join(","));
            else next.delete(key);
          } else {
            next.set(key, String(value));
          }
        } else {
          next.delete(key);
        }
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState([]);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const isVendor = user.userType === "2";

  const orderStatusParam = searchParams.get("status");
  const vendorIdParam = searchParams.get("vendorId");
  const orderNumberParam = searchParams.get("orderNumber");
  const paymentStatusParam = searchParams.get("paymentStatus");
  const deliveryStatusParam = searchParams.get("deliveryStatus");

  const filterActiveCount = useMemo(() => {
    return (
      orderStatus.length +
      (isVendor ? 0 : selectedVendor.length) +
      (isVendor ? 0 : (payment && 1) || 0) +
      deliveryStatusList.length
    );
  }, [orderStatus, selectedVendor, payment, deliveryStatusList, isVendor]);

  const calculateDaysFromPoDate = (date) => {
    if (!date) return;
    const start = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 0) return "اليوم";
    return today > start ? `منذ ${diffDays} يوم` : "";
  };

  const getStatusValue = (s) => statusValues[s] ?? "";
  const getDeliveryValue = (s) => deliveryStatusValues[s] ?? "";
  const getPaymentValue = (s) => paymentStatus[s] ?? "";

  const fetchOrders = useCallback(() => {
    setIsLoading(true);
    const p = parseInt(searchParams.get("page"), 10) || 1;
    const query = new URLSearchParams({ page: String(p), size: String(ITEMS_PER_PAGE) });
    if (orderNumberParam) query.set("orderNumber", orderNumberParam);
    if (vendorIdParam) query.set("vendorId", vendorIdParam);
    if (orderStatusParam) query.set("status", orderStatusParam);
    if (paymentStatusParam) query.set("paymentStatus", paymentStatusParam);
    if (deliveryStatusParam) query.set("deliveryStatus", deliveryStatusParam);
    if (startDate) query.set("startDate", startDate.utc().toISOString());
    if (endDate) query.set("endDate", endDate.utc().toISOString());

    axiosRequest
      .get(`/orders?${query}`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
          return;
        }
        const newOrders = data.data.orders
          .map((order) => ({
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
          }))
          .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
        setOrders(newOrders);
        setTotalPages(data.data.totalPages);
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"))
      .finally(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      });
  }, [
    searchParams,
    startDate,
    endDate,
    orderStatusParam,
    vendorIdParam,
    orderNumberParam,
    paymentStatusParam,
    deliveryStatusParam,
    navigate,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getVendors = () => {
    axiosRequest
      .get("/vendors")
      .then(({ data: { data } }) => {
        setVendors([
          { label: "هومكس", value: "0" },
          ...data.map((v) => ({ label: v.name, value: v.id })),
        ]);
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"));
  };

  useEffect(() => {
    getVendors();
  }, []);

  useEffect(() => {
    axiosRequest.get(`${baseURI}/users`).then(({ data: { data } }) => setUsers(data));
  }, [token]);

  const onEditConfirm = (
    id,
    orderSt,
    commission,
    totalVendorDue,
    pay,
    downPayment,
    toBeCollected,
    shippingFees,
    selectedV,
    administrator,
    shippedFromInventory,
    totalCompanyDue,
    expectedDeliveryDate
  ) => {
    setIsSubmitting(true);
    axiosRequest
      .put(`${baseURI}/orders/${id}`, {
        ...(orderSt && { status: orderSt }),
        ...(expectedDeliveryDate &&
          expectedDeliveryDate !== "Invalid date" && { expectedDeliveryDate }),
        ...(selectedV && { vendorId: selectedV }),
        ...(administrator && { userId: administrator }),
        commission,
        paymentStatus: pay,
        downPayment,
        shippingFees,
        toBeCollected,
        shippedFromInventory,
        totalVendorDue,
        totalCompanyDue,
      })
      .then(({ data: { data } }) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === data.id
              ? { ...o, status: data.status, items: data.orderLines, totalPrice: data.totalPrice }
              : o
          )
        );
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"))
      .finally(() => {
        setIsSubmitting(false);
        setIsEditModalOpen(false);
      });
  };

  const openEdit = (row) => {
    setSelectedEditOrder(row);
  };

  const handleFullReset = () => {
    handleDateReset();
    setSearchParams(new URLSearchParams([["page", "1"]]));
  };

  const handleApplyFilters = (d) => {
    setParams({
      page: "1",
      status: d.orderStatus?.length ? d.orderStatus : "",
      vendorId: d.selectedVendor?.length ? d.selectedVendor : "",
      paymentStatus: d.paymentStatus || "",
      deliveryStatus: d.deliveryStatus?.length ? d.deliveryStatus : "",
    });
  };

  const handleFilterReset = () => {
    setParams({ page: "1", status: "", vendorId: "", paymentStatus: "", deliveryStatus: "" });
  };

  const deleteOrder = () => {
    axiosRequest.delete(`${baseURI}/orders/${selectedEditOrder.orderId}`).then(() => {
      setOrders((o) => o.filter((x) => x.orderId !== selectedEditOrder.orderId));
      NotificationMeassage("success", "تم حذف الطلب");
      setIsDeleteModalOpen(false);
    });
  };

  const selectedRows = useMemo(
    () => orders.filter((o) => selectionModel.includes(o.orderId)),
    [orders, selectionModel]
  );

  const bulkEdit = (orderSt, pay, shippedFromInventory) => {
    const orderIds = selectedRows.map((o) => o.orderId);
    axiosRequest
      .put(`${baseURI}/orders/bulk-update`, {
        orderIds,
        orderData: {
          ...(orderSt && { status: orderSt }),
          ...(pay && { paymentStatus: pay }),
          shippedFromInventory,
        },
      })
      .then(() => {
        const ids = new Set(orderIds);
        setOrders((prev) =>
          prev.map((o) =>
            ids.has(o.orderId)
              ? {
                  ...o,
                  ...(orderSt && { status: orderSt }),
                  ...(pay && { paymentStatus: pay }),
                  ...(shippedFromInventory !== undefined && { shippedFromInventory }),
                }
              : o
          )
        );
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"));
    setIsBulkEditModalOpen(false);
  };

  const bulkDelete = () => {
    const orderIds = selectedRows.map((o) => o.orderId);
    if (!orderIds.length) return;
    axiosRequest
      .delete(`${baseURI}/orders/bulk-delete`, { data: { orderIds } })
      .then(() => {
        const ids = new Set(orderIds);
        setOrders((o) => o.filter((x) => !ids.has(x.orderId)));
        setSelectionModel([]);
        NotificationMeassage("success", "تم الحذف بنجاح");
        setIsBulkDeleteModalOpen(false);
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"));
  };

  const handleExport = () => {
    const query = new URLSearchParams({
      ...(vendorIdParam && { vendorId: vendorIdParam }),
      ...(orderStatusParam && { status: orderStatusParam }),
      ...(paymentStatusParam && { paymentStatus: paymentStatusParam }),
      ...(deliveryStatusParam && { deliveryStatus: deliveryStatusParam }),
      ...(startDate && { startDate: startDate.utc().toISOString() }),
      ...(endDate && { endDate: endDate.utc().toISOString() }),
    });
    setIsExportLoading(true);
    axiosRequest
      .get(`${baseURI}/orders/export?${query}`)
      .then(({ request: { responseURL } }) => {
        window.location.href = responseURL;
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"))
      .finally(() => setIsExportLoading(false));
  };

  const searchFieldStyles = {
    flex: 1,
    minWidth: 0,
    "& .MuiInputLabel-root": { fontSize: "0.8125rem", color: "primary.main" },
    "& .MuiOutlinedInput-root": {
      height: 40,
      borderRadius: 1.5,
      fontSize: "0.8125rem",
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
        borderWidth: 2,
      },
    },
  };

  const columns = useMemo(() => {
    const cols = [
      {
        field: "code",
        headerName: "رقم العملية",
        minWidth: 120,
        sortable: false,
        flex: 0.8,
        renderCell: (p) => (
          <LinkRenderer
            data={p.row}
            value={p.row.code}
            openInNewTab
            url={`/orders/${p.row.orderId}`}
          />
        ),
      },
      {
        field: "orderNumber",
        headerName: "رقم الطلب",
        minWidth: 100,
        flex: 0.6,
        renderCell: (p) => (
          <LinkRenderer
            data={p.row}
            value={p.row.orderNumber}
            openInNewTab
            url={`/orders/${p.row.orderId}`}
          />
        ),
      },
      { field: "customerName", headerName: "اسم العميل", minWidth: 160, flex: 1, sortable: false },
      {
        field: "status",
        headerName: "حالة الطلب",
        minWidth: 100,
        sortable: false,
        valueGetter: (p) => getStatusValue(p.row.status),
      },
      { field: "totalPrice", headerName: "سعر البيع", minWidth: 100, sortable: false, flex: 0.5 },
      {
        field: "compCost",
        headerName: "سعر التكلفة",
        minWidth: 100,
        sortable: false,
        valueGetter: (p) => {
          let c = 0;
          p.row.items?.forEach((item) => {
            c += Number(item.unitCost) * Number(item.quantity);
          });
          return Number(c).toFixed(0);
        },
      },
      {
        field: "paymentStatus",
        headerName: "طريقة الدفع",
        minWidth: 120,
        valueGetter: (p) => getPaymentValue(p.row.paymentStatus),
        sortable: false,
      },
      {
        field: "pom",
        headerName: "تاريخ أمر التصنيع",
        minWidth: 130,
        sortable: false,
        valueGetter: (p) =>
          p.row.PoDate ? moment.utc(p.row.PoDate).tz("Africa/Cairo").format("YY/MM/DD") : "",
      },
      {
        field: "days",
        headerName: "الأيام المنقضيه",
        minWidth: 110,
        sortable: false,
        valueGetter: (p) => (p.row.PoDate ? calculateDaysFromPoDate(p.row.PoDate) : ""),
      },
      {
        field: "deliveryStatus",
        headerName: "الحالة",
        minWidth: 120,
        valueGetter: (p) => getDeliveryValue(p.row.deliveryStatus),
        sortable: false,
      },
    ];
    if (!isVendor)
      cols.push({ field: "type", headerName: "النوع", minWidth: 120, flex: 0.6, sortable: false });
    if (!isVendor) {
      cols.push({
        field: "admin",
        headerName: "المسؤول",
        minWidth: 130,
        sortable: false,
        valueGetter: (p) => {
          const u = users.find((x) => x.id === p.row.userId);
          return u ? `${u.firstName} ${u.lastName}` : "";
        },
      });
    }
    if (!isVendor) {
      cols.push({
        field: "actions",
        headerName: "",
        minWidth: 100,
        sortable: false,
        filterable: false,
        renderCell: (p) => (
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              onClick={() => {
                openEdit(p.row);
                setIsEditModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                openEdit(p.row);
                setIsDeleteModalOpen(true);
              }}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      });
    }
    return cols;
  }, [isVendor, users]);

  const serverRowCount = Math.max(0, totalPages * ITEMS_PER_PAGE);
  const gridPage0 = page - 1;
  const showInitialSkeleton = isInitialLoad && isLoading;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />

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

      <OrdersFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        isVendor={isVendor}
        vendors={vendors}
        value={{
          orderStatus,
          selectedVendor,
          paymentStatus: payment,
          deliveryStatus: deliveryStatusList,
        }}
        onApply={handleApplyFilters}
        onReset={handleFilterReset}
      />

      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          maxWidth: 1680,
          mx: "auto",
          width: "100%",
        }}
      >
        {showInitialSkeleton ? (
          <OrdersPageSkeleton isVendor={isVendor} />
        ) : (
          <>
            <Stack
              spacing={0.5}
              mb={2.5}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary" fontSize="1.1rem">
                  الطلبات
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">
                  بحث مباشر، تصفية من الأيقونة، والفترة من التاريخ أدناه
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleFullReset}
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  إعادة الضبط
                </Button>
                {!isVendor && (
                  <>
                    <IconButton
                      onClick={handleExport}
                      size="small"
                      color="primary"
                      disabled={isExportLoading}
                      aria-busy={isExportLoading}
                      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isExportLoading ? (
                          <CircularProgress color="inherit" size={20} thickness={4} />
                        ) : (
                          <DownloadIcon fontSize="small" />
                        )}
                      </Box>
                    </IconButton>
                    <IconButton
                      onClick={() => navigate("/orders/add")}
                      size="small"
                      color="primary"
                      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Stack>

            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 12px rgba(15, 23, 42, 0.04)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ width: "100%", mb: 2 }}
              >
                <TextField
                  label="رقم الطلب"
                  placeholder="ابحث برقم الطلب…"
                  variant="outlined"
                  size="small"
                  type="search"
                  value={orderNumber}
                  onChange={(e) => setParams({ page: "1", orderNumber: e.target.value })}
                  sx={searchFieldStyles}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ style: { fontSize: "0.8125rem" } }}
                  InputProps={{
                    endAdornment: <SearchIcon sx={{ color: "text.disabled", fontSize: 18 }} />,
                  }}
                />
                <HomixFilterIconButton
                  onClick={() => setFilterDialogOpen(true)}
                  activeCount={filterActiveCount}
                />
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  "& .custom-date-picker, & .DateRangePicker, & .DateRangePickerInput": {
                    width: "100% !important",
                  },
                }}
              >
                <DateRangePickerWrapper
                  startDate={startDate}
                  endDate={endDate}
                  allowPastDays
                  allowFutureDays={false}
                  useDefaultPresets
                  isMeduim
                  handleDatesChange={handleDatesChange}
                />
              </Box>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1.5}
              mb={1.5}
            >
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                {!isVendor && (
                  <Tooltip title="تبديل اختيار عدة صفوف">
                    <span>
                      <IconButton
                        onClick={() => {
                          setIsBulkEditMode((b) => !b);
                          setSelectionModel([]);
                        }}
                        size="small"
                        sx={{ border: "1px solid", borderColor: "divider" }}
                      >
                        {isBulkEditMode ? (
                          <CheckBoxIcon fontSize="small" />
                        ) : (
                          <CheckBoxOutlineBlankIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {!isVendor && isBulkEditMode && selectionModel.length > 1 && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setIsBulkEditModalOpen(true)}
                    >
                      تعديل المحدد
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => setIsBulkDeleteModalOpen(true)}
                    >
                      حذف المحدد
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>

            <HomixDataTable
              rows={orders}
              columns={columns}
              getRowId={(r) => r.orderId}
              loading={isLoading}
              height={560}
              page={gridPage0}
              pageSize={ITEMS_PER_PAGE}
              rowCount={serverRowCount}
              paginationMode="server"
              onPageChange={(newPage) => setParams({ page: String(newPage + 1) })}
              checkboxSelection={!isVendor && isBulkEditMode}
              selectionModel={!isVendor && isBulkEditMode ? selectionModel : []}
              onSelectionModelChange={(m) => setSelectionModel(m)}
            />
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Orders;
