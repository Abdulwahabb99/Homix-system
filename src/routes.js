import Dashboard from "layouts/dashboard";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import Orders from "layouts/Orders";
import ProtectedRoutes from "components/ProtectedRoutes/ProtectedRoutes";
import { lazy, Suspense } from "react";
import Spinner from "components/Spinner/Spinner";
const Products = lazy(() => import("layouts/Products/Products"));

const routes = [
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
        <Suspense
          fallback={
            <div>
              <Spinner />
            </div>
          }
        >
          <Products />
        </Suspense>
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "أوامر التصنيع",
    key: "orders",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/orders",
    component: (
      <ProtectedRoutes>
        <Orders />
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
        <Orders />
      </ProtectedRoutes>
    ),
  },
  {
    type: "collapse",
    name: "تقارير مالية",
    key: "financialReports",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/financialReports",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "الموردين",
    key: "vendors",
    icon: <Icon fontSize="small">business</Icon>,
    route: "/vendors",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
