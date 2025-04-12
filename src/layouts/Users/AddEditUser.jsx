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
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import Spinner from "components/Spinner/Spinner";
import { USER_TYPES_VALUES } from "shared/utils/constants";
import axiosRequest from "shared/functions/axiosRequest";

function AddEditUser({ type }) {
  const navigate = useNavigate();
  const [isloading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (type === "edit") {
      setIsLoading(true);
      axiosRequest
        .get(`${process.env.REACT_APP_API_URL}/users/${id}`)
        .then(({ data }) => {
          if (data === null) {
            navigate("/users");
          }
          if (data?.force_logout) {
            localStorage.removeItem("user");
            navigate("/authentication/sign-in");
          }
          setFirstName(data.data.firstName);
          setLastName(data.data.lastName);
          setEmail(data.data.email);
          setPassword(data.data.password);
          setUserType(data.data.userType);
        })
        .catch((res) => {
          NotificationMeassage("error", "حدث خطأ");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const addUser = () => {
    axiosRequest
      .post(`${process.env.REACT_APP_API_URL}/users`, {
        firstName,
        lastName,
        email,
        password,
        userType,
      })
      .then(() => {
        NotificationMeassage("success", "تم اضافة مستخدم بنجاح");
        setTimeout(() => {
          navigate("/users");
        }, 1000);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };
  const updateUser = () => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/users/${id}`, {
        firstName,
        lastName,
        email,
        password,
        userType,
      })
      .then(() => {
        NotificationMeassage("success", "تم تعديل المستخدم بنجاح");
        setTimeout(() => {
          navigate("/users");
        }, 1000);
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
        <IconButton color="#344767" onClick={() => navigate("/users")}>
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
                label="الاسم الاول"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="اسم العائلة"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="البريد الالكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                label="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ margin: "5px 0" }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <FormControl style={{ width: "100%" }}>
                <InputLabel id="userType">نوع المستخدم</InputLabel>
                <Select
                  labelId="userType"
                  id="userType-select"
                  value={userType}
                  label="نوع المستخدم"
                  fullWidth
                  onChange={(e) => setUserType(e.target.value)}
                  sx={{ height: 43 }}
                >
                  {USER_TYPES_VALUES.map((option) => {
                    return (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <div style={{ margin: "15px 0" }}>
            <Button
              onClick={() => navigate("/users")}
              variant="contained"
              style={{ background: "#000", color: "#fff", margin: "0 5px" }}
            >
              إلغاء
            </Button>
            <Button
              onClick={type === "edit" ? updateUser : addUser}
              variant="contained"
              style={{ color: "#fff" }}
              //   disabled={isFileUploadingloading || !name}
            >
              {type === "edit" ? "حفظ" : "اضافة"}
            </Button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default AddEditUser;
