import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { isAuthed, hasRole, loading } = useAuth();

  // ✅ wait until auth is restored
  if (loading) return null; // or a spinner component

  if (!isAuthed) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
