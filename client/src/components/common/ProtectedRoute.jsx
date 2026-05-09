import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Loader from "./Loader.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  const token = localStorage.getItem("token");

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}