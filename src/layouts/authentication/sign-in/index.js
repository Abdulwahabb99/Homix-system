import { useContext, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import { Button, Snackbar, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "context";
import axios from "axios";
import Spinner from "components/Spinner/Spinner";

function Basic() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUserData } = useContext(AuthContext);
  const handleSignInClick = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post("https://homix.onrender.com/users/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...response.data.data.user, token: response.data.data.token })
        );
        setUserData({ ...response.data.data.user, token: response.data.data.token });
      })
      .catch(() => {
        setIsErrorAlertOpen((prev) => !prev);
      })
      .finally(() => {
        setIsLoading(false);
        navigate("/home");
      });

    // if (email === testEmail && password === testPass) {
    //   navigate("/home");
    // } else if (!email) {
    //   setEmailErrorMessage("يرجى إدخال البريد الإلكتروني");
    // } else if (!password) {
    //   setErrorMessage("يرجى إدخال كلمة المرور");
    // } else {
    //   setErrorMessage("كلمة المرور غير صحيحة");
    // }
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear email error message if user starts typing again
    // if (emailErrorMessage) {
    //   setEmailErrorMessage("");
    // }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // if (errorMessage) {
    //   setErrorMessage("");
    // }
  };
  const handleClose = () => {
    setIsErrorAlertOpen(false);
  };
  return (
    <BasicLayout>
      {isErrorAlertOpen && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          open={isErrorAlertOpen}
          onClose={setTimeout(() => {
            handleClose();
          }, 3000)}
          message={"البريد الإلكتروني أو كلمة السر غير صحيحة"}
          key={{ vertical: "top", horizontal: "right" }}
        />
      )}
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
                  // error={!!emailErrorMessage}
                  // helperText={emailErrorMessage ? emailErrorMessage : ""}
                />
              </MDBox>
              <MDBox mb={2}>
                <TextField
                  value={password}
                  onChange={handlePasswordChange}
                  id="password"
                  label="password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  // error={!!errorMessage}
                  // helperText={errorMessage}
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
