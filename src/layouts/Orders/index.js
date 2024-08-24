import React, { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import AgGrid from "components/AgGrid/AgGrid";
import Spinner from "components/Spinner/Spinner";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FormControl, IconButton, InputLabel, MenuItem, Pagination, Select } from "@mui/material";
import SearchDialog from "./components/SearchDialog/SearchDialog";
import EditIcon from "@mui/icons-material/Edit";
import EditOrdarModal from "./components/EditOrderModal";
import { ToastContainer } from "react-toastify";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

const ITEMS_PER_PAGE = 30;
const statusValues = {
  1: "معلق",
  2: "قيد التنفيذ",
  3: "مرفوض",
  4: "تم التنفيذ",
  5: "خارج للتوصيل",
  6: "تم التسليم",
  7: "مسترجع",
  8: "ملغي",
};
const statusoptions = [
  { label: "معلق", value: 1 },
  { label: "قيد التنفيذ", value: 2 },
  { label: "رفض", value: 3 },
  { label: "تم التنفيذ", value: 4 },
  { label: "خارج للتوصيل", value: 5 },
  { label: "تم التسليم", value: 6 },
  { label: "مسترجع", value: 7 },
  { label: "ملغي", value: 8 },
];
const PAYMENT_STATUS = { 1: "مدفوع", 2: "دفع عند الاستلام" };

function Orders() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditOrder, setSelectedEditOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const orderNumberParam = searchParams.get("orderNumber");
  const vendorNameParam = searchParams.get("vendorName");
  const orderStatusParam = searchParams.get("status");
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
    setSearchParams({ status: value });
  };

  axios.interceptors.request.use(
    (config) => {
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const orderNumber = Boolean(orderNumberParam) ? `&orderNumber=${orderNumberParam}` : "";
      const vendorName = vendorNameParam ? `&vendorName=${vendorNameParam}` : "";
      const orderStatus = orderStatusParam ? `&status=${orderStatusParam}` : "";
      const response = await axios.get(
        `https://homix.onrender.com/orders?page=${page}&size=${ITEMS_PER_PAGE}${orderNumber}${vendorName}${orderStatus}`
      );
      const newOrders = response.data.data.orders.map((order) => {
        return {
          orderNumber: order.orderNumber,
          items: order.orderLines,
          totalPrice: order.totalPrice,
          subTotalPrice: order.subTotalPrice,
          status: order.status,
          customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          orderId: order.id,
          date: formatDateStringToArabic(order.createdAt),
          receivedAmount: order.receivedAmount,
          shippingFees: order.shippingFees,
          paymentStatus: order.paymentStatus,
          notes: order.notes,
          commission: order.commission,
          PoDate: order.PoDate,
          totalCost: Number(order.totalCost).toFixed(1),
          orderData: order,
        };
      });
      setOrders(newOrders);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
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
    receivedAmount,
    paymentStatus
  ) => {
    axios
      .put(`https://homix.onrender.com/orders/${id}`, {
        status: orderStatus,
        commission: commission,
        receivedAmount: receivedAmount,
        paymentStatus: paymentStatus,
        PoDate: manufacturingDate === "NaN-NaN-NaN" ? null : manufacturingDate,
      })
      .then(({ data: { data } }) => {
        const newOrders = orders.map((order) => {
          if (order.orderId === data.id) {
            return {
              ...order,
              status: data.status,
              commission: data.commission,
              receivedAmount: data.receivedAmount,
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
    navigate("/orders");
  };
  function formatDateStringToArabic(dateString) {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    const formatter = new Intl.DateTimeFormat("ar-EG", options);
    return formatter.format(date);
  }

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
    { field: "customerName", headerName: "اسم العميل", sortable: true, minWidth: 140 },
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
        let totalPrice = 0;
        data.items?.forEach((item) => (totalPrice += Number(item.price)));
        return totalPrice;
      },
    },
    {
      field: "totalCost",
      headerName: "مجموع التكلفة",
      sortable: true,
      minWidth: 140,
    },
    {
      field: "receivedAmount",
      headerName: "المبلغ المستلم",
      minWidth: 140,
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
    { field: "date", headerName: "التاريخ", sortable: true, minWidth: 100 },
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
  ];

  useEffect(() => {
    fetchOrders();
  }, [page, orderStatusParam, vendorNameParam, orderNumberParam]);

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

      {!isLoading && orders ? (
        <>
          <FormControl fullWidth style={{ margin: "0 0 -30px 0", width: "50%" }}>
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
          <AgGrid
            rowData={orders}
            columnDefs={colDefs}
            defaultColDef={{
              resizable: true,
            }}
            handleSearchClick={() => setIsSearchModalOpen(true)}
            handleReset={handleReset}
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
