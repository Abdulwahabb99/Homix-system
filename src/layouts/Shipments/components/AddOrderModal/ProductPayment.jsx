import React from "react";
import styles from "./AddOrderModal.module.css";
import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { orderStatusValues } from "layouts/Orders/utils/constants";
import { paymentStatusValues } from "layouts/Orders/utils/constants";
import { getUserType } from "shared/utils/constants";

function ProductPayment({ customer, openAddModal, vendorName }) {
  return (
    <div className={styles.productsCard}>
      <div className={styles.productsCardHeader}>
        <h6>معلومات الطلب</h6>
        <Button onClick={openAddModal} color="primary">
          {customer ? "تعديل" : "إضافة"}
        </Button>
      </div>
      {customer && (
        <div className={styles.paymentDetails}>
          <div className={styles.paymentDetail}>
            <label>حاله الطلب:</label>
            <span className={styles.values}>{orderStatusValues[customer?.orderStatus]} </span>
          </div>
          <div className={styles.paymentDetail}>
            <label>البائع:</label>
            <span className={styles.values}>{vendorName} </span>
          </div>
          <div className={styles.paymentDetail}>
            <label> المسؤول:</label>
            <span className={styles.values}>{getUserType(customer?.administrator)} </span>
          </div>
          <div className={styles.paymentDetail}>
            <label>طريقة الدفع:</label>
            <span className={styles.values}>{paymentStatusValues[customer?.paymentStatus]} </span>
          </div>
          <div className={styles.paymentDetail}>
            <label>جدية الشراء:</label>
            <span className={styles.values}>{customer?.downPayment}</span>
          </div>
          <div className={styles.paymentDetail}>
            <label>تكلفة الشحن:</label>
            <span className={styles.values}>{customer?.shippingCost}</span>
          </div>
          <div className={styles.paymentDetail}>
            <label>المبلغ المطلوب تحصيله:</label>
            <span className={styles.values}>{customer?.toBeCollected}</span>
          </div>
          <div className={styles.paymentDetail}>
            <label>العمولة:</label>
            <span className={styles.values}>{customer?.commission}</span>
          </div>
          <div className={styles.paymentDetail}>
            <label>تاريخ الدفع:</label>
            <span className={styles.values}>
              {customer?.manufacturingDate === "NaN-NaN-NaN" ? "" : customer?.manufacturingDate}
            </span>
          </div>
        </div>
      )}{" "}
    </div>
  );
}

ProductPayment.propTypes = {
  openAddModal: PropTypes.func.isRequired,
  customer: PropTypes.object.isRequired,
  vendorName: PropTypes.string.isRequired,
};

export default ProductPayment;
