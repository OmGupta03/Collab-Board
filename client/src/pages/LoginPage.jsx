import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";
import LoginForm from "../components/auth/LoginForm.jsx";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back ✏️");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0EB",
      backgroundImage: "radial-gradient(circle, #C8B8A2 1.2px, transparent 1.2px)",
      backgroundSize: "24px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Nunito:wght@800;900&family=Caveat:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes floatA { 0%,100%{transform:rotate(-6deg) translateY(0px)} 50%{transform:rotate(-6deg) translateY(-8px)} }
        @keyframes floatB { 0%,100%{transform:rotate(5deg) translateY(0px)} 50%{transform:rotate(5deg) translateY(-6px)} }
        @keyframes floatC { 0%,100%{transform:rotate(-3deg) translateY(0px)} 50%{transform:rotate(-3deg) translateY(-10px)} }
        @keyframes floatD { 0%,100%{transform:rotate(7deg) translateY(0px)} 50%{transform:rotate(7deg) translateY(-7px)} }
        @keyframes floatE { 0%,100%{transform:rotate(-5deg) translateY(0px)} 50%{transform:rotate(-5deg) translateY(-9px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px) rotate(-1deg)} to{opacity:1;transform:translateY(0) rotate(-1deg)} }
        @keyframes wiggle { 0%{transform:rotate(-1deg)} 25%{transform:rotate(0.5deg)} 50%{transform:rotate(-1deg)} 75%{transform:rotate(0.3deg)} 100%{transform:rotate(-1deg)} }

        .sticky-bg {
          position: absolute; border-radius: 14px;
          font-family: 'Caveat', cursive; font-weight: 600;
          font-size: 15px; line-height: 1.45;
          box-shadow: 3px 5px 20px rgba(0,0,0,0.13);
          padding: 14px 16px; color: #3D3020;
          pointer-events: none; user-select: none;
        }
      `}</style>

      {/* ── BACKGROUND STICKY NOTES ─────────────────────────────────── */}

      <div className="sticky-bg" style={{ top: "9%", left: "7%", width: 148, background: "#FFE566", animation: "floatA 5s ease-in-out infinite", transform: "rotate(-6deg)", borderBottom: "3px solid #F0CC00" }}>
        ✏️ Design sprint<br />planning session
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      <div className="sticky-bg" style={{ top: "7%", right: "8%", width: 140, background: "#B8F0D4", animation: "floatB 6s ease-in-out infinite", transform: "rotate(5deg)", borderBottom: "3px solid #7ED8A8" }}>
        🚀 Launch checklist<br />Q2 ready!
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      <div className="sticky-bg" style={{ top: "42%", left: "5%", width: 135, background: "#B8DCFF", animation: "floatC 5.5s ease-in-out infinite 0.4s", transform: "rotate(-3deg)", borderBottom: "3px solid #80BCFF" }}>
        💡 Brainstorm<br />new features
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      <div className="sticky-bg" style={{ top: "38%", right: "6%", width: 145, background: "#FFD4B8", animation: "floatD 4.8s ease-in-out infinite 0.2s", transform: "rotate(7deg)", borderBottom: "3px solid #FFB080" }}>
        🎨 UI review<br />feedback round 2
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      <div className="sticky-bg" style={{ bottom: "10%", left: "8%", width: 138, background: "#E0CCFF", animation: "floatE 6.2s ease-in-out infinite 0.6s", transform: "rotate(-5deg)", borderBottom: "3px solid #C49EFF" }}>
        📋 Team retro<br />notes — done ✓
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      <div className="sticky-bg" style={{ bottom: "8%", right: "7%", width: 142, background: "#E4F5A8", animation: "floatB 5.8s ease-in-out infinite 0.8s", transform: "rotate(4deg)", borderBottom: "3px solid #C8E860" }}>
        🎯 Sprint goals<br />set for week 3
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* ── LOGIN FORM COMPONENT ──────────────────────────── */}
      <LoginForm onLogin={handleLogin} loading={loading} />
    </div>
  );
}