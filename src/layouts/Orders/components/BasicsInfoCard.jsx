/* eslint-disable react/prop-types */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import React from "react";
import { getDeliveryStatusValue } from "shared/utils/constants";
import { getStatusValue } from "shared/utils/constants";

function BasicsInfoCard({ orderDetails }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.userType === "2";

  return (
    <>
      <MDBox pt={2} px={3}>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular"></MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              حالة الطلب :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {getStatusValue(orderDetails.status)}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              حالة التصنيع :
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {getDeliveryStatusValue(orderDetails.deliveryStatus)}
            </MDTypography>
          </MDTypography>
        </MDBox>

        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              المسؤول :
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.administrator ? orderDetails.administrator : "لا يوجد"}
            </MDTypography>
          </MDTypography>
        </MDBox>

        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              مكان التسليم :
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.shippedFromInventory ? "مخازن هومكس" : "عنوان العميل"}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </>
  );
}

export default BasicsInfoCard;
