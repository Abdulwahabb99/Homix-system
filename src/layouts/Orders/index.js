// Orders.js
import React, { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import AgGrid from "components/AgGrid/AgGrid";
import Spinner from "components/Spinner/Spinner";
import ActionRenderer from "components/ActionRenderer/ActionRenderer";
import ConfirmDeleteModal from "components/ConfirmDeleteModal/ConfirmDeleteModal";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { IconButton, Pagination } from "@mui/material";
import SearchDialog from "./components/SearchDialog/SearchDialog";
import EditIcon from "@mui/icons-material/Edit";
import EditOrdarModal from "./components/EditOrderModal";

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
function Orders() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState({});
  const [selectedEditOrder, setSelectedEditOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parseInt(searchParams.get("page")) || 1;
  const orderNumberParam = searchParams.get("orderNumber");
  const vendorNameParam = searchParams.get("vendorName");
  const orderStatusParam = searchParams.get("status");
  const [searchText, setSearchText] = useState();
  const [totalPages, setTotalPages] = useState(0);
  const handlePageChange = (event, value) => {
    setSearchParams({ page: value.toString() });
    // navigate(
    //   `/orders?page=${value}&orderNumber=${orderNumberParam ? orderNumberParam : ""}&vendorName=${
    //     vendorNameParam ? vendorNameParam : ""
    //   }&status=${orderStatusParam ? orderStatusParam : ""}`
    // );
  };
  const getStatusValue = (status) => {
    const resultValue = statusValues[status];
    return resultValue;
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
      const newOrders = response.data.data.orders.map((order) => ({
        orderNumber: order.orderNumber,
        items: order.orderLines,
        totalPrice: order.totalPrice,
        subTotalPrice: order.subTotalPrice,
        status: order.status,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        orderId: order.id,
        date: formatDateStringToArabic(order.createdAt),
        orderData: order,
      }));
      setOrders(newOrders);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const onDeleteConfirm = (row) => {
    setRowData((prevRowData) =>
      prevRowData.filter((r) => r.orderNumber !== selectedRowData.orderNumber)
    );
    setIsConfirmModalOpen(false);
  };
  const openEditModal = (value) => {
    setSelectedEditOrder(value);
  };
  function formatDateStringToArabic(dateString) {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    const formatter = new Intl.DateTimeFormat("ar-EG", options);
    return formatter.format(date);
  }

  const [colDefs, setColDefs] = useState([
    {
      field: "orderNumber",
      headerName: "رقم الطلب",
      sortable: true,
      minWidth: 90,
      cellRenderer: (params) => (
        <LinkRenderer
          data={params.data}
          value={params.data.orderNumber}
          openInNewTab
          url={`/orders/${params.data.orderId}`}
        />
      ),
    },
    { field: "customerName", headerName: "اسم العميل", sortable: true, minWidth: 100 },
    {
      field: "status",
      headerName: "حالة الطلب",
      sortable: true,
      minWidth: 100,
      valueGetter: (node) => getStatusValue(node.data.status),
    },
    {
      field: "totalPrice",
      headerName: "المجموع",
      sortable: false,
      minWidth: 100,
      valueGetter: ({ data }) => {
        let totalPrice = 0;
        data.items.forEach((item) => (totalPrice += Number(item.price)));
        return totalPrice;
      },
    },
    { field: "date", headerName: "التاريخ", sortable: true, minWidth: 100 },
    {
      headerName: "الإعدادات",
      width: 140,
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
  ]);

  useEffect(() => {
    fetchOrders();
  }, [page, orderStatusParam, vendorNameParam, orderNumberParam]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {isConfirmModalOpen && (
        <ConfirmDeleteModal
          onConfirm={onDeleteConfirm}
          open={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
        />
      )}
      {isSearchModalOpen && (
        <SearchDialog
          onConfirm={onDeleteConfirm}
          open={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          setSearchParams={setSearchParams}
        />
      )}
      {isEditModalOpen && selectedEditOrder && (
        <EditOrdarModal
          data={selectedEditOrder}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {!isLoading && orders ? (
        <>
          <AgGrid
            rowData={orders}
            columnDefs={colDefs}
            defaultColDef={{
              resizable: true,
            }}
            setColDefs={setColDefs}
            setRowData={setRowData}
            searchText={searchText}
            handleSearchClick={() => setIsSearchModalOpen(true)}
          />
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            sx={{ display: "flex", justifyContent: "center", marginTop: "77px" }}
          />
        </>
      ) : (
        <Spinner />
      )}
    </DashboardLayout>
  );
}

export default Orders;
