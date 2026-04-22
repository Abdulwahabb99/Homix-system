import { useState } from "react";
import Box from "@mui/material/Box";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "components/Spinner/Spinner";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "store/slices/authSlice";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosRequest from "shared/functions/axiosRequest";
import { setNotifications } from "store/slices/notificationsSlice";
import { Card, Button, Input } from "components/ui";

function Basic() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const handleSignInClick = (e) => {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post(`${process.env.REACT_APP_API_URL}/users/login`, {
        email: email,
        password: password,
      })
      .then((response) => {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...response.data.data.user, token: response.data.data.token })
        );
        dispatch(
          setUser({ user: { ...response.data.data.user }, token: response.data.data.token })
        );
        getNotifications();

        navigate("/");
      })
      .catch(() => {
        NotificationMeassage("error", "البريد الإلكتروني أو كلمة السر غير صحيحة");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getNotifications = () => {
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/notifications`)
      .then(({ data: { notifications } }) => {
        const newsNotifications = notifications.map((notification) => ({
          ...notification,
          readAt: notification.readAt ? new Date(notification.readAt) : null,
          orderId: notification.entityId,
        }));
        dispatch(setNotifications(newsNotifications));
        localStorage.setItem("notifications", JSON.stringify(notifications));
      });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  return (
    <BasicLayout>
      <ToastContainer />
      {!isLoading ? (
        <Card variant="outlined" hover>
          <Box
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "common.white",
              px: 3,
              py: 3,
              textAlign: "center",
            }}
          >
            <MDTypography
              variant="h5"
              fontWeight={600}
              color="white"
              sx={{ letterSpacing: "0.02em" }}
            >
              تسجيل الدخول
            </MDTypography>
            <MDTypography variant="body2" color="white" sx={{ mt: 1, opacity: 0.88 }}>
              مرحبًا بك في Homix
            </MDTypography>
          </Box>
          <MDBox pt={3} pb={3} px={3}>
            <form onSubmit={handleSignInClick}>
              <MDBox mb={2}>
                <Input
                  value={email}
                  onChange={handleEmailChange}
                  id="email"
                  label="البريد الإلكتروني"
                  type="email"
                  autoFocus
                  autoComplete="email"
                />
              </MDBox>
              <MDBox mb={2}>
                <Input
                  value={password}
                  onChange={handlePasswordChange}
                  id="password"
                  label="كلمة المرور"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label="إظهار كلمة المرور"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>
              <MDBox mt={3} mb={1}>
                <Button variant="contained" color="primary" fullWidth type="submit" size="large">
                  تسجيل الدخول
                </Button>
              </MDBox>
            </form>
          </MDBox>
        </Card>
      ) : (
        <Spinner />
      )}
    </BasicLayout>
  );
}

export default Basic;
