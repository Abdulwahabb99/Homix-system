/* eslint-disable react/prop-types */
import { AuthContext } from "context";
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
function ProtectedRoutes({ children }) {
  const { user } = useContext(AuthContext);
  const userData = JSON.parse(localStorage.getItem("user"));
  if (!userData?.token && !user?.token) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return <div>{children}</div>;
}

export default ProtectedRoutes;
