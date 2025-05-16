import { useContext, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { Button, TextField, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "components/Spinner/Spinner";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "store/slices/authSlice";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

        navigate("/home");
      })
      .catch(() => {
        NotificationMeassage("error", "البريد الإلكتروني أو كلمة السر غير صحيحة");
      })
      .finally(() => {
        setIsLoading(false);
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
        <Card>
          <MDBox
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            mx={2}
            mt={-3}
            p={2}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              تسجيل دخول
            </MDTypography>
            <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
              <Grid item xs={2}>
                <MDTypography variant="body1" color="white">
                  <FacebookIcon color="inherit" />
                </MDTypography>
              </Grid>
              <Grid item xs={2}>
                <MDTypography variant="body1" color="white">
                  <GitHubIcon color="inherit" />
                </MDTypography>
              </Grid>
              <Grid item xs={2}>
                <MDTypography variant="body1" color="white">
                  <GoogleIcon color="inherit" />
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <form onSubmit={handleSignInClick}>
              <MDBox mb={2}>
                <TextField
                  value={email}
                  onChange={handleEmailChange}
                  id="email"
                  label="email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  autoFocus
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  value={password}
                  onChange={handlePasswordChange}
                  id="password"
                  label="password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MDBox>
              <MDBox mt={4} mb={1}>
                <Button
                  style={{ color: "#fff", fontSize: "1rem" }}
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                >
                  تسجيل دخول
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
