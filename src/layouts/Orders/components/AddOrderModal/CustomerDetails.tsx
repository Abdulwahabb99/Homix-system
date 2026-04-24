import React from "react";
import { Box, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import { addOrderPageCardSx, addOrderTextFieldSx } from "./addOrderFormStyles";

function CustomerDetails({ handleChange, state }) {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        ...addOrderPageCardSx,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.info.main, 0.06),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 0.5 }}>
          <Box
            sx={{
              width: 3,
              minHeight: 22,
              borderRadius: 0.5,
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          />
          <MDTypography
            component="h2"
            variant="subtitle1"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: "1.03rem" }}
          >
            بيانات العميل
          </MDTypography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontSize: "0.77rem", pr: 0.5 }}
        >
          بيانات التوصيل والتواصل لإنشاء الطلب
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Grid container spacing={1.75}>
          <Grid item xs={12}>
            <TextField
              name="firstName"
              label="الاسم الأول"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.firstName}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="lastName"
              label="اسم العائلة"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.lastName}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="phone"
              label="رقم الهاتف"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.phone}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="address"
              label="العنوان"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.address}
              onChange={handleChange}
              multiline
              minRows={2}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="country"
              label="البلد"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.country}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="province"
              label="المحافظة"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.province}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="city"
              label="المدينة"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.city}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              label="البريد الإلكتروني"
              variant="outlined"
              size="small"
              color="primary"
              fullWidth
              value={state.email}
              onChange={handleChange}
              sx={addOrderTextFieldSx}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

CustomerDetails.propTypes = {
  state: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    email: PropTypes.string,
    country: PropTypes.string,
    province: PropTypes.string,
    city: PropTypes.string,
  }),
  handleChange: PropTypes.func.isRequired,
};

export default CustomerDetails;
