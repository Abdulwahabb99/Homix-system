/* eslint-disable react/prop-types */
import { Card, CardMedia, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import React from "react";
import styles from "./Orders.module.css";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
function OrderProducts({ products }) {
  const navigate = useNavigate();
  const navigateToProduct = (id) => {
    navigate(`/products/${id}`);
  };
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={2}>
        <MDBox mt={0} mb={2}>
          {products?.map((product) => (
            <div className={styles.imageContainer} key={product.id}>
              <div className={styles.productimage}>
                <CardMedia
                  component="img"
                  image={product.product.image}
                  sx={{
                    objectFit: "cover",
                    maxHeight: "50px",
                  }}
                />
                <span
                  onClick={() => navigateToProduct(product.product.id)}
                  className={styles.productname}
                  style={{ fontSize: ".9rem" }}
                >
                  {product.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>{Number(product.price).toFixed(0)}</span>
                <span style={{ margin: "0 3px", fontSize: ".9rem" }}>({product.quantity})</span>
              </div>
            </div>
          ))}
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default OrderProducts;
