import React from "react";
import Typography from "@mui/material/Typography";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <DashboardNavbar />

      <Typography variant="h3" gutterBottom>
        الصفحة غير موجودة
      </Typography>
      <Typography variant="body1">الصفحة التي تبحث عنها غير موجودة.</Typography>
    </div>
  );
};

export default NotFound;
