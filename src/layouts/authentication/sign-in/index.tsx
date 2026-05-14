import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SignInSplitLayout from "layouts/authentication/components/AuthSplitLayout";
import { CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "store/slices/authSlice";
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import axiosRequest from "shared/functions/axiosRequest";
import { AUTH_STORAGE_CHANGED } from "shared/functions/sessionGuard";
import { setNotifications } from "store/slices/notificationsSlice";
import { Button, Input } from "components/ui";

const signInFieldBaseSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1,
    backgroundColor: "#ffffff",
    transition: (theme) =>
      theme.transitions.create(["border-color", "box-shadow"], { duration: 200 }),
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.2)",
  },
  "& .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
    borderWidth: 2,
  },
  "& .MuiOutlinedInput-root.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "error.main",
    borderWidth: 2,
  },
};

const signInFieldEmailSx = {
  ...signInFieldBaseSx,
  "& .MuiOutlinedInput-input": {
    textAlign: "left",
    direction: "ltr",
  },
};

const signInFieldPasswordSx = {
  ...signInFieldBaseSx,
  "& .MuiOutlinedInput-input": {
    textAlign: "left",
  },
};

const formLabelRowSx = {
  display: "block",
  textAlign: "left",
  mb: 1,
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "text.primary",
  lineHeight: 1.4,
};

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

    axiosRequest
      .post("/users/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...response.data.data.user, token: response.data.data.token })
        );
        window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED));
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
      .get("/notifications")
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
    <SignInSplitLayout>
      <ToastContainer />
      <Box component="section" sx={{ width: "100%" }}>
        <Box sx={{ textAlign: "end", maxWidth: 420, width: "100%", mx: "auto", mb: 1 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 800,
              color: (theme) => (theme.palette.mode === "dark" ? "grey.100" : "grey.900"),
              letterSpacing: "0.01em",
              lineHeight: 1.25,
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
            }}
          >
            مرحباً بعودتك
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: (theme) => (theme.palette.mode === "dark" ? "grey.400" : "grey.600"),
              lineHeight: 1.8,
              fontSize: "0.9375rem",
              textAlign: "end",
              px: { xs: 0.5, sm: 0 },
            }}
          >
            سجّل الدخول إلى حسابك للوصول إلى منصة هومكس الداخلية
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSignInClick}
          noValidate
          dir="rtl"
          sx={{ textAlign: "left", maxWidth: 420, width: "100%", mx: "auto", mt: 2 }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                component="label"
                id="signin-email-label"
                htmlFor="signin-email"
                variant="body2"
                sx={formLabelRowSx}
              >
                البريد الإلكتروني
              </Typography>
              <Input
                value={email}
                onChange={handleEmailChange}
                id="signin-email"
                name="email"
                type="email"
                autoFocus
                autoComplete="email"
                size="medium"
                placeholder="name@email.com"
                color="primary"
                disabled={isLoading}
                inputProps={{ "aria-labelledby": "signin-email-label", dir: "ltr" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="end">
                      <EmailOutlined sx={{ color: "text.secondary", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
                sx={signInFieldEmailSx}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                id="signin-password-label"
                htmlFor="signin-password"
                variant="body2"
                sx={formLabelRowSx}
              >
                كلمة المرور
              </Typography>
              <Input
                value={password}
                onChange={handlePasswordChange}
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                size="medium"
                placeholder="أدخل كلمة المرور"
                color="primary"
                disabled={isLoading}
                inputProps={{ "aria-labelledby": "signin-password-label" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="end">
                      <LockOutlined sx={{ color: "text.secondary", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        disabled={isLoading}
                        aria-label="إظهار أو إخفاء كلمة المرور"
                        sx={{ color: "text.secondary" }}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={signInFieldPasswordSx}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              size="large"
              disabled={isLoading}
              aria-busy={isLoading}
              sx={{
                borderRadius: 1,
                py: 1.4,
                minHeight: 48,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                mt: 0.5,
                boxShadow: "none",
                position: "relative",
                "&:hover": { boxShadow: "none" },
              }}
              startIcon={
                isLoading ? <CircularProgress color="inherit" size={22} thickness={4} /> : null
              }
            >
              تسجيل الدخول
            </Button>
          </Stack>
        </Box>
      </Box>
    </SignInSplitLayout>
  );
}

export default Basic;
