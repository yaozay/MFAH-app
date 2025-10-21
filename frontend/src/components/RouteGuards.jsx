import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RoleRoute({ children, allowed }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to="/forbidden" replace />;
  return children;
}
