// src/components/ProtectedRoute.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "manager")[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.userType)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
