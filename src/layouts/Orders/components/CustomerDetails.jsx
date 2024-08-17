import { Home, Phone } from "@mui/icons-material";
import { Card, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import React from "react";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";

// eslint-disable-next-line react/prop-types
function CustomerDetails({ customerName, email, address, phoneNumber }) {
  return (
    <>
      <MDBox pt={2} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          العميل
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: "#333" }}>
                <PersonIcon />
              </Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {customerName}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
      <div style={{ borderBottom: "solid 1px #ffc" }}>
        <MDBox pt={1} px={3}>
          <MDTypography variant="h6" fontWeight="medium">
            معلومات العميل
          </MDTypography>
          <MDBox mt={0} mb={2}>
            <MDTypography variant="button" fontWeight="regular">
              <MDTypography display="inline" variant="body2" verticalAlign="middle">
                <Icon sx={{ color: "#333" }}>
                  <EmailIcon />
                </Icon>
              </MDTypography>
              &nbsp;
              <MDTypography variant="button" color="text" fontWeight="regular">
                {email}
              </MDTypography>
            </MDTypography>
          </MDBox>
          <MDBox mt={0} mb={2}>
            <MDTypography variant="button" fontWeight="regular">
              <MDTypography display="inline" variant="body2" verticalAlign="middle">
                <Icon sx={{ color: "#333" }}>
                  <Home />
                </Icon>
              </MDTypography>
              &nbsp;
              <MDTypography variant="button" color="text" fontWeight="regular">
                {address}
              </MDTypography>
            </MDTypography>
          </MDBox>
          <MDBox mt={0} mb={2}>
            <MDTypography variant="button" fontWeight="regular">
              <MDTypography display="inline" variant="body2" verticalAlign="middle">
                <Icon sx={{ color: "#333" }}>
                  <Phone />
                </Icon>
              </MDTypography>
              &nbsp;
              <MDTypography variant="button" color="text" fontWeight="regular">
                {phoneNumber ? phoneNumber : ""}
              </MDTypography>
            </MDTypography>
          </MDBox>
        </MDBox>
      </div>
      <MDBox p={2}></MDBox>
    </>
  );
}

export default CustomerDetails;
