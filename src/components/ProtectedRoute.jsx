import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />; // show spinner while checking
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RoleRoute({ children, allow }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allow && role && !allow.includes(role)) {
    // redirect to respective dashboard
    return <Navigate to={role === "teacher" ? "/teacher" : "/student"} replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to={role === "teacher" ? "/teacher" : "/student"} replace />;
  return children;
}
