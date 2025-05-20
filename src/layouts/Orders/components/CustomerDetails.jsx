import { Home, Phone } from "@mui/icons-material";
import { Icon, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import React from "react";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
// eslint-disable-next-line react/prop-types
function CustomerDetails({ customerName, email, address, phoneNumber, shippedFromInventory }) {
  return shippedFromInventory ? (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px",
        }}
      >
        <Icon sx={{ color: "#333", marginRight: "8px" }}>
          <LocalShippingIcon />
        </Icon>

        <MDTypography variant="h6" fontWeight="medium">
          بيانات الشحن
        </MDTypography>
      </div>

      <MDBox mt={0} mb={2} p={"0 24px"}>
        <MDTypography variant="button" fontWeight="regular">
          <MDTypography display="inline" variant="body2" verticalAlign="middle">
            <Icon sx={{ color: "#333" }}>
              <Phone />
            </Icon>
          </MDTypography>
          &nbsp;
          <Typography
            variant="button"
            // color="body2"
            fontWeight="regular"
            component="a"
            href="tel:01055047847"
            sx={{ textDecoration: "none", cursor: "pointer" }}
          >
            01055047847
          </Typography>
        </MDTypography>
      </MDBox>
      <MDBox mt={0} mb={2} p={"0 24px"}>
        <MDTypography variant="button" fontWeight="regular">
          <MDTypography display="inline" variant="body2" verticalAlign="middle">
            <Icon sx={{ color: "#333" }}>
              <Home />
            </Icon>
          </MDTypography>
          &nbsp;
          <MDTypography variant="button" color="text" fontWeight="regular">
            المنصورية - الهرم - الطريق الرئيسي - زاوية أبو مسلم بجوار مسجد اهل التقوي
          </MDTypography>
        </MDTypography>
      </MDBox>
    </>
  ) : (
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
      <div>
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
    </>
  );
}

export default CustomerDetails;
