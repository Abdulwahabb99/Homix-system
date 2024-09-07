import { IconButton } from "@mui/material";
import axios from "axios";
import AgGrid from "components/AgGrid/AgGrid";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import Spinner from "components/Spinner/Spinner";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import styles from "./Factories.module.css";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
const statusOptions = { 1: "اونلاين", 2: "اوفلاين" };
function Factories() {
  const [isloading, setIsLoading] = useState(false);
  const [isDeleteModalOpenned, setIsDeleteModalOpenned] = useState(false);
  const [factories, setFactories] = useState([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const getStatusValue = (value) => {
    const statusValue = statusOptions[value];
    return statusValue;
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

  const getFactories = () => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/factories`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }

        const newData = data.data.sort((a, b) => a.id - b.id);
        setFactories(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const deleteFactory = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/factories/${selectedFactoryId}`)
      .then(() => {
        setIsDeleteModalOpenned(false);
        const newData = factories.filter((factory) => factory.id !== selectedFactoryId);
        setFactories(newData);
        NotificationMeassage("success", "تم مسح المصنع");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    getFactories();
  }, []);

  const colDefs = [
    {
      field: "name",
      headerName: "اسم المصنع",
      sortable: true,
      minWidth: 140,
      cellRenderer: (params) => (
        <LinkRenderer
          data={params.data}
          value={params.data.name}
          url={`/factories/${params.data.id}`}
        />
      ),
    },
    { field: "address", headerName: "العنوان", minWidth: 140, sortable: false },
    { field: "factoryCategory", headerName: "تخصص المصنع", sortable: true, minWidth: 140 },
    { field: "contactPersonName", headerName: "اسم المسؤول", sortable: true, minWidth: 140 },
    { field: "contactPersonPhoneNumber", headerName: "رقم المسؤول", sortable: true, minWidth: 140 },
    {
      headerName: "مصاريف الشحن",
      headerClass: styles.header,

      children: [
        {
          field: "cairoGizaShipping",
          headerName: "القاهرة والجيزة",
          sortable: true,
          pivot: true,
          minWidth: 120,
        },
        {
          field: "otherCitiesShipping",
          headerName: "باقي المحافظات",
          sortable: false,
          pivot: true,
          minWidth: 130,
        },
      ],
      minWidth: 140,
    },
    {
      field: "status",
      headerName: "الحالة",
      sortable: false,
      minWidth: 90,
      valueGetter: ({ data }) => getStatusValue(data.status),
    },
    { field: "website", headerName: "الويب سايت", sortable: true, minWidth: 140 },

    {
      headerName: "تعديل",
      minWidth: 80,
      maxWidth: 80,
      sortable: false,
      cellRenderer: ({ data: { id } }) => (
        <IconButton onClick={() => navigate(`/factories/edit/${id}`)} sx={{ fontSize: "1.2rem" }}>
          <EditIcon />
        </IconButton>
      ),
    },
    {
      headerName: "حذف",
      minWidth: 80,
      maxWidth: 80,
      sortable: false,
      cellRenderer: ({ data: { id } }) => (
        <IconButton
          onClick={() => {
            setIsDeleteModalOpenned(true);
            setSelectedFactoryId(id);
          }}
          sx={{ fontSize: "1.2rem", color: "red" }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      {isDeleteModalOpenned && selectedFactoryId && (
        <ConfirmDeleteModal
          open={isDeleteModalOpenned}
          onClose={() => setIsDeleteModalOpenned(false)}
          handleConfirmDelete={deleteFactory}
        />
      )}
      {isloading ? (
        <Spinner />
      ) : (
        <AgGrid
          rowData={factories}
          columnDefs={colDefs}
          defaultColDef={{
            resizable: true,
          }}
          enableQuickFilter
          gridHeight={"500px"}
          handleAdd={() => navigate(`/factories/add`)}
        />
      )}
    </DashboardLayout>
  );
}

export default Factories;
