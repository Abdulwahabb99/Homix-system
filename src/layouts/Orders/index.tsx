import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
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
import { OrdersTableSkeleton } from "layouts/Orders/components/OrdersPageSkeleton";
import { orderKeys, userKeys, vendorKeys } from "query/keys";
import { ORDERS_LIST_PAGE_SIZE, fetchOrdersList } from "query/ordersList";

const baseURI = `${process.env.REACT_APP_API_URL}`;
const ITEMS_PER_PAGE = ORDERS_LIST_PAGE_SIZE;

function rangeDateToIso(d: any) {
  if (!d) return null;
  return (moment.isMoment(d) ? d : moment.utc(String(d), "DD-MM-YYYY")).toISOString();
}

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

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] = useState(null);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [isExportLoading, setIsExportLoading] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useSelector((state: any) => state.auth);
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
    start.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 0) return "اليوم";
    return today.getTime() > start.getTime() ? `منذ ${diffDays} يوم` : "";
  };

  const getStatusValue = (s) => statusValues[s] ?? "";
  const getDeliveryValue = (s) => deliveryStatusValues[s] ?? "";
  const getPaymentValue = (s) => paymentStatus[s] ?? "";

  const ordersListFiltersKey = useMemo(
    () =>
      JSON.stringify({
        p: page,
        on: orderNumberParam,
        v: vendorIdParam,
        s: orderStatusParam,
        ps: paymentStatusParam,
        ds: deliveryStatusParam,
        sd: rangeDateToIso(startDate),
        ed: rangeDateToIso(endDate),
      }),
    [
      page,
      orderNumberParam,
      vendorIdParam,
      orderStatusParam,
      paymentStatusParam,
      deliveryStatusParam,
      startDate,
      endDate,
    ]
  );

  const {
    data: ordersListData,
    isFetching: ordersFetching,
    isError: ordersQueryError,
  } = useQuery({
    queryKey: orderKeys.list(ordersListFiltersKey),
    queryFn: () =>
      fetchOrdersList({
        params: {
          page,
          orderNumberParam,
          vendorIdParam,
          orderStatusParam,
          paymentStatusParam,
          deliveryStatusParam,
          startDate,
          endDate,
        },
        navigate,
      }),
  });

  const orders = ordersListData?.orders ?? [];
  const totalPages = ordersListData?.totalPages ?? 0;

  const { data: vendors = [] } = useQuery({
    queryKey: vendorKeys.list(),
    queryFn: async () => {
      const { data: body } = await axiosRequest.get("/vendors");
      return [
        { label: "هومكس", value: "0" },
        ...body.data.map((v) => ({ label: v.name, value: v.id })),
      ];
    },
    staleTime: 5 * 60_000,
  });

  const { data: users = [] } = useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const { data: body } = await axiosRequest.get(`${baseURI}/users`);
      return body.data;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (ordersQueryError) NotificationMeassage("error", "حدث خطأ");
  }, [ordersQueryError]);

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
      .then(() => {
        queryClient.invalidateQueries({ queryKey: orderKeys.all() });
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
      queryClient.invalidateQueries({ queryKey: orderKeys.all() });
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
        queryClient.invalidateQueries({ queryKey: orderKeys.all() });
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
        queryClient.invalidateQueries({ queryKey: orderKeys.all() });
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
      ...(startDate && { startDate: rangeDateToIso(startDate) }),
      ...(endDate && { endDate: rangeDateToIso(endDate) }),
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
    "& .MuiInputLabel-root": {
      fontSize: "0.8125rem",
      color: "primary.main",
      "&.Mui-focused": { color: "primary.main" },
      "&.MuiInputLabel-shrink": { color: "primary.main" },
    },
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
        minWidth: 80,
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
      cols.push({ field: "type", headerName: "النوع", minWidth: 100, flex: 0.5, sortable: false });
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
        flex: 0.4,
        sortable: false,
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
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%", mb: 2 }}>
            <TextField
              label="رقم الطلب"
              placeholder="ابحث برقم الطلب…"
              variant="outlined"
              size="small"
              color="primary"
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
            {!isVendor && selectionModel.length > 0 && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  sx={(t) => ({
                    fontWeight: 600,
                    borderColor: t.palette.primary.main,
                    color: t.palette.primary.main,
                    backgroundColor: alpha(t.palette.primary.main, 0.08),
                    "&:hover": {
                      borderColor: t.palette.primary.dark,
                      backgroundColor: alpha(t.palette.primary.main, 0.14),
                    },
                  })}
                >
                  تعديل المحدد
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  sx={(t) => ({
                    fontWeight: 600,
                    borderColor: t.palette.error.main,
                    color: t.palette.error.main,
                    backgroundColor: alpha(t.palette.error.main, 0.08),
                    "&:hover": {
                      borderColor: t.palette.error.dark,
                      backgroundColor: alpha(t.palette.error.main, 0.14),
                    },
                  })}
                >
                  حذف المحدد
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {ordersFetching ? (
          <OrdersTableSkeleton />
        ) : (
          <HomixDataTable
            rows={orders}
            columns={columns}
            getRowId={(r) => r.orderId}
            height={560}
            page={gridPage0}
            pageSize={ITEMS_PER_PAGE}
            rowCount={serverRowCount}
            paginationMode="server"
            onPageChange={(newPage) => setParams({ page: String(newPage + 1) })}
            checkboxSelection={!isVendor}
            selectionModel={!isVendor ? selectionModel : []}
            onSelectionModelChange={(m) => setSelectionModel(m)}
          />
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Orders;
