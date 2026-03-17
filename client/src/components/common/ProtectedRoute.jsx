import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user)   return <Navigate to="/login" replace />;

  return <Outlet />;
}