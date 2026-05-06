import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Loader from "./Loader.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  
  // If user is missing in state, check localStorage as a defensive fallback.
  // This prevents flickering/premature redirects during auth state transitions.
  const stored = localStorage.getItem("collabboard_user");
  if (!user && !stored) return <Navigate to="/login" replace />;

  return <Outlet />;
}