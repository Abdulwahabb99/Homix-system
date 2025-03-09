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
import styles from "./Users.module.css";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
import { getUserType } from "utils/constants";

function Users() {
  const [isloading, setIsLoading] = useState(false);
  const [isDeleteModalOpenned, setIsDeleteModalOpenned] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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

  const getUsers = () => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/users`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }
        const newData = data.data.sort((a, b) => a.id - b.id);
        setUsers(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const deleteUser = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/users/${selectedUserId}`)
      .then(() => {
        setIsDeleteModalOpenned(false);
        const newData = users.filter((user) => user.id !== selectedUserId);
        setUsers(newData);
        NotificationMeassage("success", "تم مسح المصنع");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const colDefs = [
    {
      field: "name",
      headerName: "الاسم",
      sortable: true,
      minWidth: 140,
      valueGetter: ({ data }) => {
        return `${data.firstName} ${data.lastName}`;
      },
      // cellRenderer: (params) => (
      //   <LinkRenderer
      //     data={params.data}
      //     value={params.data.name}
      //     url={`/factories/${params.data.id}`}
      //   />
      // ),
    },
    { field: "email", headerName: "البريد الالكتروني", minWidth: 100, sortable: false },
    {
      field: "userType",
      headerName: "نوع المستخدم",
      sortable: false,
      minWidth: 140,
      valueGetter: ({ data }) => {
        return getUserType(data.userType);
      },
    },
    {
      headerName: "تعديل",
      minWidth: 80,
      maxWidth: 80,
      sortable: false,
      cellRenderer: ({ data: { id } }) => (
        <IconButton onClick={() => navigate(`/users/edit/${id}`)} sx={{ fontSize: "1.2rem" }}>
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
            setSelectedUserId(id);
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
      {isDeleteModalOpenned && selectedUserId && (
        <ConfirmDeleteModal
          open={isDeleteModalOpenned}
          onClose={() => setIsDeleteModalOpenned(false)}
          handleConfirmDelete={deleteUser}
        />
      )}
      {isloading ? (
        <Spinner />
      ) : (
        <AgGrid
          rowData={users}
          columnDefs={colDefs}
          defaultColDef={{
            resizable: true,
          }}
          enableQuickFilter
          gridHeight={"500px"}
          handleAdd={() => navigate(`/users/add`)}
        />
      )}
    </DashboardLayout>
  );
}

export default Users;
