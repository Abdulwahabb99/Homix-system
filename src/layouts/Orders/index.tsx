import React, { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import moment from "moment";
import "moment-timezone";
import "shared/functions/momentLocale";
import { useSelector } from "react-redux";
import axiosRequest from "shared/functions/axiosRequest";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import BulkEditModal from "layouts/Orders/components/BulkEditModal";
import EditOrdarModal from "layouts/Orders/components/EditOrderModal";
import { orderKeys, userKeys, vendorKeys } from "query/keys";
import { ORDERS_LIST_PAGE_SIZE, fetchOrdersList } from "query/ordersList";
import { mergeHomixVendorOptions, useOrdersMeta } from "query/ordersMeta.api";
import { ORDERS_SORT_OPTIONS } from "layouts/Orders/utils/constants";
import { useOrdersSummaryQuery } from "query/ordersSummary.api";

/* ── New UI components ── */
import OrdersHomixListingHeader from "layouts/Orders/components/OrdersHomixListingHeader";
import OrdersHomixKpiRow from "layouts/Orders/components/OrdersHomixKpiRow";
import OrdersHomixSearchCard from "layouts/Orders/components/OrdersHomixSearchCard";
import OrdersHomixFiltersPanel from "layouts/Orders/components/OrdersHomixFiltersPanel";
import OrdersHomixTableV2 from "layouts/Orders/components/OrdersHomixTableV2";
import {
  OrdersHomixPageTopSkeleton,
  OrdersHomixTableSkeleton,
} from "layouts/Orders/components/OrdersHomixSkeletons";
import { HX } from "layouts/Orders/ordersHomixTheme";

const baseURI = `${process.env.REACT_APP_API_URL}`;
const ITEMS_PER_PAGE = ORDERS_LIST_PAGE_SIZE;

function rangeDateToIso(d: any) {
  if (!d) return null;
  return (moment.isMoment(d) ? d : moment.utc(String(d), "DD-MM-YYYY")).toISOString();
}

function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Date range — two independent URL-driven bounds (startDate / endDate) ──
     Stored in the URL as "DD-MM-YYYY"; exposed as UTC moments for the queries. */
  const startDate = useMemo(() => {
    const raw = searchParams.get("startDate");
    return raw ? moment.utc(raw, "DD-MM-YYYY").startOf("day") : "";
  }, [searchParams]);
  const endDate = useMemo(() => {
    const raw = searchParams.get("endDate");
    return raw ? moment.utc(raw, "DD-MM-YYYY").endOf("day") : "";
  }, [searchParams]);

  /* ── URL-driven filter params (existing, unchanged) ── */
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const orderNumber = searchParams.get("orderNumber") || "";
  const orderStatus = useMemo(() => {
    const raw = searchParams.get("status");
    if (!raw) return [];
    return raw.split(",").map(Number).filter((n) => !isNaN(n));
  }, [searchParams]);
  const selectedVendor = useMemo(() => {
    const raw = searchParams.get("vendorId");
    if (!raw) return [];
    return raw.split(",");
  }, [searchParams]);
  const payment = searchParams.get("paymentStatus") || "";
  const filterUserId = searchParams.get("userId") || "";
  const paymentList = useMemo(() => {
    const raw = searchParams.get("paymentStatus");
    return raw ? raw.split(",") : [];
  }, [searchParams]);
  const userIdList = useMemo(() => {
    const raw = searchParams.get("userId");
    return raw ? raw.split(",") : [];
  }, [searchParams]);
  const deliveryByList = useMemo(() => {
    const raw = searchParams.get("deliveryBy");
    if (!raw) return [];
    return raw.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
  }, [searchParams]);
  const deliveryStatusList = useMemo(() => {
    const raw = searchParams.get("deliveryStatus");
    if (!raw) return [];
    return raw.split(",").map(Number).filter((n) => !isNaN(n));
  }, [searchParams]);
  const priorityList = useMemo(() => {
    const raw = searchParams.get("priority");
    return raw ? raw.split(",") : [];
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, string | string[] | number | null | undefined>) => {
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

  /* ── Local search state (client-side filters on current page) ── */
  const [searchOperationCode, setSearchOperationCode] = useState("");
  const [searchProductCode,   setSearchProductCode]   = useState("");
  const [searchCustomerName,  setSearchCustomerName]  = useState("");

  /* ── Debounced API values — 500 ms after user stops typing ── */
  const [apiOperationCode, setApiOperationCode] = useState("");
  const [apiProductCode,   setApiProductCode]   = useState("");
  const [apiCustomerName,  setApiCustomerName]  = useState("");

  useEffect(() => {
    const t = setTimeout(() => setApiOperationCode(searchOperationCode), 500);
    return () => clearTimeout(t);
  }, [searchOperationCode]);

  useEffect(() => {
    const t = setTimeout(() => setApiProductCode(searchProductCode), 500);
    return () => clearTimeout(t);
  }, [searchProductCode]);

  useEffect(() => {
    const t = setTimeout(() => setApiCustomerName(searchCustomerName), 500);
    return () => clearTimeout(t);
  }, [searchCustomerName]);

  /* ── Modal state ── */
  const [isEditModalOpen,       setIsEditModalOpen]       = useState(false);
  const [isDeleteModalOpen,     setIsDeleteModalOpen]     = useState(false);
  const [selectedEditOrder,     setSelectedEditOrder]     = useState(null);
  const [isBulkEditModalOpen,   setIsBulkEditModalOpen]   = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSubmitting,          setIsSubmitting]          = useState(false);
  const [selectionModel,        setSelectionModel]        = useState<(string | number)[]>([]);
  const [isExportLoading,       setIsExportLoading]       = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useSelector((state: any) => state.auth);
  const isVendor = user.userType === "2";

  const orderStatusParam   = searchParams.get("status");
  const vendorIdParam      = searchParams.get("vendorId");
  const orderNumberParam   = searchParams.get("orderNumber");
  const paymentStatusParam = searchParams.get("paymentStatus");
  const deliveryStatusParam = searchParams.get("deliveryStatus");
  const deliveryByParam = searchParams.get("deliveryBy");
  const shippingCompanyParam = searchParams.get("shippingCompany");
  const priorityParam = searchParams.get("priority");
  const sortKey = searchParams.get("sort") || "newest";
  const sortConfig = useMemo(
    () => ORDERS_SORT_OPTIONS.find((o) => o.key === sortKey) ?? ORDERS_SORT_OPTIONS[0],
    [sortKey]
  );

  const metaQuery = useOrdersMeta(Boolean(token));

  const ordersListFiltersKey = useMemo(
    () =>
      JSON.stringify({
        p: page, on: orderNumberParam, v: vendorIdParam,
        s: orderStatusParam, ps: paymentStatusParam, ds: deliveryStatusParam,
        u: filterUserId || null,
        db: deliveryByParam || null,
        sc: shippingCompanyParam || null,
        pr: priorityParam || null,
        srt: sortKey,
        sd: rangeDateToIso(startDate), ed: rangeDateToIso(endDate),
        oc: apiOperationCode || null,
        cn: apiCustomerName || null,
        pc: apiProductCode || null,
      }),
    [
      page, orderNumberParam, vendorIdParam, orderStatusParam, paymentStatusParam,
      deliveryStatusParam, filterUserId, deliveryByParam, shippingCompanyParam, priorityParam, sortKey, startDate, endDate,
      apiOperationCode, apiCustomerName, apiProductCode,
    ]
  );

  const ordersSummaryFiltersKey = useMemo(
    () =>
      JSON.stringify({
        on: orderNumberParam || null,
        oc: searchOperationCode || null,
        cn: searchCustomerName || null,
        pc: searchProductCode || null,
        v: vendorIdParam || null,
        s: orderStatusParam || null,
        ps: paymentStatusParam || null,
        ds: deliveryStatusParam || null,
        u: filterUserId || null,
        db: deliveryByParam || null,
        sc: shippingCompanyParam || null,
        pr: priorityParam || null,
        sd: rangeDateToIso(startDate),
        ed: rangeDateToIso(endDate),
      }),
    [
      orderNumberParam,
      searchOperationCode,
      searchCustomerName,
      searchProductCode,
      vendorIdParam,
      orderStatusParam,
      paymentStatusParam,
      deliveryStatusParam,
      filterUserId,
      deliveryByParam,
      shippingCompanyParam,
      priorityParam,
      startDate,
      endDate,
    ]
  );

  const ordersSummaryParams = useMemo(
    () => ({
      orderNumber: orderNumberParam || undefined,
      operationCode: searchOperationCode || undefined,
      customerName: searchCustomerName || undefined,
      productCode: searchProductCode || undefined,
      vendorId: vendorIdParam || undefined,
      status: orderStatusParam || undefined,
      paymentStatus: paymentStatusParam || undefined,
      deliveryStatus: deliveryStatusParam || undefined,
      deliveryBy: deliveryByParam || undefined,
      shippingCompany: shippingCompanyParam || undefined,
      userId: filterUserId || undefined,
      priority: priorityParam || undefined,
      startDate: rangeDateToIso(startDate) ?? undefined,
      endDate: rangeDateToIso(endDate) ?? undefined,
    }),
    [
      orderNumberParam,
      searchOperationCode,
      searchCustomerName,
      searchProductCode,
      vendorIdParam,
      orderStatusParam,
      paymentStatusParam,
      deliveryStatusParam,
      filterUserId,
      deliveryByParam,
      shippingCompanyParam,
      priorityParam,
      startDate,
      endDate,
    ]
  );

  const ordersSummaryQuery = useOrdersSummaryQuery(ordersSummaryFiltersKey, ordersSummaryParams, Boolean(token));

  const {
    data: ordersListData,
    isFetching: ordersFetching,
    isError: ordersQueryError,
  } = useQuery({
    queryKey: orderKeys.list(ordersListFiltersKey),
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchOrdersList({
        params: {
          page, orderNumberParam, vendorIdParam, orderStatusParam,
          paymentStatusParam, deliveryStatusParam,
          userIdParam: filterUserId || undefined,
          deliveryByParam: deliveryByParam || undefined,
          shippingCompanyParam: shippingCompanyParam || undefined,
          priorityParam: priorityParam || undefined,
          sortField: sortConfig.field,
          sortDir: sortConfig.dir,
          startDate, endDate,
          operationCode: apiOperationCode || undefined,
          customerName: apiCustomerName || undefined,
          productCode: apiProductCode || undefined,
        },
        navigate,
      }),
  });

  const orders          = ordersListData?.orders ?? [];
  const totalPages      = ordersListData?.totalPages ?? 0;
  const totalCountApi   = ordersListData?.totalCount;
  /** true only on the very first load (no cached data yet) */
  const isInitialLoad   = ordersFetching && !ordersListData;

  /* ── Vendors query (unchanged) ── */
  const { data: vendors = [] } = useQuery({
    queryKey: vendorKeys.list(),
    queryFn: async () => {
      const { data: body } = await axiosRequest.get("/vendors");
      return [
        { label: "هومكس", value: "0" },
        ...body.data.map((v: any) => ({ label: v.name, value: v.id })),
      ];
    },
    staleTime: 5 * 60_000,
  });

  const filterVendorOptions = useMemo(() => {
    const fromMeta = metaQuery.data?.vendors;
    if (fromMeta?.length) return mergeHomixVendorOptions(fromMeta);
    return vendors;
  }, [metaQuery.data?.vendors, vendors]);

  /* ── Users query (unchanged) ── */
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

  /* ── calculateDaysFromPoDate (unchanged) ── */
  const calculateDaysFromPoDate = useCallback((date: string) => {
    if (!date) return "";
    const start = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 0) return "اليوم";
    return today.getTime() > start.getTime() ? `${diffDays}` : "";
  }, []);

  /* ── Edit / Delete handlers (unchanged) ── */
  const onEditConfirm = (
    id: any, orderSt: any, commission: any, totalVendorDue: any, pay: any,
    downPayment: any, toBeCollected: any, shippingFees: any, selectedV: any,
    administrator: any, shippedFromInventory: any, totalCompanyDue: any, expectedDeliveryDate: any
  ) => {
    setIsSubmitting(true);
    axiosRequest
      .put(`${baseURI}/orders/${id}`, {
        ...(orderSt && { status: orderSt }),
        ...(expectedDeliveryDate && expectedDeliveryDate !== "Invalid date" && { expectedDeliveryDate }),
        ...(selectedV && { vendorId: selectedV }),
        ...(administrator && { userId: administrator }),
        commission, paymentStatus: pay, downPayment, shippingFees,
        toBeCollected, shippedFromInventory, totalVendorDue, totalCompanyDue,
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: orderKeys.all() });
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch(() => NotificationMeassage("error", "حدث خطأ"))
      .finally(() => { setIsSubmitting(false); setIsEditModalOpen(false); });
  };

  const handleFullReset = () => {
    setSearchParams(new URLSearchParams([["page", "1"]]));
    setSearchOperationCode("");
    setSearchProductCode("");
    setSearchCustomerName("");
    setApiOperationCode("");
    setApiProductCode("");
    setApiCustomerName("");
  };

  /* ── Date range: each bound applies directly to the URL (→ refetch) ── */
  const handleStartDateChange = (iso: string) => {
    setParams({ page: "1", startDate: iso ? moment(iso, "YYYY-MM-DD").format("DD-MM-YYYY") : "" });
  };
  const handleEndDateChange = (iso: string) => {
    setParams({ page: "1", endDate: iso ? moment(iso, "YYYY-MM-DD").format("DD-MM-YYYY") : "" });
  };
  const handleDateRangeClear = () => {
    setParams({ page: "1", startDate: "", endDate: "" });
  };

  /* ── Priority: chips apply directly (→ refetch) ── */
  const handlePriorityChange = (next: string[]) => {
    setParams({ page: "1", priority: next });
  };

  /* ── Shipping company: applies directly on selection (→ refetch) ── */
  const handleShippingCompanyChange = (id: string) => {
    setParams({ page: "1", shippingCompany: id || "" });
  };

  /* ── Sort: يُرسَل للخادم عبر sort[field]=dir ── */
  const handleSortChange = (key: string) => {
    setParams({ page: "1", sort: key });
  };

  const handleApplyFilters = (d: {
    orderStatus: number[];
    selectedVendor: string[];
    paymentStatus: string[];
    deliveryStatus: number[];
    userId: string[];
    deliveryBy: number[];
  }) => {
    setParams({
      page:           "1",
      status:         d.orderStatus?.length   ? d.orderStatus.map(String)   : "",
      vendorId:       d.selectedVendor?.length ? d.selectedVendor            : "",
      paymentStatus:  d.paymentStatus?.length ? d.paymentStatus : "",
      deliveryStatus: d.deliveryStatus?.length ? d.deliveryStatus.map(String) : "",
      userId:         d.userId?.length ? d.userId : "",
      deliveryBy:     d.deliveryBy?.length ? d.deliveryBy.map(String).join(",") : "",
    });
  };

  const handleFilterReset = () => {
    setParams({
      page: "1",
      status: "",
      vendorId: "",
      paymentStatus: "",
      deliveryStatus: "",
      userId: "",
      deliveryBy: "",
      shippingCompany: "",
      priority: "",
      startDate: "",
      endDate: "",
    });
  };

  const deleteOrder = () => {
    axiosRequest.delete(`${baseURI}/orders/${(selectedEditOrder as any).orderId}`).then(() => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all() });
      NotificationMeassage("success", "تم حذف الطلب");
      setIsDeleteModalOpen(false);
    });
  };

  const selectedRows = useMemo(
    () => orders.filter((o: any) => selectionModel.includes(o.rowId ?? o.orderId)),
    [orders, selectionModel]
  );

  const bulkEdit = (orderSt: any, pay: any, shippedFromInventory: any) => {
    const orderIds = [...new Set(selectedRows.map((o: any) => o.orderId))];
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
    const orderIds = [...new Set(selectedRows.map((o: any) => o.orderId))];
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
      ...(vendorIdParam      && { vendorId:      vendorIdParam }),
      ...(orderStatusParam   && { status:         orderStatusParam }),
      ...(paymentStatusParam && { paymentStatus: paymentStatusParam }),
      ...(deliveryStatusParam && { deliveryStatus: deliveryStatusParam }),
      ...(filterUserId       && { userId:         filterUserId }),
      ...(deliveryByParam     && { deliveryBy:     deliveryByParam }),
      ...(shippingCompanyParam && { shippingCompany: shippingCompanyParam }),
      ...(priorityParam       && { priority:       priorityParam }),
      ...(startDate          && { startDate:      rangeDateToIso(startDate) }),
      ...(endDate            && { endDate:        rangeDateToIso(endDate) }),
    });
    setIsExportLoading(true);
    axiosRequest
      .get(`${baseURI}/orders/export?${query}`)
      .then(({ request: { responseURL } }: any) => { window.location.href = responseURL; })
      .catch(() => NotificationMeassage("error", "حدث خطأ"))
      .finally(() => setIsExportLoading(false));
  };

  const gridPage0 = page - 1;

  return (
    <DashboardLayout
      header={
        <OrdersHomixListingHeader
          isVendor={isVendor}
          isExportLoading={isExportLoading}
          onExport={handleExport}
          onAddOrder={() => navigate("/orders/add")}
        />
      }
    >
      <ToastContainer />

      {/* ── Modals (unchanged) ── */}
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

      {/* ── Page layout ── */}
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, bgcolor: HX.bg, overflow: "hidden" }}>
        <Box sx={{
          flex: 1, overflowY: "auto",
          p: "14px 22px",
          display: "flex", flexDirection: "column", gap: "12px",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: HX.border, borderRadius: 4 },
        }}>

          {isInitialLoad ? (
            /* ── First-load skeleton: KPI + Search + Filters + Table ── */
            <OrdersHomixPageTopSkeleton />
          ) : (
            /* ── Loaded: real KPI + Search + Filters ── */
            <>
              <OrdersHomixKpiRow
                summaryCards={ordersSummaryQuery.data}
                isSummaryLoading={ordersSummaryQuery.isPending}
              />

              <OrdersHomixSearchCard
                orderNumber={orderNumber}
                onOrderNumberChange={(v) => setParams({ page: "1", orderNumber: v })}
                operationCode={searchOperationCode}
                onOperationCodeChange={setSearchOperationCode}
                productCode={searchProductCode}
                onProductCodeChange={setSearchProductCode}
                customerName={searchCustomerName}
                onCustomerNameChange={setSearchCustomerName}
              />

              <OrdersHomixFiltersPanel
                isVendor={isVendor}
                vendors={filterVendorOptions}
                users={users}
                meta={metaQuery.data}
                value={{
                  orderStatus:    orderStatus,
                  selectedVendor: selectedVendor,
                  paymentStatus:  paymentList,
                  deliveryStatus: deliveryStatusList,
                  userId:         userIdList,
                  deliveryBy:     deliveryByList,
                }}
                onApply={handleApplyFilters}
                onReset={handleFilterReset}
                priorityValue={priorityList}
                onPriorityChange={handlePriorityChange}
                shippingCompanyValue={shippingCompanyParam || ""}
                onShippingCompanyChange={handleShippingCompanyChange}
                startDate={startDate ? startDate.format("YYYY-MM-DD") : ""}
                endDate={endDate ? endDate.format("YYYY-MM-DD") : ""}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onDateRangeClear={handleDateRangeClear}
              />

            </>
          )}

          {/* Table — skeleton on any load/refetch (filter change, page change, first load) */}
          {ordersFetching ? (
            <OrdersHomixTableSkeleton rows={8} />
          ) : (
            <OrdersHomixTableV2
              orders={orders}
              isVendor={isVendor}
              users={users}
              vendors={vendors}
              selectionModel={!isVendor ? selectionModel : []}
              onSelectionModelChange={(m) => setSelectionModel(m)}
              onEdit={(row) => { setSelectedEditOrder(row as any); setIsEditModalOpen(true); }}
              onDelete={(row) => { setSelectedEditOrder(row as any); setIsDeleteModalOpen(true); }}
              onView={(orderId) => navigate(`/orders/${orderId}`)}
              onBulkEdit={() => setIsBulkEditModalOpen(true)}
              onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
              page={gridPage0}
              totalPages={totalPages}
              pageSize={ITEMS_PER_PAGE}
              totalCount={totalCountApi}
              onPageChange={(newPage) => setParams({ page: String(newPage + 1) })}
              calculateDaysFromPoDate={calculateDaysFromPoDate}
              isFetching={ordersFetching}
              onExport={handleExport}
              isExporting={isExportLoading}
              sortValue={sortKey}
              onSortChange={handleSortChange}
            />
          )}

        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default Orders;
