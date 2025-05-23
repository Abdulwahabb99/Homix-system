import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import { Badge, MenuItem } from "@mui/material";
import MDTypography from "components/MDTypography";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "store/slices/notificationsSlice";
import axiosRequest from "shared/functions/axiosRequest";
import { clearNotifications } from "store/slices/notificationsSlice";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState("static");
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const notifications = useSelector((state) => state.notifications);
  const unReadedNotifications = notifications.filter((notification) => !notification.readAt);
  const reduxDispatch = useDispatch();

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);

    const hasUnread = notifications.some((n) => !n.readAt);
    if (!hasUnread) return;

    const updatedNotifications = notifications.map((n) => ({
      ...n,
      readAt: n.readAt || new Date().toISOString(),
    }));

    reduxDispatch(setNotifications(updatedNotifications));
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    axiosRequest.put(`${process.env.REACT_APP_API_URL}/notifications`);
  };

  const handleDeleteNotifications = () => {
    if (notifications.length === 0) return;
    reduxDispatch(clearNotifications());
    localStorage.removeItem("notifications");
    handleCloseMenu();
    axiosRequest.delete(`${process.env.REACT_APP_API_URL}/notifications`);
  };

  const handleCloseMenu = () => setOpenMenu(false);

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      PaperProps={{
        sx: {
          width: "320px",
          p: 0,
        },
      }}
    >
      <MDBox
        sx={{
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {notifications.length === 0 ? (
          <MDBox py={2} textAlign="center">
            <MDTypography variant="body2" color="text.secondary">
              لا يوجد إشعارات حالياً
            </MDTypography>
          </MDBox>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0, 171, 85, 0.1)",
                },
              }}
              onClick={() => {
                window.location.href = `/orders/${notification.orderId}`;
                handleCloseMenu();
              }}
            >
              <MDBox component={Link} py={0.5} display="flex" alignItems="center" lineHeight={1}>
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  sx={{
                    ml: 1,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    maxWidth: "230px",
                  }}
                >
                  {notification.text}
                </MDTypography>
              </MDBox>
            </MenuItem>
          ))
        )}
      </MDBox>

      {/* Sticky clear button */}
      <MDBox
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "white",
          borderTop: "1px solid #eee",
          zIndex: 1,
        }}
      >
        <MenuItem
          onClick={() => {
            handleDeleteNotifications();
          }}
          sx={{
            justifyContent: "center",
            fontWeight: "bold",
            color: "error.main",
            "&:hover": {
              backgroundColor: "rgba(255, 0, 0, 0.08)",
            },
          }}
        >
          مسح الكل
        </MenuItem>
      </MDBox>
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox color={light ? "white" : "inherit"}>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>
              <Badge badgeContent={unReadedNotifications.length} color="error">
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                >
                  <Icon sx={iconsStyle}>notifications</Icon>
                </IconButton>
              </Badge>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
