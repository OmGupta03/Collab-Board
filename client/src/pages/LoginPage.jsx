import { useState } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        toast.error("Please enter email and password");
        return;
      }

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

        // .login-card { animation: slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards,wiggle 5s ease-in-out infinite;}
        

        .inp {
          width: 100%; padding: 11px 13px;
          border-radius: 10px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: all 0.2s; background: rgba(255,255,255,0.7);
        }
        .inp:focus { outline: none; }

        .btn-google:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; }
        .btn-login:hover  { transform: translateY(-2px) rotate(0.5deg); box-shadow: 0 8px 28px rgba(124,58,237,0.45) !important; }
        .btn-login:active { transform: translateY(0) scale(0.98); }

        .tape {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          width: 60px; height: 22px; border-radius: 4px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          z-index: 10;
        }

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

      {/* Top-left yellow */}
      <div className="sticky-bg" style={{
        top: "9%", left: "7%", width: 148, background: "#FFE566",
        animation: "floatA 5s ease-in-out infinite", transform: "rotate(-6deg)",
        borderBottom: "3px solid #F0CC00",
      }}>
        ✏️ Design sprint<br />planning session
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* Top-right mint */}
      <div className="sticky-bg" style={{
        top: "7%", right: "8%", width: 140, background: "#B8F0D4",
        animation: "floatB 6s ease-in-out infinite", transform: "rotate(5deg)",
        borderBottom: "3px solid #7ED8A8",
      }}>
        🚀 Launch checklist<br />Q2 ready!
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* Mid-left blue */}
      <div className="sticky-bg" style={{
        top: "42%", left: "5%", width: 135, background: "#B8DCFF",
        animation: "floatC 5.5s ease-in-out infinite 0.4s", transform: "rotate(-3deg)",
        borderBottom: "3px solid #80BCFF",
      }}>
        💡 Brainstorm<br />new features
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* Mid-right peach */}
      <div className="sticky-bg" style={{
        top: "38%", right: "6%", width: 145, background: "#FFD4B8",
        animation: "floatD 4.8s ease-in-out infinite 0.2s", transform: "rotate(7deg)",
        borderBottom: "3px solid #FFB080",
      }}>
        🎨 UI review<br />feedback round 2
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* Bottom-left lavender */}
      <div className="sticky-bg" style={{
        bottom: "10%", left: "8%", width: 138, background: "#E0CCFF",
        animation: "floatE 6.2s ease-in-out infinite 0.6s", transform: "rotate(-5deg)",
        borderBottom: "3px solid #C49EFF",
      }}>
        📋 Team retro<br />notes — done ✓
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* Bottom-right yellow-green */}
      <div className="sticky-bg" style={{
        bottom: "8%", right: "7%", width: 142, background: "#E4F5A8",
        animation: "floatB 5.8s ease-in-out infinite 0.8s", transform: "rotate(4deg)",
        borderBottom: "3px solid #C8E860",
      }}>
        🎯 Sprint goals<br />set for week 3
        <div style={{ width: 20, height: 3, background: "rgba(0,0,0,0.1)", borderRadius: 10, marginTop: 10 }} />
      </div>

      {/* ── LOGIN CARD (sticky note style) ──────────────────────────── */}
      <div className="login-card" style={{
        width: 400,
        background: "#FFFDE7",
        borderRadius: 4,
        padding: "44px 36px 36px",
        position: "relative",
        zIndex: 10,
        transform: "rotate(-1deg)",

        /* Sticky note shadow — deeper on bottom-right */
        boxShadow: `
          4px 6px 0px #E8D84A,
          6px 10px 30px rgba(0,0,0,0.18),
          0 1px 0 rgba(255,255,255,0.9) inset
        `,

        /* Slight paper texture via gradient */
        backgroundImage: `
          linear-gradient(
            rgba(255,252,200,0.6) 0px,
            rgba(255,252,200,0) 80px
          )
        `,
        borderTop: "2px solid rgba(255,255,255,0.8)",
      }}>

        {/* Tape strip */}
        <div className="tape" />

        {/* Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
            }}>
              <Pencil size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 900,
              fontSize: 22, color: "#2D1B69", letterSpacing: "-0.5px",
            }}>CollabBoard</span>
          </div>
          <p style={{
            fontFamily: "'Caveat', cursive", fontSize: 17,
            color: "#7C6B3A", fontWeight: 600,
          }}>Welcome back! Sign in to your board ✏️</p>
        </div>

        {/* Google button */}
        <button
          className="btn-google"
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`} style={{
            width: "100%", padding: "11px 16px", borderRadius: 12,
            border: "1.5px solid rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#374151",
            marginBottom: 18,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
            backdropFilter: "blur(4px)",
          }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
          <span style={{ fontFamily: "'Caveat', cursive", color: "#A89050", fontSize: 14, fontWeight: 600 }}>or use email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 700,
            color: "#7C6030", marginBottom: 6,
            textTransform: "uppercase", letterSpacing: "0.5px",
          }}>Email</label>
          <input
            className="inp"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
            placeholder="you@example.com"
            style={{
              border: focused === "email"
                ? "1.5px solid #8B5CF6"
                : "1.5px solid rgba(0,0,0,0.12)",
              boxShadow: focused === "email"
                ? "0 0 0 3px rgba(139,92,246,0.15)"
                : "none",
              color: "#2D1B69",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{
              fontSize: 12, fontWeight: 700, color: "#7C6030",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Password</label>
            <span style={{ fontSize: 12, color: "#8B5CF6", cursor: "pointer", fontWeight: 700 }}>Forgot?</span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              className="inp"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused("")}
              placeholder="••••••••"
              style={{
                border: focused === "pass"
                  ? "1.5px solid #8B5CF6"
                  : "1.5px solid rgba(0,0,0,0.12)",
                boxShadow: focused === "pass"
                  ? "0 0 0 3px rgba(139,92,246,0.15)"
                  : "none",
                color: "#2D1B69",
                paddingRight: 40,
              }}
            />
            <button
              onClick={() => setShowPass(p => !p)}
              style={{
                position: "absolute", right: 11, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#A89050",
                display: "flex", padding: 0,
              }}
            >
              {showPass ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Sign in button */}
        <button className="btn-login" onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "13px",
          borderRadius: 12, border: "none",
          background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
          color: "#fff", cursor: "pointer",
          fontSize: 15, fontWeight: 800,
          boxShadow: "0 4px 18px rgba(139,92,246,0.38)",
          transition: "all 0.2s",
          letterSpacing: "-0.2px",
        }}>
          {loading ? "Signing in…  ✏️" : "Sign in →"}
        </button>

        {/* Register link */}
        <p style={{
          textAlign: "center", marginTop: 18,
          fontFamily: "'Caveat', cursive",
          color: "#7C6B3A", fontSize: 16,
        }}>
          New here?{" "}
          <Link
            to="/register"
            style={{
              color: "#8B5CF6",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none"
            }}
          >
            Create a free account
          </Link>
        </p>

        { }
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {["🔒 Secure", "⚡ Fast", "🎨 Creative"].map(tag => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 700,
                background: "rgba(139,92,246,0.1)",
                color: "#6D3FCC", padding: "3px 9px",
                borderRadius: 20, fontFamily: "'DM Sans', sans-serif",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}