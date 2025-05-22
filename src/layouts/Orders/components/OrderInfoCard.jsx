/* eslint-disable react/prop-types */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import React from "react";

function OrderInfoCard({ orderDetails, orderTotalCost, orderTotalPrice, isShimpentDetails }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.userType === "2";

  function formatDateStringToArabic(dateString) {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "2-digit" };
    const formatter = new Intl.DateTimeFormat("ar-EG", options);
    return formatter.format(date);
  }

  return (
    <>
      <MDBox pt={2} px={3}>
        <MDTypography variant="h5" fontWeight="medium">
          {isShimpentDetails ? "تفاصيل الشحنة" : "تفاصيل الطلب"}
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
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
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              سعر التكلفة :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {Number(orderDetails.orderLines[0].cost).toFixed(0) || ""}
            </MDTypography>
          </MDTypography>
        </MDBox>
        {!isVendor && (
          <>
            <MDBox mt={0} mb={2}>
              <MDTypography variant="button" fontWeight="regular">
                <MDTypography display="inline" variant="h6" verticalAlign="middle">
                  تكلفة الشحن :{" "}
                </MDTypography>
                &nbsp;
                <MDTypography variant="button" color="text" fontWeight="medium">
                  {orderDetails.shippingFees || 0}
                </MDTypography>
              </MDTypography>
            </MDBox>
          </>
        )}{" "}
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              الخصم :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {Number(orderDetails.totalDiscounts).toFixed(0) || ""}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              اجمالي البيع :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {Number(orderDetails.totalPrice).toFixed(0) || ""}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
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
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              المبلغ المطلوب تحصيله :{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.toBeCollected || 0}
            </MDTypography>
          </MDTypography>
        </MDBox>
        {/* <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              إﺟﻣﺎﻟﻲ اﻟﻣﺳﺗﺣق ﻟﻠﺑﺎﺋﻊ:
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.totalVendorDue || 0}
            </MDTypography>
          </MDTypography>
        </MDBox>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" fontWeight="regular">
            <MDTypography display="inline" variant="h6" verticalAlign="middle">
              إﺟﻣﺎﻟﻲ اﻟﻣﺳﺗﺣق للشركة:
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {orderDetails.totalCompanyDue || 0}
            </MDTypography>
          </MDTypography>
        </MDBox> */}
      </MDBox>
    </>
  );
}

export default OrderInfoCard;
