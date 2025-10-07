import { ReactNode } from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;

  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && userData.role && !allowedRoles.includes(userData.role)) {
    return <Navigate to={"/unauthorized"} replace />;
  }
  return <>{children}</>;
}
