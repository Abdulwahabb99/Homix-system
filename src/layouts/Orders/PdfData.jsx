/* eslint-disable react/prop-types */
import React from "react";
import { Grid } from "@mui/material";
import logo from "../../assets/images/1 (1).png";
import styles from "./Orders.module.css";

const PdfData = React.forwardRef(({ orderDetails }, ref) => {
  function formatDateStringToArabic(dateString) {
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const date = new Date(year, month, day);
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formatter = new Intl.DateTimeFormat("en-EG", options);

    return formatter.format(date);
  }
  const orderDate = formatDateStringToArabic(orderDetails.createdAt);
  return (
    <div ref={ref} style={{ direction: "ltr" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Grid container spacing={2} sx={{ borderBottom: "solid #000 1px" }}>
            <Grid item xs={12} md={4} lg={4}>
              <div className={styles.pdfLogoContainer}>
                <img src={logo} alt="homix" style={{ width: "100%" }} />
              </div>
            </Grid>
            <Grid item xs={12} md={8} lg={8}>
              <div className={styles.invoice}>
                <p style={{ fontSize: "2.2rem", fontWeight: "700" }}>Invoice</p>
                <div style={{ fontSize: "1.3rem", fontWeight: "600" }}>
                  <span style={{ color: "#003045" }}>issue Date : </span>
                  <span>{orderDate}</span>
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "600" }}>
                  <span style={{ color: "#003045" }}>Invoice# : </span>
                  <span>{orderDetails.name}</span>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12}>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto" }}>
            <Grid item xs={12} md={4} lg={4}>
              <div className={styles.billingDetails}>
                <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "#003045" }}>
                  Billing Details
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                  {orderDetails?.customer?.firstName || ""} {orderDetails?.customer?.lastName || ""}
                </p>
                <p style={{ fontSize: "1.1rem", fontWeight: "400" }}>
                  {orderDetails?.customer?.address}
                </p>
              </div>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <div className={styles.billingDetails}>
                <p style={{ fontSize: "1.5rem", fontWeight: "700", color: "#003045" }}>
                  Shipping Details
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                  {orderDetails?.customer?.firstName || ""} {orderDetails?.customer?.lastName || ""}
                </p>
                <p style={{ fontSize: "1.1rem", fontWeight: "400" }}>
                  {orderDetails?.customer?.address}
                </p>
                <p style={{ fontSize: "1.1rem", fontWeight: "400" }}>
                  {orderDetails?.customer?.phoneNumber}
                </p>
              </div>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <div className={styles.billingPrice}>
                <h2>{orderDetails.totalPrice} LE</h2>
                <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#003045" }}>
                  TOTAL
                </span>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12}>
          <Grid
            container
            spacing={2}
            sx={{ width: "90%", margin: "0 auto", background: "#024b6b", alignItems: "center" }}
          >
            <Grid item xs={12} md={4} lg={4} className={styles.DescriptionContainer}>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>Description</p>
            </Grid>
            <Grid item xs={12} md={1} lg={1} className={styles.DescriptionContainer}>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>Qty</p>
            </Grid>
            <Grid item xs={12} md={2} lg={2} className={styles.DescriptionContainer}>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>Unit Price</p>
            </Grid>
            <Grid item xs={12} md={2} lg={2} className={styles.DescriptionContainer}>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>Subtotal</p>
            </Grid>
            <Grid item xs={12} md={2} lg={2} className={styles.DescriptionContainer}>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#fff" }}>Total</p>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} sx={{ borderBottom: "solid 1px #000" }}>
          {orderDetails.orderLines.map((item) => {
            return (
              <>
                <Grid
                  container
                  spacing={2}
                  sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}
                  key={item.id}
                >
                  <Grid item xs={12} md={4} lg={4} className={styles.DescriptionContainer}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4} lg={4}>
                        <img src={item.product.image} alt="product" width="100%" />
                      </Grid>
                      <Grid item xs={12} md={8} lg={8}>
                        <p style={{ fontSize: "15px", fontWeight: "600" }}>{item.title}</p>
                        <div>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>sku : </span>
                          <span style={{ fontSize: "11px", fontWeight: "400" }}>{item.sku}</span>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={1} lg={1} className={styles.DescriptionContainer}>
                    <p style={{ fontSize: "1rem", fontWeight: "700" }}>{item.quantity}</p>
                  </Grid>
                  <Grid item xs={12} md={2} lg={2} className={styles.DescriptionContainer}>
                    <p style={{ fontSize: "1rem", fontWeight: "700" }}> {item.price} LE</p>
                  </Grid>
                  <Grid item xs={12} md={2} lg={2} className={styles.DescriptionContainer}>
                    <p style={{ fontSize: "1rem", fontWeight: "700" }}> {item.price} LE</p>
                  </Grid>
                  <Grid item xs={12} md={2} lg={2} className={styles.DescriptionContainer}>
                    <p style={{ fontSize: "1rem", fontWeight: "700" }}> {item.price} LE</p>
                  </Grid>
                </Grid>
              </>
            );
          })}
        </Grid>
        <Grid item xs={12} md={12}>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}>
            <Grid item md={5}></Grid>
            <Grid item md={3} sx={{ fontWeight: "600" }}>
              Subtotal
            </Grid>
            <Grid item md={1}>
              :
            </Grid>
            <Grid item md={2}>
              {orderDetails.subTotalPrice} LE
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}>
            <Grid item md={5}></Grid>
            <Grid item md={3} sx={{ fontWeight: "600" }}>
              Shipping
            </Grid>
            <Grid item md={1}>
              :
            </Grid>
            <Grid item md={2}>
              {orderDetails.shippingFees} LE
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}>
            <Grid item md={5}></Grid>
            <Grid item md={3} sx={{ fontWeight: "600" }}>
              Discount
            </Grid>
            <Grid item md={1}>
              :
            </Grid>
            <Grid item md={2}>
              {orderDetails.totalDiscounts} LE
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}>
            <Grid item md={5}></Grid>
            <Grid item md={3} sx={{ fontWeight: "600", color: "#024b6b" }}>
              Total
            </Grid>
            <Grid item md={1}>
              :
            </Grid>
            <Grid item md={2}>
              {orderDetails.totalPrice} LE
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}>
            <Grid item md={5}></Grid>
            <Grid item md={3} sx={{ fontWeight: "600", color: "#024b6b" }}>
              Paid by customer
            </Grid>
            <Grid item md={1}>
              :
            </Grid>
            <Grid item md={2}>
              {orderDetails.downPayment} LE
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ width: "90%", margin: "0 auto", alignItems: "center" }}>
            <Grid item md={5}></Grid>
            <Grid item md={3} sx={{ fontSize: "16px", fontWeight: "600", color: "#024b6b" }}>
              Outstanding (Customer owes)
            </Grid>
            <Grid item md={1}>
              :
            </Grid>
            <Grid item md={2}>
              {Number(orderDetails.totalPrice) - Number(orderDetails.downPayment)} LE
            </Grid>
          </Grid>
        </Grid>
        <div
          style={{
            width: "90%",
            margin: "3rem auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.7rem",
            fontWeight: "700",
            borderTop: "solid 2px #000",
            borderBottom: "solid 2px #000",
          }}
        >
          <p>Thank you for choosing Homix</p>
        </div>
      </Grid>
    </div>
  );
});

export default PdfData;
