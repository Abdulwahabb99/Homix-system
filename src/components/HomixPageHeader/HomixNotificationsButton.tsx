import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, ButtonBase, IconButton, Popover, Typography } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { getUserType } from "shared/utils/constants";
import {
  CATEGORY_LABELS,
  NOTIFICATION_TABS,
  countUnread,
  formatBadge,
  formatRelativeTime,
  getNotificationCategory,
  getNotificationRoute,
  getNotificationTitle,
} from "shared/notifications/notificationCategories";
import type {
  NotificationCategory,
  NotificationCounts,
  NotificationItem,
  NotificationTab,
} from "shared/notifications/notificationCategories";
import type { NotificationCursor } from "shared/notifications/notificationsApi";
import {
  fetchNotifications,
  loadMoreNotifications,
  markAllLabel,
  markAllRead,
  markNotificationReadRequest,
} from "shared/notifications/notificationsApi";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { markNotificationRead } from "store/slices/notificationsSlice";

type NotificationPage = {
  items: NotificationItem[];
  hasMore: boolean;
  nextCursor: NotificationCursor | null;
  loaded: boolean;
};

type NotificationsState = {
  counts: { orders: number; shipments: number; tickets: number; total: number } | null;
  loadingMore: NotificationTab | null;
  pages: Record<NotificationTab, NotificationPage>;
};

const FONT = "'Cairo',sans-serif";
const PANEL_WIDTH = 390;

/** Category look from the reference notification center (icon tile colours). */
const CATEGORY_STYLE: Record<
  NotificationCategory,
  { Icon: React.ElementType; bg: string; color: string }
> = {
  orders: { Icon: AssignmentOutlinedIcon, bg: "rgba(99,102,241,0.12)", color: "#6366f1" },
  shipments: { Icon: LocalShippingOutlinedIcon, bg: "rgba(245,158,11,0.14)", color: "#b45309" },
  tickets: { Icon: ChatBubbleOutlineIcon, bg: "rgba(236,72,153,0.12)", color: "#db2777" },
};

function getLoggedInUser(): { name: string; role: string } {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null") || {};
    const name = [u.firstName, u.lastName]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ");
    return { name: name || (u.email || "").trim(), role: getUserType(String(u.userType ?? "")) };
  } catch {
    return { name: "", role: "" };
  }
}

