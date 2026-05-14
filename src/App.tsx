import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalHomixSidenav from "claude/dashboard/components/GlobalHomixSidenav";
import themeRTL from "assets/theme/theme-rtl";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import SignIn from "layouts/authentication/sign-in";
import { useMaterialUIController } from "context";
import NotFound from "layouts/authentication/components/NotFound/NotFound";
import AddEditFactory from "layouts/Factories/AddEditFactory";
import ProtectedRoutes from "components/ProtectedRoutes/ProtectedRoutes";
import Spinner from "components/Spinner/Spinner";
import { vendorsRoutes } from "routes";
import AddEditUser from "layouts/Users/AddEditUser";
import { useDispatch } from "react-redux";
import { setUser } from "store/slices/authSlice";
import AddOrderModal from "layouts/Orders/components/AddOrderModal/AddOrderModal";
import AddShipmentsModal from "layouts/Shipments/components/AddOrderModal/AddOrderModal";
import OrderEdit from "layouts/Orders/OrderEdit/OrderEdit";
import { adminRoutes } from "routes";
import { operationRoutes } from "routes";
import { logisticsRoutes } from "routes";
import useSocket from "./hooks/useSocket";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { addNotification } from "store/slices/notificationsSlice";
import { setNotifications } from "store/slices/notificationsSlice";
import axiosRequest from "shared/functions/axiosRequest";
import {
  isJwtExpired,
  subscribeAuthStorage,
  getUserStorageSnapshot,
  clearAuthStorage,
} from "shared/functions/sessionGuard";

const FactoryDetails = React.lazy(() => import("layouts/Factories/FactoryDetails"));
const OrderDetails = React.lazy(() => import("layouts/Orders/OrderDetails"));
const ProductDetails = React.lazy(() => import("layouts/Products/components/ProductDetails"));
const ShipmentDetails = React.lazy(() => import("layouts/Shipments/components/ShipmentDetails"));
const TicketDetailPage = React.lazy(() => import("layouts/Tickets/TicketDetailPage"));

function parseUserFromStorageRaw(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as unknown;
    return u && typeof u === "object" ? (u as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [storageTick, setStorageTick] = useState(0);
  const bumpStorageRead = useCallback(() => setStorageTick((t) => t + 1), []);

  useEffect(() => subscribeAuthStorage(bumpStorageRead), [bumpStorageRead]);

  const { pathname } = useLocation();
  useEffect(() => {
    bumpStorageRead();
  }, [pathname, bumpStorageRead]);

  const userRaw = useMemo(() => getUserStorageSnapshot(), [storageTick]);

  const parsed = useMemo(() => parseUserFromStorageRaw(userRaw), [userRaw]);

  const sessionOk = Boolean(
    parsed &&
      typeof parsed.token === "string" &&
      parsed.token.length > 0 &&
      !isJwtExpired(parsed.token)
  );

  const user = sessionOk ? parsed : null;
  const [controller] = useMaterialUIController();
  const { layout, darkMode } = controller;
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  const reduxDispatch = useDispatch();

  const isVendor = user?.userType === "2";
  const isAdmin = user?.userType === "1";
  const isOperations = user?.userType === "3";
  const homixNavRole = isAdmin
    ? "admin"
    : isVendor
    ? "vendor"
    : isOperations
    ? "operations"
    : "logistics";

  const playNotificationSound = () => {
    const audio = new Audio("/Notification.wav");
    audio.play();
  };

  const rtlCache = useMemo(
    () =>
      createCache({
        key: "rtl",
        stylisPlugins: [rtlPlugin],
      }),
    []
  );
  useSocket(user?.id != null ? Number(user.id) : undefined, (data) => {
    if (data?.message === "Successfully subscribed to notifications") return;
    if (isUserInteracted) {
      playNotificationSound();
    }
    reduxDispatch(addNotification(data));
    const current = JSON.parse(localStorage.getItem("notifications")) || [];
    const updated = [data, ...current];
    localStorage.setItem("notifications", JSON.stringify(updated));
    NotificationMeassage("info", "لديك إشعار جديد");
  });

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  useEffect(() => {
    if (userRaw && !sessionOk) {
      clearAuthStorage();
    }
  }, [userRaw, sessionOk]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    if (user && sessionOk) {
      reduxDispatch(setUser({ user: { ...user }, token: user.token as string }));
    }
  }, [user, sessionOk, reduxDispatch]);

  useEffect(() => {
    const handleUserInteraction = () => {
      setIsUserInteracted(true);

      // إزالة كل الأحداث بعد أول تفاعل
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("scroll", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    const getNotifications = () => {
      axiosRequest
        .get(`${process.env.REACT_APP_API_URL}/notifications`)
        .then(({ data: { notifications } }) => {
          const newsNotifications = notifications?.map((notification) => ({
            ...notification,
            readAt: notification.readAt ? new Date(notification.readAt) : null,
            orderId: notification.entityId,
          }));

          reduxDispatch(setNotifications(newsNotifications));
          localStorage.setItem("notifications", JSON.stringify(notifications));
        });
    };
    if (user && sessionOk) {
      getNotifications();
    }
  }, [user, sessionOk]);

  // useEffect(() => {
  //   const saved = JSON.parse(localStorage.getItem("notifications")) || [];
  //   if (saved.length > 0) {
  //     saved.forEach((notification) => {
  //       if (!notification?.orderId) {
  //         notification.orderId = notification.entityId;
  //       }
  //     });
  //     reduxDispatch(setNotifications(saved));
  //   }
  // }, []);

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && user && <GlobalHomixSidenav navRole={homixNavRole} />}
        <Suspense fallback={<Spinner />}>
          <Routes>
            {!sessionOk ? (
              <>
                <Route path="/authentication/sign-in" element={<SignIn />} />
                <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
              </>
            ) : (
              <>
                {getRoutes(
                  isVendor
                    ? vendorsRoutes
                    : isAdmin
                    ? adminRoutes
                    : isOperations
                    ? operationRoutes
                    : logisticsRoutes
                )}
                <Route
                  path="/"
                  index
                  element={<Navigate to={isAdmin || isVendor ? "/home" : "/products"} />}
                />
                <Route path="/authentication/sign-in" element={<SignIn />} />
                <Route
                  path="/tickets/:id"
                  element={
                    <ProtectedRoutes>
                      <TicketDetailPage />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoutes>
                      <OrderDetails />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/orders/edit/:id"
                  element={
                    <ProtectedRoutes>
                      <OrderEdit />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/orders/add"
                  element={
                    <ProtectedRoutes>
                      <AddOrderModal />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/shipments/add"
                  element={
                    <ProtectedRoutes>
                      <AddShipmentsModal />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/shipments/:id"
                  element={
                    <ProtectedRoutes>
                      <ShipmentDetails />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <ProtectedRoutes>
                      <ProductDetails />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/factories/add"
                  element={
                    <ProtectedRoutes>
                      <AddEditFactory type="add" />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/factories/edit/:id"
                  element={
                    <ProtectedRoutes>
                      <AddEditFactory type="edit" />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/factories/:id"
                  element={
                    <ProtectedRoutes>
                      <FactoryDetails />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/users/add"
                  element={
                    <ProtectedRoutes>
                      <AddEditUser type="add" />
                    </ProtectedRoutes>
                  }
                />
                <Route
                  path="/users/edit/:id"
                  element={
                    <ProtectedRoutes>
                      <AddEditUser type="edit" />
                    </ProtectedRoutes>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </Suspense>
      </ThemeProvider>
    </CacheProvider>
  );
}
