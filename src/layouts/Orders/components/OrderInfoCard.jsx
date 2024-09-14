/* eslint-disable react/prop-types */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import React from "react";

function OrderInfoCard({ orderDetails }) {
  function formatDateStringToArabic(dateString) {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    const formatter = new Intl.DateTimeFormat("ar-EG", options);
    return formatter.format(date);
  }

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
        {orderDetails.discount && (
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
        )}{" "}
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              جدية الشراء :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.downPayment || 0}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              المبلغ المطلوب تحصيله :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.toBeCollected || 0}
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
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              تاريخ امر التصنيع :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {formatDateStringToArabic(orderDetails.PoDate) || "لا يوجد"}
            </MDTypography>
          </MDTypography>
        </MDBox>
      </MDBox>
    </>
  );
}

export default OrderInfoCard;
