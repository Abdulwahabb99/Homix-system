import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axiosRequest from "shared/functions/axiosRequest";
import MDTypography from "components/MDTypography";
import { clearNotifications, setNotifications } from "store/slices/notificationsSlice";

const BELL_SURFACE = "#ffffff";

type Notif = {
  id?: string | number;
  text?: string;
  readAt?: string | null;
  orderId?: string | number | null;
  createdAt?: string;
};

export default function HomixNotificationsButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const reduxDispatch = useDispatch();
  const notifications = useSelector((s: { notifications: Notif[] }) => s.notifications) as Notif[];
  const unread = notifications.filter((n) => !n.readAt);

  const open = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    const hasUnread = notifications.some((n) => !n.readAt);
    if (!hasUnread) return;
    const updated = notifications.map((n) => ({
      ...n,
      readAt: n.readAt || new Date().toISOString(),
    }));
    reduxDispatch(setNotifications(updated));
    localStorage.setItem("notifications", JSON.stringify(updated));
    axiosRequest.put(`${process.env.REACT_APP_API_URL}/notifications`);
  };

  const close = () => setAnchorEl(null);

  const wipe = () => {
    if (!notifications.length) return;
    reduxDispatch(clearNotifications());
    localStorage.removeItem("notifications");
    close();
    axiosRequest.delete(`${process.env.REACT_APP_API_URL}/notifications`);
  };

  return (
    <>
      <Badge
        variant="dot"
        color="error"
        overlap="circular"
        invisible={unread.length === 0}
        sx={{
          flexShrink: 0,
          "& .MuiBadge-dot": {
            minWidth: 6,
            width: 6,
            height: 6,
            borderRadius: "50%",
            border: `1.5px solid ${BELL_SURFACE}`,
            top: 5,
            right: 5,
          },
        }}
      >
        <IconButton
          size="small"
          aria-label="الإشعارات"
          aria-controls={anchorEl ? "homix-notification-menu" : undefined}
          aria-expanded={anchorEl ? "true" : "false"}
          onClick={open}
          sx={{
            width: 34,
            height: 34,
            border: "0.5px solid rgba(0,0,0,0.1)",
            borderRadius: "9px",
            bgcolor: BELL_SURFACE,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Badge>

      <Menu
        id="homix-notification-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: "min(380px, calc(100vw - 24px))",
            mt: 0.75,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            boxShadow:
              "0 8px 32px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.06)",
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
              fontWeight="bold"
              sx={{ fontSize: "0.95rem", color: "text.primary" }}
            >
              الإشعارات
            </MDTypography>
            {unread.length > 0 && (
              <MDTypography
                component="span"
                variant="caption"
                color="primary"
                fontWeight="bold"
                sx={{
                  fontSize: "0.7rem",
                  py: 0.25,
                  px: 0.75,
                  borderRadius: 1,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.14),
                }}
              >
                {unread.length} جديد
              </MDTypography>
            )}
          </Box>

          <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", opacity: 0.5, mb: 1 }} />
                <MDTypography
                  variant="body2"
                  display="block"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  لا توجد إشعارات
                </MDTypography>
              </Box>
            ) : (
              <List disablePadding>
                {notifications.map((notification) => {
                  const isUnread = !notification.readAt;
                  return (
                    <ListItemButton
                      key={notification.id}
                      onClick={() => {
                        if (notification.orderId) navigate(`/orders/${notification.orderId}`);
                        close();
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
                          isUnread ? alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.1 : 0.06) : "transparent",
                        "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, alignSelf: "flex-start" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
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
                            : undefined
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
                onClick={wipe}
                sx={{
                  py: 1.25,
                  justifyContent: "center",
                  gap: 0.75,
                  color: "error.main",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  borderRadius: 0,
                  "&:hover": { bgcolor: (t) => alpha(t.palette.error.main, 0.08) },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
                مسح الكل
              </ListItemButton>
            </>
          )}
        </Box>
      </Menu>
    </>
  );
}
