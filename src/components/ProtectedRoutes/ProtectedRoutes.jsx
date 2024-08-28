/* eslint-disable react/prop-types */
import React from "react";
import { Navigate } from "react-router-dom";
function ProtectedRoutes({ children }) {
  const userData = JSON.parse(localStorage.getItem("user"));
  if (!userData) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return <div>{children}</div>;
}

export default ProtectedRoutes;
