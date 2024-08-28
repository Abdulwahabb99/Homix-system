import { useState, useEffect, useMemo, Suspense } from "react";
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
import homix from "assets/images/homix.jpg";
import NotFound from "layouts/authentication/components/NotFound/NotFound";
import OrderDetails from "layouts/Orders/OrderDetails";
import ProductDetails from "layouts/Products/components/ProductDetails";
import AddEditFactory from "layouts/Factories/AddEditFactory";
import ProtectedRoutes from "components/ProtectedRoutes/ProtectedRoutes";
import Spinner from "components/Spinner/Spinner";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, sidenavColor, darkMode } = controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();

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

  // Change the openConfigurator state

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", "rtl");
  }, []);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

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
              routes={routes}
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
              path="/products/:id"
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
          </Routes>
        </Suspense>
      </ThemeProvider>
    </CacheProvider>
  );
}
