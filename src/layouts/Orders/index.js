import React, { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Spinner from "components/Spinner/Spinner";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
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
import { getUserType } from "shared/utils/constants";

const ITEMS_PER_PAGE = 150;
const statusValues = {
  1: "معلق",
  2: "مؤكد",
  3: "ملغي",
  4: "قيد التصنيع ",
  5: "تم التسليم",
  6: "مسترجع ",
  7: "مستبدل ",
};
const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "مؤكد", value: 2 },
  { label: "ملغي", value: 3 },
  { label: "قيد التصنيع ", value: 4 },
  { label: "تم التسليم", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "مستبدل ", value: 7 },
];
const paymentStatus = { 1: "مدفوع", 2: "دفع عند الاستلام" };
const baseURI = `${process.env.REACT_APP_API_URL}`;

function Orders() {
  const { startDate, endDate, handleDatesChange } = useDateRange({
    defaultDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  const [selectedVendor, setSelectedVendor] = useState(vendorIdParam || "");
  const [orderStatus, setOrderStatus] = useState(orderStatusParam || "");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(paymentStatusParam || "");
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState(deliveryStatusParam || "");
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  moment.locale("ar");
  const { user, token } = useSelector((state) => state.auth);
  const isVendor = user.userType === "2";

  function calculateDaysFromPoDate(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return today > start ? `منذ ${diffDays} يوم` : "";
  }
  const updateParams = (params) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) updated.set(key, value);
      else updated.delete(key);
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchOrders = () => {
    setIsLoading(true);

    const query = new URLSearchParams({
      page,
      size: ITEMS_PER_PAGE,
      ...(orderNumberParam && { orderNumber: orderNumberParam }),
      ...(vendorIdParam && { vendorId: vendorIdParam }),
      ...(orderStatusParam && { status: orderStatusParam }),
      ...(paymentStatusParam && { paymentStatus: paymentStatusParam }),
      ...(deliveryStatusParam && { deliveryStatus: deliveryStatusParam }),
      ...(startDate && { startDate: startDate.utc().toISOString() }),
      ...(endDate && { endDate: endDate.utc().toISOString() }),
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
          .map((order) => ({
            orderNumber: order.orderNumber,
            items: order.orderLines,
            totalPrice: order.totalPrice,
            subTotalPrice: order.subTotalPrice,
            status: order.status,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
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
            code: order.name,
          }))
          .sort((a, b) => b.orderNumber - a.orderNumber);

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
    manufacturingDate,
    paymentStatus,
    downPayment,
    toBeCollected,
    receivedAmount,
    selectedVendor,
    deliveryStatus,
    administrator
  ) => {
    axiosRequest
      .put(`${baseURI}/orders/${id}`, {
        status: orderStatus,
        commission: commission,
        paymentStatus: paymentStatus,
        downPayment: downPayment,
        receivedAmount: receivedAmount,
        toBeCollected: toBeCollected,
        vendor: selectedVendor,
        deliveryStatus: deliveryStatus,
        userType: administrator,
        PoDate: manufacturingDate === "NaN-NaN-NaN" ? null : manufacturingDate,
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
              receivedAmount: data.receivedAmount,
              selectedVendor: data.selectedVendor,
              deliveryStatus: data.deliveryStatus,
            };
          }
          return order;
        });
        setOrders(newOrders);
        NotificationMeassage("success", "تم التعديل بنجاح");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });

    setIsEditModalOpen(false);
  };
  const openEditModal = (value) => {
    setSelectedEditOrder(value);
  };
  const handleReset = () => {
    setSelectedVendor("");
    setOrderStatus("");
    navigate("/orders");
  };

  const colDefs = [
    {
      field: "code",
      headerName: "الكود التعريفي",
      sortable: true,
      minWidth: 110,
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
      field: "deliveryStatus",
      headerName: "حالة التصنيع",
      sortable: true,
      minWidth: 130,
      valueGetter: (node) => getDeliveryStatusValue(node.data.status),
    },
    {
      field: "administrator",
      headerName: "المسؤول",
      sortable: true,
      minWidth: 130,
      valueGetter: (node) => getUserType(node.data.userType),
    },
    {
      field: "totalPrice",
      headerName: "سعر البيع",
      sortable: false,
      minWidth: 100,
      valueGetter: ({ data }) => {
        let orderPrice = 0;
        data.items?.forEach((item) => {
          orderPrice += Number(item.price) * Number(item.quantity);
        });
        return Number(orderPrice.toFixed(0));
      },
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
      headerName: "الأيام المنقضيه",
      sortable: true,
      minWidth: 120,
      valueGetter: (node) => (node.data.PoDate ? calculateDaysFromPoDate(node.data.PoDate) : ""),
    },
    // {
    //   field: "receivedAmount",
    //   headerName: "تكلفة الشحن",
    //   sortable: true,
    //   minWidth: 140,
    // },
    {
      field: "toBeCollected",
      headerName: "المبلغ المطلوب تحصيله",
      minWidth: 175,
    },
    {
      field: "commission",
      headerName: "عمولة المنصة",
      minWidth: 130,
    },
    {
      field: "date",
      headerName: "التاريخ",
      sortable: true,
      minWidth: 100,
      valueGetter: (node) => moment.utc(node.data.date).tz("Africa/Cairo").format("YY/MM/DD"),
    },
    ...(!isVendor
      ? [
          {
            headerName: "",
            minWidth: 120,
            sortable: false,
            cellRenderer: (params) => (
              <IconButton
                onClick={() => {
                  openEditModal(params.data);
                  setIsEditModalOpen(true);
                }}
                sx={{ fontSize: "1.2rem" }}
              >
                <EditIcon />
              </IconButton>
            ),
          },
        ]
      : []),
  ];

  useEffect(() => {
    fetchOrders();
    if (!vendors.length) {
      getVendors();
    }
  }, [
    page,
    orderStatusParam,
    orderNumberParam,
    vendorIdParam,
    startDate,
    endDate,
    paymentStatusParam,
    deliveryStatusParam,
  ]);

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
                    onChange={(e) => handleChangeVendor(e.target.value)}
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
                    <InputLabel id="deliveryStatus">حاله الدفع</InputLabel>
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
                <Grid item xs={6} md={6} lg={3}>
                  <FormControl fullWidth style={{ width: "100%" }}>
                    <InputLabel id="deliveryStatus">حاله التصنيع</InputLabel>
                    <Select
                      labelId="deliveryStatus"
                      id="deliveryStatus"
                      value={selectedDeliveryStatus}
                      label="حاله التصنيع"
                      fullWidth
                      onChange={(e) => handleChangeDeliveryStatus(e.target.value)}
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
              </>
            )}
            <Grid item xs={12} md={5} lg={3}>
              <DateRangePickerWrapper
                startDate={startDate}
                endDate={endDate}
                allowPastDays={true}
                allowFutureDays={false}
                useDefaultPresets={true}
                handleDatesChange={handleDatesChange}
              />{" "}
            </Grid>
          </Grid>

          <OrdersGrid
            rowData={orders}
            columnDefs={colDefs}
            defaultColDef={{
              resizable: true,
            }}
            handleSearchClick={() => setIsSearchModalOpen(true)}
            handleReset={handleReset}
            enableExcel
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
