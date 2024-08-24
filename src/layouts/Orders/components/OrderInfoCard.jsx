/* eslint-disable react/prop-types */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import React from "react";

function OrderInfoCard({ orderDetails }) {
  return (
    <>
      <MDBox pt={2} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          تفاصيل الطلب
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              سعر التكلفة :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {Number(orderDetails.totalCost).toFixed(0) || ""}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              سعر البيع :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {Number(orderDetails.subTotalPrice).toFixed(0) || ""}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              الخصم :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.discount || 0}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              تكلفة الشحن :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.shippingFees || 0}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              السعر النهائي :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {Number(orderDetails.totalPrice).toFixed(1) || 0}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={2}></MDBox>
    </>
  );
}

export default OrderInfoCard;