function CountBadge({ count, sx }: { count: number; sx?: object }) {
  if (!count) return null;
  return (
    <Box
      component="span"
      sx={{
        minWidth: 16,
        height: 16,
        px: "4px",
        borderRadius: "8px",
        bgcolor: HX.red,
        color: "#fff",
        fontSize: "9.5px",
        fontWeight: 800,
        lineHeight: 1,
        fontFamily: FONT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      {formatBadge(count)}
    </Box>
  );
}

function HomixNotificationsButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tab, setTab] = useState<NotificationTab>("all");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { counts: serverCounts, loadingMore, pages } = useSelector(
    (s: { notifications: NotificationsState }) => s.notifications
  ) as NotificationsState;
  const page = pages[tab];
  const list = page.items;

  /* Badges come from the server (all unread rows); the loaded page is only a window of the history, so counting
     it would under-report. The local count is only a fallback until the first response arrives. */
  const counts = useMemo<NotificationCounts>(() => {
    if (serverCounts) {
      return {
        all: serverCounts.total,
        orders: serverCounts.orders,
        shipments: serverCounts.shipments,
        tickets: serverCounts.tickets,
      };
    }
    return countUnread(pages.all.items);
  }, [serverCounts, pages.all.items]);

  // A category tab is its own server-side page, fetched the first time it is opened.
  useEffect(() => {
    if (anchorEl && tab !== "all" && !pages[tab].loaded) {
      fetchNotifications(dispatch, tab).catch(() => {});
    }
  }, [anchorEl, tab, pages, dispatch]);

  const loadMore = useCallback(() => {
    loadMoreNotifications(dispatch, tab, page.nextCursor).catch(() => {
      NotificationMeassage("error", "تعذّر تحميل المزيد من الإشعارات");
    });
  }, [dispatch, tab, page.nextCursor]);
  const who = useMemo(getLoggedInUser, [anchorEl]);
  const whoLabel = [who.name, who.role].filter(Boolean).join(" — ");

  const close = () => setAnchorEl(null);

  const markAll = useCallback(() => {
    const category = tab === "all" ? undefined : tab;
    markAllRead(dispatch, category).catch(() => {
      NotificationMeassage("error", "تعذّر تحديد الإشعارات كمقروءة");
    });
  }, [dispatch, tab]);

  const openItem = (n: NotificationItem) => {
    if (!n.readAt) {
      dispatch(markNotificationRead(n.id));
      // Real-time items get a local id until the list is re-fetched; nothing to send then.
      if (!String(n.id).startsWith("local-")) {
        markNotificationReadRequest(n.id as string | number).catch(() => {});
      }
    }
    const route = getNotificationRoute(n);
    if (route) {
      close();
      navigate(route);
    }
  };

  const emptyText =
    tab === "all" ? "مفيش إشعارات مسندة ليك" : `مفيش إشعارات ${CATEGORY_LABELS[tab]} مسندة ليك`;

  return (
    <>
      <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
        <IconButton
          size="small"
          aria-label="الإشعارات"
          title="الإشعارات"
          aria-haspopup="dialog"
          aria-expanded={anchorEl ? "true" : "false"}
          onClick={(e) => {
            setTab("all");
            setAnchorEl(e.currentTarget);
          }}
          sx={{
            width: 34,
            height: 34,
            border: `0.5px solid ${HX.border}`,
            borderRadius: "9px",
            bgcolor: HX.surface,
            color: HX.tx2,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
            "&:hover": { bgcolor: HX.surface2 },
          }}
        >
          <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <CountBadge
          count={counts.all}
          sx={{
            position: "absolute",
            top: -5,
            left: -5,
            minWidth: 17,
            height: 17,
            border: `1.5px solid ${HX.surface}`,
            pointerEvents: "none",
          }}
        />
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        marginThreshold={8}
        PaperProps={{
          role: "dialog",
          "aria-label": "الإشعارات",
          sx: {
            mt: 1,
            width: PANEL_WIDTH,
            maxWidth: "calc(100vw - 16px)",
            maxHeight: "min(620px, calc(100vh - 80px))",
            display: "flex",
            flexDirection: "column",
            bgcolor: HX.surface,
            color: HX.tx,
            border: `0.5px solid ${HX.border2}`,
            borderRadius: "14px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.2)",
            fontFamily: FONT,
            direction: "rtl",
            overflow: "hidden",
          },
        }}
      >
        {/* head */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 2,
            pt: "13px",
            pb: "10px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 800, fontFamily: FONT, color: HX.tx }}>
              الإشعارات
            </Typography>
            {whoLabel && (
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: HX.tx3, mt: "1px", fontFamily: FONT }}
              >
                المسندة لـ {whoLabel}
              </Typography>
            )}
          </Box>
          <ButtonBase
            onClick={markAll}
            disabled={!counts[tab]}
            sx={{
              fontFamily: FONT,
              fontSize: 11.5,
              fontWeight: 700,
              color: HX.accent,
              whiteSpace: "nowrap",
              "&.Mui-disabled": { color: HX.tx3 },
            }}
          >
            {markAllLabel(tab)}
          </ButtonBase>
        </Box>

        {/* tabs */}
        <Box
          role="tablist"
          sx={{
            display: "flex",
            gap: "4px",
            px: "12px",
            pb: "10px",
            borderBottom: `0.5px solid ${HX.border}`,
          }}
        >
          {NOTIFICATION_TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <ButtonBase
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                sx={{
                  flex: 1,
                  gap: "5px",
                  py: "7px",
                  px: "4px",
                  borderRadius: "8px",
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 700,
                  color: active ? HX.accent : HX.tx2,
                  bgcolor: active ? HX.accentLight : "transparent",
                  "&:hover": { bgcolor: active ? HX.accentLight : HX.surface2 },
                }}
              >
                {label}
                <CountBadge count={counts[key]} />
              </ButtonBase>
            );
          })}
        </Box>

        {/* list */}
        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {list.length === 0 ? (
            <Typography
              sx={{
                py: 5,
                px: 2.5,
                textAlign: "center",
                fontSize: 12.5,
                color: HX.tx3,
                fontFamily: FONT,
              }}
            >
              {emptyText}
            </Typography>
          ) : (
            list.map((n) => {
              const category = getNotificationCategory(n);
              const { Icon, bg, color } = CATEGORY_STYLE[category];
              const unread = !n.readAt;
              return (
                <Box
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openItem(n)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openItem(n);
                    }
                  }}
                  sx={{
                    position: "relative",
                    display: "flex",
                    gap: "11px",
                    px: 2,
                    py: "12px",
                    cursor: "pointer",
                    borderBottom: `0.5px solid ${HX.border}`,
                    bgcolor: unread ? "rgba(99,102,241,0.06)" : "transparent",
                    "&:hover": { bgcolor: HX.surface2 },
                    ...(unread && {
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        right: 6,
                        top: 18,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: HX.accent,
                      },
                    }),
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "9px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: bg,
                      color,
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Typography
                        sx={{ fontSize: 12.5, fontWeight: 800, fontFamily: FONT, color: HX.tx }}
                      >
                        {getNotificationTitle(n)}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 10, color: HX.tx3, whiteSpace: "nowrap", fontFamily: FONT }}
                      >
                        {formatRelativeTime(n.createdAt)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: HX.tx2,
                        mt: "2px",
                        lineHeight: 1.55,
                        fontFamily: FONT,
                        wordBreak: "break-word",
                      }}
                    >
                      {n.text}
                    </Typography>
                    {tab === "all" && (
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: HX.tx3,
                          mt: "3px",
                          fontFamily: FONT,
                        }}
                      >
                        {CATEGORY_LABELS[category]}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
          {page.hasMore && (
            <ButtonBase
              onClick={loadMore}
              disabled={loadingMore !== null}
              sx={{
                width: "100%",
                py: "11px",
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                color: HX.accent,
                "&:hover": { bgcolor: HX.surface2 },
                "&.Mui-disabled": { color: HX.tx3 },
              }}
            >
              {loadingMore !== null ? "جارٍ التحميل..." : "عرض المزيد"}
            </ButtonBase>
          )}
        </Box>
      </Popover>
    </>
  );
}

// The panel can hold a long notification history; parent re-renders must not rebuild it.
export default React.memo(HomixNotificationsButton);
