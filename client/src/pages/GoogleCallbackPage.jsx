import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google login failed. Please try again.");
      navigate("/login");
      return;
    }

    if (token && !user) {
      try {
        // Decode token to get user info (basic, since no backend /me call needed)
        const userData = JSON.parse(atob(token.split(".")[1]));
        const fullUser = { 
          ...userData, 
          token, 
          _id: userData.id 
        };
        updateUser(fullUser);
        toast.success("Welcome! Google login successful 🎉");
        navigate("/dashboard");
      } catch (err) {
        toast.error("Invalid token from Google login.");
        navigate("/login");
      }
    } else if (user) {
      navigate("/dashboard");
    }
  }, [searchParams, navigate, updateUser, user]);

  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh", 
      fontFamily: "'DM Sans', sans-serif",
      background: "#F5F0EB"
    }}>
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 20px", background: "linear-gradient(135deg, #8B5CF6, #A78BFA)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "white", fontSize: "24px" }}>🚀</div>
        </div>
        <h2 style={{ color: "#2D1B69", marginBottom: "10px" }}>Signing you in...</h2>
        <p>Completing Google authentication</p>
      </div>
    </div>
  );
}

