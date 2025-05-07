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
            name="firstName"
            label="اسم الاول"
            variant="outlined"
            fullWidth
            value={state.firstName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="lastName"
            label="اسم العائلة"
            variant="outlined"
            fullWidth
            value={state.lastName}
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
            name="country"
            label="البلد"
            variant="outlined"
            fullWidth
            value={state.country}
            onChange={handleChange}
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="province"
            label="المحافظة"
            variant="outlined"
            fullWidth
            value={state.province}
            onChange={handleChange}
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="city"
            label="المدينة"
            variant="outlined"
            fullWidth
            value={state.city}
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
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    email: PropTypes.string,
    country: PropTypes.string,
    province: PropTypes.string,
    city: PropTypes.string,
  }),
  handleChange: PropTypes.func.isRequired,
};

export default CustomerDetails;
