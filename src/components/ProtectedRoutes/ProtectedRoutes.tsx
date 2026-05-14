/* eslint-disable react/prop-types */
import React from "react";
import { Navigate } from "react-router-dom";
import {
  getStoredUserParsed,
  isStoredSessionValid,
  redirectToSignIn,
  SIGN_IN_PATH,
} from "shared/functions/sessionGuard";

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  if (!isStoredSessionValid()) {
    const stored = getStoredUserParsed();
    if (stored) {
      redirectToSignIn();
      return null;
    }
    return <Navigate to={SIGN_IN_PATH} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoutes;
