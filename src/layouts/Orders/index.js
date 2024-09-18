import React, { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Spinner from "components/Spinner/Spinner";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
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

const ITEMS_PER_PAGE = 150;
const statusValues = {
  1: "معلق",
  2: "قيد التنفيذ",
  3: "نصف مكتمل",
  4: "جاري التوصيل ",
  5: "تم التوصيل",
  6: "مسترجع ",
  7: "استبدال ",
};
const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "قيد التنفيذ", value: 2 },
  { label: "نصف مكتمل", value: 3 },
  { label: "جاري التوصيل ", value: 4 },
  { label: "تم التوصيل", value: 5 },
  { label: "مسترجع ", value: 6 },
  { label: "استبدال ", value: 7 },
];
const PAYMENT_STATUS = { 1: "مدفوع", 2: "دفع عند الاستلام" };
const baseURI = `${process.env.REACT_APP_API_URL}`;

function Orders() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const orderNumberParam = searchParams.get("orderNumber");
  const vendorIdParam = searchParams.get("vendorId");
  const orderStatusParam = searchParams.get("status");
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(vendorIdParam || "");
  const [orderStatus, setOrderStatus] = useState(orderStatusParam || "");
  const isAdmin = user.userType === "1";

  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const handlePageChange = (event, value) => {
    setSearchParams({ page: value.toString() });
  };
  const getStatusValue = (status) => {
    const resultValue = statusValues[status];
    return resultValue;
  };
  const getPaymentValue = (status) => {
    const resultValue = PAYMENT_STATUS[status];
    return resultValue;
  };
  const handleChangeStatus = (value) => {
    setOrderStatus(value);
    setSearchParams({ ...(vendorIdParam ? { vendorId: vendorIdParam } : {}), status: value });
  };
  const handleChangeVendor = (value) => {
    setSelectedVendor(value);
    setSearchParams({ vendorId: value, ...(orderStatusParam ? { status: orderStatusParam } : {}) });
  };
  function formatDateStringToArabic(dateString) {
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const date = new Date(year, month, day);
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    const formatter = new Intl.DateTimeFormat("ar-EG", options);

    return formatter.format(date);
  }
  axios.interceptors.request.use(
    (config) => {
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  const getVendors = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/vendors`)
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
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const orderNumber = Boolean(orderNumberParam) ? `&orderNumber=${orderNumberParam}` : "";
      const vendorId = vendorIdParam ? `&vendorId=${vendorIdParam}` : "";
      const orderStatus = orderStatusParam ? `&status=${orderStatusParam}` : "";
      const response = await axios.get(
        vendorId
          ? `${process.env.REACT_APP_API_URL}/orders?page=${page}&size=${ITEMS_PER_PAGE}${orderNumber}${orderStatus}${vendorId}`
          : `${process.env.REACT_APP_API_URL}/orders?page=${page}&size=${ITEMS_PER_PAGE}${orderNumber}${orderStatus}`
      );
      if (response.data.force_logout) {
        localStorage.removeItem("user");
        navigate("/authentication/sign-in");
      }
      const newOrders = response.data.data.orders
        .map((order) => {
          return {
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
          };
        })
        .sort((a, b) => b.orderNumber - a.orderNumber);
      setOrders(newOrders);
      setTotalPages(response.data.data.totalPages);
    } catch (res) {
      NotificationMeassage("error", "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };
  const onEditConfirm = (
    id,
    orderStatus,
    commission,
    manufacturingDate,
    paymentStatus,
    downPayment,
    toBeCollected
  ) => {
    axios
      .put(`${baseURI}/orders/${id}`, {
        status: orderStatus,
        commission: commission,
        paymentStatus: paymentStatus,
        downPayment: downPayment,
        toBeCollected: toBeCollected,
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
      field: "orderNumber",
      headerName: "رقم الطلب",
      sortable: true,
      minWidth: 110,
      cellRenderer: (params) => (
        <LinkRenderer
          data={params.data}
          value={params.data.orderNumber}
          openInNewTab
          url={`/orders/${params.data.orderId}`}
        />
      ),
    },
    { field: "customerName", headerName: "اسم العميل", sortable: true, minWidth: 200 },
    {
      field: "status",
      headerName: "حالة الطلب",
      sortable: true,
      minWidth: 120,
      valueGetter: (node) => getStatusValue(node.data.status),
    },
    {
      field: "totalPrice",
      headerName: "المجموع",
      sortable: false,
      minWidth: 100,
      valueGetter: ({ data }) => {
        return Number(data.totalPrice);
      },
    },
    {
      field: "totalCost",
      headerName: "مجموع التكلفة",
      sortable: true,
      minWidth: 140,
    },
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
      field: "paymentStatus",
      headerName: "طريقة الدفع",
      minWidth: 170,
      valueGetter: (node) => getPaymentValue(node.data.paymentStatus),
    },
    {
      field: "date",
      headerName: "التاريخ",
      sortable: true,
      minWidth: 100,
      valueGetter: (node) => formatDateStringToArabic(node.data.date),
    },
    ...(user?.userType === "1"
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
  }, [page, orderStatusParam, orderNumberParam, vendorIdParam]);

  useEffect(() => {
    if (vendorIdParam) {
      fetchOrders();
    }
  }, [vendorIdParam]);

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
      {isEditModalOpen && selectedEditOrder && (
        <EditOrdarModal
          data={selectedEditOrder}
          open={isEditModalOpen}
          onEdit={onEditConfirm}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {!isLoading ? (
        <>
          <Grid container spacing={1}>
            <Grid item xs={6} md={5} lg={3}>
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
            <Grid item xs={6} md={5} lg={3}>
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
