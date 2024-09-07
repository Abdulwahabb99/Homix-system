/* eslint-disable react/prop-types */
import React from "react";
import { Card, Grid } from "@mui/material";
import CustomerDetails from "./components/CustomerDetails";
import OrderInfoCard from "./components/OrderInfoCard";

const statusValues = {
  1: "معلق",
  2: "قيد التنفيذ",
  3: "رفض",
  4: "تم التنفيذ",
  5: "خارج للتوصيل",
  6: "تم التسليم",
  7: "مسترجع",
  8: "ملغي",
};

const PdfData = React.forwardRef(({ orderDetails }, ref) => {
  const getProductStatus = (status) => {
    return statusValues[status];
  };

  return (
    <div ref={ref} style={{ direction: "rtl" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: "100%" }}>
            {orderDetails?.customer && (
              <CustomerDetails
                customerName={`${orderDetails?.customer.firstName} ${orderDetails.customer.lastName}`}
                email={orderDetails?.customer.email}
                address={
                  orderDetails?.customer.address
                    ? orderDetails.customer.address
                    : orderDetails.customer.address2
                }
                phoneNumber={
                  orderDetails?.customer.phoneNumber ? orderDetails.customer.phoneNumber : ""
                }
              />
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: "100%" }}>
            {Object.keys(orderDetails).length && <OrderInfoCard orderDetails={orderDetails} />}
          </Card>
        </Grid>
      </Grid>
    </div>
  );
});

export default PdfData;
