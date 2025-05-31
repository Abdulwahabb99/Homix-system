import React from "react";
import Typography from "@mui/material/Typography";
import ArrowNextIcon from "@mui/icons-material/ArrowForward";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
          <IconButton color="#344767" onClick={() => navigate("/")}>
            <ArrowNextIcon />
          </IconButton>
        </div>

        <Typography variant="h3">الصفحة غير موجودة</Typography>
        <Typography variant="body1">الصفحة التي تبحث عنها غير موجودة.</Typography>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
