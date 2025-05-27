import Icon from "@mui/material/Icon";
import React, { lazy, Suspense } from "react";
import Spinner from "components/Spinner/Spinner";
import Vendors from "layouts/Vendors/Vendors";
const Products = React.lazy(() => import(/* webpackPrefetch: true */ "layouts/Products/Products"));
const Dashboard = React.lazy(() =>
  import(/* webpackPrefetch: true */ "layouts/dashboardV2/dashboardV2")
);
const Orders = React.lazy(() => import(/* webpackPrefetch: true */ "layouts/Orders"));
const ProtectedRoutes = React.lazy(() =>
  import(/* webpackPrefetch: true */ "components/ProtectedRoutes/ProtectedRoutes")
);
const Financialreports = React.lazy(() =>
  import(/* webpackPrefetch: true */ "layouts/Financialreports/Financialreports")
);
const Factories = React.lazy(() =>
  import(/* webpackPrefetch: true */ "layouts/Factories/Factories")
);
const Users = React.lazy(() => import("./layouts/Users/Users"));
const Shipments = React.lazy(() => import("./layouts/Shipments/Shipments"));
const user = JSON.parse(localStorage.getItem("user"));
const isVendor = user?.userType === "2";
const isAdmin = user?.userType === "1";

export const adminRoutes = [
  {
    type: "collapse",
    name: "الرئيسية",
    key: "home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/home",
    component: (
      <ProtectedRoutes>
        <Dashboard />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "المنتجات",
    key: "products",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/products",
    component: (
      <ProtectedRoutes>
        <Products />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الطلبات",
    key: "orders",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/orders",
    component: (
      <ProtectedRoutes>
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Orders />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الشحنات",
    key: "shipments",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/shipments",
    component: (
      <ProtectedRoutes>
        <Shipments />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "المصانع",
    key: "factories",
    icon: <Icon fontSize="small">factory</Icon>,
    route: "/factories",
    component: (
      <ProtectedRoutes>
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Factories />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "تقارير مالية",
    key: "financialReports",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/financialReports",
    component: (
      <ProtectedRoutes>
        <Financialreports />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الموردين",
    key: "vendors",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/vendors",
    component: (
      <ProtectedRoutes>
        <Vendors />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "المستخدمون",
    key: "users",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/users",
    component: (
      <ProtectedRoutes>
        <Users />
      </ProtectedRoutes>
    ),
  },
];

export const vendorsRoutes = [
  {
    type: "collapse",
    name: "الرئيسية",
    key: "home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/home",
    component: (
      <ProtectedRoutes>
        <Dashboard />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "المنتجات",
    key: "products",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/products",
    component: (
      <ProtectedRoutes>
        <Products />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الطلبات",
    key: "orders",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/orders",
    component: (
      <ProtectedRoutes>
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Orders />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "تقارير مالية",
    key: "financialReports",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/financialReports",
    component: (
      <ProtectedRoutes>
        <Financialreports />
      </ProtectedRoutes>
    ),
  },
];

export const logisticsRoutes = [
  // {
  //   type: "collapse",
  //   name: "الرئيسية",
  //   key: "home",
  //   icon: <Icon fontSize="small">home</Icon>,
  //   route: "/home",
  //   component: (
  //     <ProtectedRoutes>
  //       <Dashboard />
  //     </ProtectedRoutes>
  //   ),
  // },
  {
    type: "collapse",
    name: "المنتجات",
    key: "products",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/products",
    component: (
      <ProtectedRoutes>
        <Products />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الطلبات",
    key: "orders",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/orders",
    component: (
      <ProtectedRoutes>
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Orders />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الشحنات",
    key: "shipments",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/shipments",
    component: (
      <ProtectedRoutes>
        <Shipments />
      </ProtectedRoutes>
    ),
  },
];
export const operationRoutes = [
  // {
  //   type: "collapse",
  //   name: "الرئيسية",
  //   key: "home",
  //   icon: <Icon fontSize="small">home</Icon>,
  //   route: "/home",
  //   component: (
  //     <ProtectedRoutes>
  //       <Dashboard />
  //     </ProtectedRoutes>
  //   ),
  // },
  {
    type: "collapse",
    name: "المنتجات",
    key: "products",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/products",
    component: (
      <ProtectedRoutes>
        <Products />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الطلبات",
    key: "orders",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/orders",
    component: (
      <ProtectedRoutes>
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Orders />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "المصانع",
    key: "factories",
    icon: <Icon fontSize="small">factory</Icon>,
    route: "/factories",
    component: (
      <ProtectedRoutes>
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Factories />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "الشحنات",
    key: "shipments",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/shipments",
    component: (
      <ProtectedRoutes>
        <Shipments />
      </ProtectedRoutes>
    ),
  },
];
