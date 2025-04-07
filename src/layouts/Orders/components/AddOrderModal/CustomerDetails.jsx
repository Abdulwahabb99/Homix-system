import React from "react";
import { Grid, TextField } from "@mui/material";
import MDTypography from "components/MDTypography";
import styles from "./AddOrderModal.module.css";
import PropTypes from "prop-types";

function CustomerDetails({ handleChange, state }) {
  return (
    <div className={styles.productsCard}>
      <MDTypography variant="h5" fontWeight="medium" mb={2}>
        بيانات العميل
      </MDTypography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="name"
            label="اسم العميل"
            variant="outlined"
            fullWidth
            value={state.name}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="phone"
            label="رقم العميل"
            variant="outlined"
            fullWidth
            value={state.phone}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="address"
            label="عنوان العميل"
            variant="outlined"
            fullWidth
            value={state.address}
            onChange={handleChange}
            multiline
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="email"
            label="البريد الإلكتروني"
            variant="outlined"
            fullWidth
            value={state.email}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </div>
  );
}

CustomerDetails.propTypes = {
  state: PropTypes.shape({
    name: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    email: PropTypes.string,
  }),
  handleChange: PropTypes.func.isRequired,
};

export default CustomerDetails;
