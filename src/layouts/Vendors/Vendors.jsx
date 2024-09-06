import { IconButton, Switch } from "@mui/material";
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
import ConfirmDeleteModal from "../Factories/ConfirmDeleteModal";
import { LinkRenderer } from "components/LinkRenderer/LinkRenderer";
const statusOptions = { 1: "اونلاين", 2: "اوفلاين" };
function Vendors() {
  const [isloading, setIsLoading] = useState(false);
  const [isDeleteModalOpenned, setIsDeleteModalOpenned] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
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

  const getVendors = () => {
    setIsLoading(true);
    axios
      .get(`https://homix.onrender.com/vendors`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }

        const newData = data.data.sort((a, b) => a.id - b.id);
        setVendors(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  // const deleteVendor = () => {
  //   axios
  //     .delete(`https://homix.onrender.com/vendors/${selectedVendorId}`)
  //     .then(() => {
  //       setIsDeleteModalOpenned(false);
  //       const newData = vendors.filter((factory) => factory.id !== selectedVendorId);
  //       setVendors(newData);
  //       NotificationMeassage("success", "تم مسح البائع");
  //     })
  //     .catch(() => {
  //       NotificationMeassage("error", "حدث خطأ");
  //     });
  // };

  const handleChange = (id, value) => {
    axios
      .put(`https://homix.onrender.com/vendors/${id}/activeStatus`)
      .then(() => {
        const newData = vendors.map((vendor) => {
          if (vendor.id === id) {
            return { ...vendor, active: !value };
          }
          return vendor;
        });
        setVendors(newData);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };
  useEffect(() => {
    getVendors();
  }, []);

  const colDefs = [
    {
      field: "name",
      headerName: "اسم البائع",
      sortable: true,
      minWidth: 140,
    },
    { field: "user.email", headerName: "البريد الالكتروني", minWidth: 190, sortable: false },
    {
      field: "status",
      headerName: "الحالة",
      sortable: false,
      minWidth: 90,
      maxWidth: 90,
      valueGetter: ({ data }) => getStatusValue(data.status),
      cellRenderer: ({ data }) => (
        <Switch checked={data.active} onChange={() => handleChange(data.id, data.active)} />
      ),
    },
    //  {
    //    headerName: "تعديل",
    //    minWidth: 80,
    //    maxWidth: 80,
    //    sortable: false,
    //    cellRenderer: ({ data: { id } }) => (
    //      <IconButton onClick={() => navigate(`/factories/edit/${id}`)} sx={{ fontSize: "1.2rem" }}>
    //        <EditIcon />
    //      </IconButton>
    //    ),
    //  },
    // {
    //   headerName: "حذف",
    //   minWidth: 80,
    //   maxWidth: 80,
    //   sortable: false,
    //   cellRenderer: ({ data: { id } }) => (
    //     <IconButton
    //       onClick={() => {
    //         // setIsDeleteModalOpenned(true);
    //         setSelectedVendorId(id);
    //       }}
    //       sx={{ fontSize: "1.2rem", color: "red" }}
    //     >
    //       <DeleteIcon />
    //     </IconButton>
    //   ),
    // },
  ];
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      {isDeleteModalOpenned && selectedVendorId && (
        <ConfirmDeleteModal
          open={isDeleteModalOpenned}
          onClose={() => setIsDeleteModalOpenned(false)}
          handleConfirmDelete={deleteVendor}
        />
      )}
      {isloading ? (
        <Spinner />
      ) : (
        <AgGrid
          rowData={vendors}
          columnDefs={colDefs}
          defaultColDef={{
            resizable: true,
          }}
          enableQuickFilter
          gridHeight={"500px"}
          //  handleAdd={() => navigate(`/factories/add`)}
        />
      )}
    </DashboardLayout>
  );
}

export default Vendors;
