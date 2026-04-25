// @ts-nocheck
import { useState, useEffect } from "react";

// react-router components
import { useLocation, useNavigate } from "react-router-dom";

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
import { useMaterialUIController, setTransparentNavbar, setMiniSidenav } from "context";
import { alpha } from "@mui/material/styles";
import {
  Badge,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MDTypography from "components/MDTypography";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "store/slices/notificationsSlice";
import axiosRequest from "shared/functions/axiosRequest";
import { clearNotifications } from "store/slices/notificationsSlice";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState("static");
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(null as any);
  const navigate = useNavigate();
  const route = useLocation().pathname.split("/").slice(1);
  const notifications = useSelector((state: any) => state.notifications);
  const unReadedNotifications = notifications.filter((notification) => !notification.readAt);
  const reduxDispatch = useDispatch();

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

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

  const handleCloseMenu = () => setOpenMenu(null as any);

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
      id="notification-menu"
      anchorEl={openMenu}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        elevation: 0,
        sx: {
          width: 380,
          maxWidth: "min(380px, calc(100vw - 24px))",
          mt: 0.5,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
          p: 0,
        },
      }}
    >
      <Box sx={{ width: "100%", p: 0, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
          }}
        >
          <MDTypography
            variant="subtitle2"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: "0.95rem" }}
          >
            الإشعارات
          </MDTypography>
          {unReadedNotifications.length > 0 && (
            <MDTypography
              component="span"
              variant="caption"
              color="primary"
              fontWeight={700}
              sx={{
                fontSize: "0.7rem",
                py: 0.25,
                px: 0.75,
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
              }}
            >
              {unReadedNotifications.length} جديد
            </MDTypography>
          )}
        </Box>

        <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                py: 4,
                px: 2,
                textAlign: "center",
              }}
            >
              <NotificationsNoneOutlinedIcon
                sx={{ fontSize: 48, color: "text.disabled", opacity: 0.5, mb: 1 }}
              />
              <MDTypography
                variant="body2"
                color="text.secondary"
                display="block"
                sx={{ fontWeight: 600 }}
              >
                لا توجد إشعارات
              </MDTypography>
              <MDTypography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                نُعلمك عند وصول أي تحديث
              </MDTypography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notification) => {
                const unread = !notification.readAt;
                return (
                  <ListItemButton
                    key={notification.id}
                    onClick={() => {
                      if (notification.orderId) {
                        navigate(`/orders/${notification.orderId}`);
                      }
                      handleCloseMenu();
                    }}
                    sx={{
                      alignItems: "flex-start",
                      py: 1.5,
                      px: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      gap: 1.5,
                      "&:last-of-type": { borderBottom: 0 },
                      bgcolor: (t) =>
                        unread
                          ? alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.1 : 0.06)
                          : "transparent",
                      "&:hover": {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, alignSelf: "flex-start" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          flexShrink: 0,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          color: "primary.main",
                        }}
                      >
                        <ReceiptLongOutlinedIcon fontSize="small" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.text}
                      secondary={
                        notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString("ar-EG", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : null
                      }
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 600,
                        color: "text.primary",
                        sx: { lineHeight: 1.5, whiteSpace: "normal", wordBreak: "break-word" },
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                        color: "text.secondary",
                        sx: { mt: 0.5, display: "block" },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        {notifications.length > 0 && (
          <>
            <Divider />
            <ListItemButton
              onClick={handleDeleteNotifications}
              disabled={notifications.length === 0}
              sx={{
                py: 1.25,
                justifyContent: "center",
                gap: 0.75,
                color: "error.main",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderRadius: 0,
                "&:hover": {
                  bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
              مسح الكل
            </ListItemButton>
          </>
        )}
      </Box>
    </Menu>
  );

  return (
    <AppBar
      position={(absolute ? "absolute" : navbarType) as any}
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
              <Badge
                color="error"
                overlap="circular"
                badgeContent={unReadedNotifications.length}
                invisible={unReadedNotifications.length === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                  },
                }}
              >
                <IconButton
                  size="small"
                  color="inherit"
                  aria-label="الإشعارات"
                  aria-controls={openMenu ? "notification-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(openMenu) ? "true" : "false"}
                  onClick={handleOpenMenu}
                  sx={(t) => ({
                    ...navbarIconButton(t),
                    width: 40,
                    height: 40,
                    border: "1px solid",
                    borderColor: alpha(t.palette.divider, darkMode ? 0.4 : 1),
                    borderRadius: 2,
                    bgcolor: alpha(t.palette.primary.main, light ? 0.12 : 0.08),
                    color: t.palette.primary.main,
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
                    transition: t.transitions.create(
                      ["background-color", "box-shadow", "border-color"],
                      { duration: t.transitions.duration.shorter }
                    ),
                    "&:hover": {
                      bgcolor: alpha(t.palette.primary.main, light ? 0.2 : 0.16),
                      borderColor: alpha(t.palette.primary.main, 0.45),
                    },
                  })}
                >
                  <NotificationsOutlinedIcon sx={{ fontSize: 22 }} />
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
