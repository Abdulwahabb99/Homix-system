/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  Box, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import Spinner from "components/Spinner/Spinner";
import { USER_TYPES_VALUES } from "shared/utils/constants";
import axiosRequest from "shared/functions/axiosRequest";
import { HX } from "layouts/Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontFamily: FONT, fontSize: "13px", bgcolor: HX.surface,
    "& fieldset": { borderColor: HX.border },
    "&:hover fieldset": { borderColor: HX.accent },
    "&.Mui-focused fieldset": { borderColor: HX.accent, borderWidth: "1px" },
  },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "13px", color: HX.tx2 },
  "& .MuiInputLabel-root.Mui-focused": { color: HX.accent },
  "& .MuiInputBase-input": { fontFamily: FONT, color: HX.tx },
};

function AddEditUser({ type }) {
  const navigate = useNavigate();
  const [isloading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (type === "edit") {
      setIsLoading(true);
      axiosRequest
        .get(`${process.env.REACT_APP_API_URL}/users/${id}`)
        .then(({ data }) => {
          if (data === null) {
            navigate("/users");
          }
          if (data?.force_logout) {
            localStorage.removeItem("user");
            navigate("/authentication/sign-in");
          }
          setFirstName(data.data.firstName);
          setLastName(data.data.lastName);
          setEmail(data.data.email);
          setPassword(data.data.password);
          setUserType(data.data.userType);
        })
        .catch(() => {
          NotificationMeassage("error", "حدث خطأ");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const addUser = () => {
    axiosRequest
      .post(`${process.env.REACT_APP_API_URL}/users`, { firstName, lastName, email, password, userType })
      .then(() => {
        NotificationMeassage("success", "تم اضافة مستخدم بنجاح");
        setTimeout(() => navigate("/users"), 1000);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const updateUser = () => {
    axiosRequest
      .put(`${process.env.REACT_APP_API_URL}/users/${id}`, { firstName, lastName, email, password, userType })
      .then(() => {
        NotificationMeassage("success", "تم تعديل المستخدم بنجاح");
        setTimeout(() => navigate("/users"), 1000);
      })
      .catch(() => {
        NotificationMeassage("error", "حدث خطأ");
      });
  };

  const isEdit = type === "edit";

  const btnBase = {
    px: "22px", height: 40, borderRadius: "10px", border: "none", cursor: "pointer",
    fontFamily: FONT, fontSize: "13px", fontWeight: 700, transition: ".15s",
  } as const;

  return (
    <DashboardLayout>
      <ToastContainer />
      <Box sx={{ fontFamily: FONT, mt: "16px" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "18px" }}>
          <IconButton
            onClick={() => navigate("/users")}
            sx={{
              width: 38, height: 38, borderRadius: "10px", border: `1px solid ${HX.border2}`,
              bgcolor: HX.surface, color: HX.tx2,
              "&:hover": { bgcolor: HX.surface3, color: HX.accent, borderColor: HX.accent },
            }}
          >
            <ArrowForwardIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontFamily: FONT, fontSize: "19px", fontWeight: 800, color: HX.tx }}>
            {isEdit ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          </Typography>
        </Box>

        {isloading ? (
          <Spinner />
        ) : (
          <Box sx={{ bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03)", p: "20px 22px", maxWidth: 760 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px", mb: "18px" }}>
              <Box sx={{ width: 30, height: 30, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: HX.accentLight, color: HX.accent }}>
                <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontFamily: FONT, fontSize: "14px", fontWeight: 700, color: HX.tx }}>بيانات المستخدم</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="اسم العائلة" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} sx={fieldSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth size="small" label="كلمة المرور" value={password}
                  onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} sx={fieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" aria-label="إظهار كلمة المرور">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel id="userType">نوع المستخدم</InputLabel>
                  <Select
                    labelId="userType" id="userType-select" value={userType} label="نوع المستخدم"
                    onChange={(e) => setUserType(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { fontFamily: FONT } } }}
                  >
                    {USER_TYPES_VALUES.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontFamily: FONT, fontSize: "13px" }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", mt: "22px" }}>
              <Box component="button" type="button" onClick={() => navigate("/users")} sx={{ ...btnBase, border: `1px solid ${HX.border2}`, bgcolor: HX.surface, color: HX.tx2, "&:hover": { bgcolor: HX.surface3, color: HX.tx } }}>
                إلغاء
              </Box>
              <Box component="button" type="button" onClick={isEdit ? updateUser : addUser} sx={{ ...btnBase, bgcolor: HX.accent, color: "#fff", "&:hover": { bgcolor: "#4f46e5" } }}>
                {isEdit ? "حفظ" : "إضافة"}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default AddEditUser;
