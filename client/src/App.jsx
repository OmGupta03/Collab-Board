import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider }   from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ProtectedRoute     from "./components/common/ProtectedRoute.jsx";

import LandingPage    from "./pages/LandingPage.jsx";
import LoginPage      from "./pages/LoginPage.jsx";
import RegisterPage   from "./pages/RegisterPage.jsx";
import DashboardPage  from "./pages/DashboardPage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage.jsx";
import ProfilePage    from "./pages/ProfilePage.jsx";

import GoogleCallbackPage from "./pages/GoogleCallbackPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/"          element={<LandingPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/auth/callback" element={<GoogleCallbackPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"         element={<DashboardPage />} />
              <Route path="/room/:roomId"       element={<WhiteboardPage />} />
              <Route path="/profile"           element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}