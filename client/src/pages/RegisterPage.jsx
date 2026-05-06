import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";
import RegisterForm from "../components/auth/RegisterForm.jsx";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (name, email, password) => {
    try {
      setLoading(true);
      await register(name, email, password);
      toast.success("Account created! Welcome 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0EB",
        backgroundImage: "radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <RegisterForm onRegister={handleRegister} loading={loading} />
    </div>
  );
}