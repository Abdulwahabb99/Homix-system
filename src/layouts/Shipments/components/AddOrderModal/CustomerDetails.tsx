import React from "react";
import { Box, Grid, TextField, Typography } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PropTypes from "prop-types";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: FONT,
    fontSize: "13px",
    bgcolor: HX.surface,
    "& fieldset": { borderColor: HX.border },
    "&:hover fieldset": { borderColor: HX.accent },
    "&.Mui-focused fieldset": { borderColor: HX.accent, borderWidth: "1px" },
  },
  "& .MuiInputBase-input": { color: HX.tx, fontFamily: FONT },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "13px", color: HX.tx2 },
  "& .MuiInputLabel-root.Mui-focused": { color: HX.accent },
};

function CustomerDetails({ handleChange, state }) {
  const fields = [
    { name: "firstName", label: "الاسم الأول", required: true },
    { name: "lastName", label: "اسم العائلة", required: true },
    { name: "phone", label: "رقم العميل" },
    { name: "email", label: "البريد الإلكتروني" },
    { name: "country", label: "البلد" },
    { name: "province", label: "المحافظة" },
    { name: "city", label: "المدينة" },
    { name: "address", label: "عنوان العميل", multiline: true },
  ];

  return (
    <Box
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        p: "18px 20px",
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px", mb: "18px" }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: HX.greenLight,
            color: HX.green,
            flexShrink: 0,
          }}
        >
          <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: HX.tx }}>
          بيانات العميل
        </Typography>
      </Box>

      <Grid container spacing={1.6}>
        {fields.map((f) => (
          <Grid item xs={12} sm={f.name === "address" ? 12 : 6} key={f.name}>
            <TextField
              name={f.name}
              label={f.required ? `${f.label} *` : f.label}
              variant="outlined"
              size="small"
              fullWidth
              value={state[f.name]}
              onChange={handleChange}
              multiline={f.multiline}
              minRows={f.multiline ? 2 : undefined}
              sx={fieldSx}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
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
