import { Card, CardMedia, Grid, IconButton } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import { useNavigate, useParams } from "react-router-dom";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import Spinner from "components/Spinner/Spinner";

function FactoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isloading, setIsLoading] = useState(false);
  const [factoryData, setFactoryData] = useState(null);
  const url = "https://homix.onrender.com";
  const user = JSON.parse(localStorage.getItem("user"));

  const isImage = (url) => {
    return /\.(JPG|JPG|JPEG|PNG|jpg|jpeg|png|gif)$/.test(url);
  };
  const deleteFile = (id) => {
    axios
      .delete(`${url}/factories/${factoryData.id}/attachments/${id}`)
      .then(() => {
        const newData = factoryData.attachments.filter((file) => file.id !== id);
        setFactoryData({ ...factoryData, attachments: newData });
        NotificationMeassage("success", "تم مسح الملف");
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
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

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${url}/factories/${id}`)
      .then(({ data }) => {
        if (data.force_logout) {
          localStorage.removeItem("user");
          navigate("/authentication/sign-in");
        }
        setFactoryData(data);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ToastContainer />
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <IconButton color="#344767" onClick={() => navigate("/factories")}>
          <ArrowNextIcon />
        </IconButton>
      </div>
      {factoryData && !isloading ? (
        <MDBox py={3}>
          <MDBox>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Card sx={{ height: "100%" }}>
                  <MDBox pt={2} px={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                      بيانات المصنع
                    </MDTypography>
                    <MDBox mt={0} mb={2}>
                      <MDTypography variant="button" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                          الاسم :
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                          {factoryData.name}
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={0} mb={2}>
                      <MDTypography variant="button" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                          تخصص المصنع :
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                          {factoryData.factoryCategory}
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={0} mb={2}>
                      <MDTypography variant="button" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                          الموقع الالكتروني :
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                          {factoryData.website}
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={0} mb={2}>
                      <MDTypography variant="button" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                          شحن للقاهرة والجيزة :
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                          {factoryData.cairoGizaShipping || ""}
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={0} mb={2}>
                      <MDTypography variant="button" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                          شحن لباقي المحافظات :
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                          {factoryData.otherCitiesShipping}
                        </MDTypography>
                      </MDTypography>
                    </MDBox>
                    <MDBox mt={0} mb={2}>
                      <MDTypography variant="button" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                          حالة المصنع :
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                          {factoryData.status === 1 ? "اونلاين" : "اوفلاين"}
                        </MDTypography>
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="medium" mt={2}>
                        بيانات المسؤول
                      </MDTypography>
                      <MDBox mt={0} mb={2}>
                        <MDTypography variant="button" fontWeight="regular">
                          <MDTypography display="inline" variant="body2" verticalAlign="middle">
                            اسم المسؤوول :
                          </MDTypography>
                          &nbsp;
                          <MDTypography variant="button" color="text" fontWeight="medium">
                            {factoryData.contactPersonName}
                          </MDTypography>
                        </MDTypography>
                      </MDBox>
                      <MDBox mt={0} mb={2}>
                        <MDTypography variant="button" fontWeight="regular">
                          <MDTypography display="inline" variant="body2" verticalAlign="middle">
                            رقم المسؤوول :
                          </MDTypography>
                          &nbsp;
                          <MDTypography variant="button" color="text" fontWeight="medium">
                            {factoryData.contactPersonPhoneNumber || ""}
                          </MDTypography>
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
              {factoryData.attachments.map((file) => (
                <Grid item xs={12} md={4} lg={4} key={file.id}>
                  <Card
                    sx={{
                      maxHeight: 387,
                      minHeight: 370,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isImage(file.url) ? (
                      <a
                        href={`${url}/${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ width: "100%", display: "flex", justifyContent: "center" }}
                      >
                        <img
                          width="90%"
                          src={`${url}/${file.url}`}
                          alt={file?.name}
                          style={{ objectFit: "cover", maxHeight: "320px", borderRadius: "10px" }}
                        />
                      </a>
                    ) : (
                      <a
                        href={`${url}/${file.url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "2rem" }}
                      >
                        <InsertDriveFileIcon />
                      </a>
                    )}
                    <div style={{ cursor: "pointer" }} onClick={() => deleteFile(file.id)}>
                      <DeleteIcon />
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        </MDBox>
      ) : (
        <Spinner />
      )}
    </DashboardLayout>
  );
}

export default FactoryDetails;
