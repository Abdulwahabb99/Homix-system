import React, { useState, useEffect, useMemo, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import themeRTL from "assets/theme/theme-rtl";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import SignIn from "layouts/authentication/sign-in";
import { useMaterialUIController, setMiniSidenav } from "context";
import homix from "assets/images/homix.png";
import NotFound from "layouts/authentication/components/NotFound/NotFound";
import AddEditFactory from "layouts/Factories/AddEditFactory";
import ProtectedRoutes from "components/ProtectedRoutes/ProtectedRoutes";
import Spinner from "components/Spinner/Spinner";
import { vendorsRoutes } from "routes";
import AddEditUser from "layouts/Users/AddEditUser";
import { useDispatch } from "react-redux";
import { setUser } from "store/slices/authSlice";
import axios from "axios";
import { clearUser } from "store/slices/authSlice";
import AddOrderModal from "layouts/Orders/components/AddOrderModal/AddOrderModal";
import ShipmentDetails from "./layouts/Shipments/components/ShipmentDetails";
const FactoryDetails = React.lazy(() => import("layouts/Factories/FactoryDetails"));
const OrderDetails = React.lazy(() => import("layouts/Orders/OrderDetails"));
const ProductDetails = React.lazy(() => import("layouts/Products/components/ProductDetails"));

export default function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const reduxDispatch = useDispatch();
  const isAdmin = user?.userType === "1";

  const rtlCache = useMemo(
    () =>
      createCache({
        key: "rtl",
        stylisPlugins: [rtlPlugin],
      }),
    []
  );

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const tokenExpiration = JSON.parse(atob(token.split(".")[1])).exp * 1000;
      if (Date.now() > tokenExpiration) {
        localStorage.removeItem("user");
        reduxDispatch(clearUser());
      }
    }
  }, [user?.token, reduxDispatch]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    if (user) {
      reduxDispatch(setUser({ user: { ...user }, token: user.token }));
    }
  }, [reduxDispatch]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={homix}
              brandName="HOMIX"
              routes={isAdmin ? routes : vendorsRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
          </>
        )}
        <Suspense fallback={<Spinner />}>
          <Routes>
            {getRoutes(routes)}
            <Route path="/" index element={<Navigate to="/home" />} />
            <Route path="*" element={<NotFound to="/home" />} />
            <Route
              path="/authentication/sign-in"
              element={<SignIn to="/authentication/sign-in" />}
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoutes>
                  <OrderDetails to="/orders/:id" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/orders/add"
              element={
                <ProtectedRoutes>
                  <AddOrderModal to="/orders/add" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/shipments/:id"
              element={
                <ProtectedRoutes>
                  <ShipmentDetails to="/shipments/:id" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/orders/add"
              element={
                <ProtectedRoutes>
                  <ProductDetails to="/products/:id" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/factories/add"
              element={
                <ProtectedRoutes>
                  <AddEditFactory type="add" to="/factories/add" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/factories/edit/:id"
              element={
                <ProtectedRoutes>
                  <AddEditFactory type="edit" to="/factories/edit/:id" />{" "}
                </ProtectedRoutes>
              }
            />
            <Route
              path="/factories/:id"
              element={
                <ProtectedRoutes>
                  <FactoryDetails type="edit" to="/factories/:id" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/users/add"
              element={
                <ProtectedRoutes>
                  <AddEditUser type="add" to="/users/add" />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/users/edit/:id"
              element={
                <ProtectedRoutes>
                  <AddEditUser type="edit" to="/users/edit/:id" />
                </ProtectedRoutes>
              }
            />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </CacheProvider>
  );
}
