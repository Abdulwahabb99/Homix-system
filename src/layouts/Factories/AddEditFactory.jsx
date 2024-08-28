/* eslint-disable react/prop-types */
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import Spinner from "components/Spinner/Spinner";
const status = [
  { label: "اونلاين", value: "1" },
  { label: "اوفلاين", value: "2" },
];
function AddEditFactory({ type }) {
  const navigate = useNavigate();
  const [isloading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonPhoneNumber, setContactPersonPhoneNumber] = useState("");
  const [factoryCategory, setFactoryCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cairoGizaShipping, setCairoGizaShipping] = useState("");
  const [otherCitiesShipping, setOtherCitiesShipping] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { id } = useParams();
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
  useEffect(() => {
    if (type === "edit") {
      setIsLoading(true);
      axios
        .get(`https://homix.onrender.com/factories/${id}`)
        .then(({ data }) => {
          setName(data.name);
          setAddress(data.address);
          setContactPersonName(data.contactPersonName);
          setContactPersonPhoneNumber(data.contactPersonPhoneNumber);
          setWebsite(data.website);
          setFactoryCategory(data.factoryCategory);
          setSelectedStatus(data.status);
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const addFactory = () => {
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }

    axios
      .post(`https://homix.onrender.com/factories`, {
        name: name,
        status: selectedStatus,
        address: address,
        factoryCategory: factoryCategory,
        contactPersonPhoneNumber: contactPersonPhoneNumber,
        contactPersonName: contactPersonName,
        website: website,
        cairoGizaShipping: cairoGizaShipping,
        otherCitiesShipping: otherCitiesShipping,
      })
      .then(({ data }) => {
        console.log(data);
        NotificationMeassage("success", "تم اضافة مصنع");
        setTimeout(() => {
          navigate("/factories");
        }, 1000);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        //   setIsLoading(false);
      });
  };
  const UpdateFactory = () => {
    console.log("hyy");

    axios
      .put(`https://homix.onrender.com/factories/${id}`, {
        name: name,
        status: selectedStatus,
        address: address,
        factoryCategory: factoryCategory,
        contactPersonPhoneNumber: contactPersonPhoneNumber,
        contactPersonName: contactPersonName,
        website: website,
        cairoGizaShipping: cairoGizaShipping,
        otherCitiesShipping: otherCitiesShipping,
      })
      .then(({ data }) => {
        NotificationMeassage("success", "تم التعديل بنجاح");
        setTimeout(() => {
          navigate("/factories");
        }, 1000);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        //   setIsLoading(false);
      });
  };
  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    if (event.target.files.length === 0) {
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
      formData.append("files", event.target.files[i]);
    }
    axios
      .post(`https://homix.onrender.com/factories/${id}/upload`, formData)
      .then(() => {
        NotificationMeassage("success", "تم اضافة الصورة بنجاح");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <IconButton color="#344767" onClick={() => navigate("/factories")}>
          <ArrowNextIcon />
        </IconButton>
      </div>
      {isloading ? (
        <Spinner />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="اسم المصنع"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="عنوان المصنع"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="تخصص المصنع"
                value={factoryCategory}
                onChange={(e) => setFactoryCategory(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="اسم المسؤل"
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="رقم المسؤل"
                value={contactPersonPhoneNumber}
                onChange={(e) => setContactPersonPhoneNumber(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="الويب سايت"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="شحن قاهرة وجيزة"
                value={cairoGizaShipping}
                onChange={(e) => setCairoGizaShipping(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="شحن باقي المحافظات"
                value={otherCitiesShipping}
                onChange={(e) => setOtherCitiesShipping(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <FormControl style={{ width: "100%" }}>
                <InputLabel id="orderStatus">حالة المصنع</InputLabel>
                <Select
                  labelId="factoryStatus"
                  id="factoryStatus-select"
                  value={selectedStatus}
                  label="حالة المصنع"
                  fullWidth
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ height: 43 }}
                >
                  {status.map((option) => {
                    return (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            {type === "edit" && (
              <Grid item xs={12} md={6} lg={6}>
                <TextField
                  variant="outlined"
                  type="file"
                  inputProps={{
                    accept:
                      "image/png, image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    multiple: true,
                  }}
                  fullWidth
                  onChange={handleFileChange}
                />
              </Grid>
            )}
          </Grid>
          <div style={{ margin: "15px 0" }}>
            <Button
              onClick={() => navigate("/factories")}
              variant="contained"
              style={{ background: "#000", color: "#fff", margin: "0 5px" }}
            >
              إلغاء
            </Button>
            <Button
              onClick={type === "edit" ? UpdateFactory : addFactory}
              variant="contained"
              style={{ color: "#fff" }}
            >
              {type === "edit" ? "حفظ" : "اضافة"}
            </Button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default AddEditFactory;
