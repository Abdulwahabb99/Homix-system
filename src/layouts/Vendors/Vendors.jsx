import { IconButton, Switch } from "@mui/material";
import AgGrid from "components/AgGrid/AgGrid";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import Spinner from "components/Spinner/Spinner";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import EditVendorModal from "./components/EditVendorModal";
import axiosRequest from "shared/functions/axiosRequest";

const statusOptions = { 1: "اونلاين", 2: "اوفلاين" };

function Vendors() {
  const [isloading, setIsLoading] = useState(false);
  const [isEditModalOpenned, setIsEditModalOpenned] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const getStatusValue = (value) => {
    const statusValue = statusOptions[value];
    return statusValue;
  };

  const getVendors = () => {
    setIsLoading(true);
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/vendors`)
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
  //   axiosRequest
  //     .delete(`${process.env.REACT_APP_API_URL}/vendors/${selectedVendorId}`)
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
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/vendors/${id}/activeStatus`)
      .then(() => {
        const newData = vendors.map((vendor) => {
          if (vendor.id === id) {
            return { ...vendor, active: !value };
          }
          return vendor;
        });
        setVendors(newData);
        NotificationMeassage("success", "تم تغير الحالة");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const handleEditVendor = (daysToDeliver, password) => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/vendors/${selectedVendor.id}`, {
        daysToDeliver,
        password,
      })
      .then(() => {
        const updatedVendors = vendors.map((vendor) =>
          selectedVendor.id === vendor.id ? { ...vendor, daysToDeliver: daysToDeliver } : vendor
        );
        setVendors(updatedVendors);
        setIsEditModalOpenned(false);
        NotificationMeassage("success", "تم تعديل المورد بنجاح");
      })
      .catch((error) => {
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
    {
      headerName: "تعديل",
      minWidth: 80,
      maxWidth: 80,
      sortable: false,
      cellRenderer: ({ data }) => (
        <IconButton
          onClick={() => {
            setIsEditModalOpenned(true);
            setSelectedVendor(data);
          }}
          sx={{ fontSize: "1.2rem" }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />

      {isEditModalOpenned && (
        <EditVendorModal
          open={isEditModalOpenned}
          onClose={() => setIsEditModalOpenned(false)}
          data={selectedVendor}
          onEdit={handleEditVendor}
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
        />
      )}
    </DashboardLayout>
  );
}

export default Vendors;
