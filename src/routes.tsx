import Icon from "@mui/material/Icon";
import React, { lazy, Suspense } from "react";
import Spinner from "components/Spinner/Spinner";
import Vendors from "layouts/Vendors";
const Products = React.lazy(() => import(/* webpackPrefetch: true */ "layouts/Products/Products"));
const Dashboard = React.lazy(
  () => import(/* webpackPrefetch: true */ "claude/dashboard/HomixDashboardPage")
);
const Orders = React.lazy(() => import(/* webpackPrefetch: true */ "layouts/Orders"));
const Tickets = React.lazy(() => import(/* webpackPrefetch: true */ "layouts/Tickets"));
const ProtectedRoutes = React.lazy(
  () => import(/* webpackPrefetch: true */ "components/ProtectedRoutes/ProtectedRoutes")
);
const Financialreports = React.lazy(
  () => import(/* webpackPrefetch: true */ "layouts/Financialreports")
);
const Factories = React.lazy(
  () => import(/* webpackPrefetch: true */ "layouts/Factories")
);
const Users = React.lazy(() => import("./layouts/Users"));
const Shipments = React.lazy(() => import("./layouts/Shipments/Shipments"));

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
    name: "الشحن والتوصيل",
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
    name: "التذاكر",
    key: "tickets",
    icon: <Icon fontSize="small">confirmation_number</Icon>,
    route: "/tickets",
    component: (
      <ProtectedRoutes>
        <Suspense fallback={<div><Spinner /></div>}>
          <Tickets />
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
        <Suspense fallback={<div><Spinner /></div>}>
          <Orders />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "التذاكر",
    key: "tickets",
    icon: <Icon fontSize="small">confirmation_number</Icon>,
    route: "/tickets",
    component: (
      <ProtectedRoutes>
        <Suspense fallback={<div><Spinner /></div>}>
          <Tickets />
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
    name: "الشحن والتوصيل",
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
    name: "التذاكر",
    key: "tickets",
    icon: <Icon fontSize="small">confirmation_number</Icon>,
    route: "/tickets",
    component: (
      <ProtectedRoutes>
        <Suspense fallback={<div><Spinner /></div>}>
          <Tickets />
        </Suspense>
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
    name: "الشحن والتوصيل",
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
    name: "التذاكر",
    key: "tickets",
    icon: <Icon fontSize="small">confirmation_number</Icon>,
    route: "/tickets",
    component: (
      <ProtectedRoutes>
        <Suspense fallback={<div><Spinner /></div>}>
          <Tickets />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
];
