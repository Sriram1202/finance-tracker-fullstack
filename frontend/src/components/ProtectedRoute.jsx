import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  // While auth initializing, show small loading component (prevents redirect loop)
  if (loading) return <div className="p-6">Checking authentication...</div>;

  // If no token after initialization -> go to login
  if (!token) return <Navigate to="/login" replace />;

  // Authenticated => render children (Layout with Outlet)
  return children;
}
