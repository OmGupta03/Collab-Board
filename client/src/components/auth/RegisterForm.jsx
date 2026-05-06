import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterForm({ onRegister, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    onRegister(name, email, password);
  };

  return (
    <div
      className="rcard"
      style={{
        width: 420,
        background: "#E8F8F0",
        borderRadius: 4,
        padding: "44px 36px 36px",
        position: "relative",
        transform: "rotate(1deg)",
        boxShadow: "4px 6px 0 #A4D4B8, 6px 10px 30px rgba(0,0,0,0.18)",
        borderTop: "2px solid rgba(255,255,255,0.8)",
        backgroundImage: "linear-gradient(rgba(255,255,255,.3), transparent 70px)",
      }}
    >
      <style>{`
        @keyframes slideUp{
          from{opacity:0;transform:translateY(30px) rotate(1deg)}
          to{opacity:1;transform:translateY(0) rotate(1deg)}
        }
        .rcard {
          animation: slideUp .6s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        .tape{
          position:absolute;
          top:-14px;
          left:50%;
          transform:translateX(-50%);
          width:60px;
          height:22px;
          border-radius:4px;
          background:rgba(255,255,255,.55);
          border:1px solid rgba(255,255,255,.8);
          z-index:10;
        }
        .inp{
          width:100%;
          padding:11px 13px;
          border-radius:10px;
          font-size:14px;
          font-family:'DM Sans',sans-serif;
          font-weight:500;
          transition:all .2s;
          background:rgba(255,255,255,.75);
        }
        .inp:focus{outline:none;}
        .btn:hover{
          transform:translateY(-2px);
          box-shadow:0 8px 22px rgba(34,197,94,.45);
        }
      `}</style>
      <div className="tape" />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#8B5CF6,#A78BFA)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Pencil size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 22, color: "#2D1B69" }}>CollabBoard</span>
        </div>
        <p style={{ fontFamily: "'Caveat',cursive", fontSize: 17, color: "#2D6040", fontWeight: 600 }}>Create your account — it's free! 🚀</p>
      </div>

      <form onSubmit={handleRegister}>
        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="name" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2D6040", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</label>
          <input
            id="name"
            className="inp"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused("")}
            placeholder="Name"
            style={{
              border: focused === "name" ? "1.5px solid #16A34A" : "1.5px solid rgba(0,0,0,.12)",
              boxShadow: focused === "name" ? "0 0 0 3px rgba(34,197,94,.15)" : "none",
              color: "#0D3320",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2D6040", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</label>
          <input
            id="email"
            className="inp"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
            placeholder="you@example.com"
            style={{
              border: focused === "email" ? "1.5px solid #16A34A" : "1.5px solid rgba(0,0,0,.12)",
              boxShadow: focused === "email" ? "0 0 0 3px rgba(34,197,94,.15)" : "none",
              color: "#0D3320",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#2D6040", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              className="inp"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused("")}
              placeholder="Min. 6 characters"
              style={{
                border: focused === "pass" ? "1.5px solid #16A34A" : "1.5px solid rgba(0,0,0,.12)",
                boxShadow: focused === "pass" ? "0 0 0 3px rgba(34,197,94,.15)" : "none",
                color: "#0D3320",
                paddingRight: 40,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{
                position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#4A8060",
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading} style={{
          marginTop: 8, width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#16A34A,#22C55E)", color: "#fff", cursor: "pointer",
          fontSize: 15, fontWeight: 800, boxShadow: "0 4px 18px rgba(34,197,94,.38)",
          transition: "all .2s", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Creating account… 🚀" : "Create Account →"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 18, fontFamily: "'Caveat',cursive", color: "#2D6040", fontSize: 16 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#16A34A", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
      </p>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed rgba(0,0,0,.1)", display: "flex", justifyContent: "center", gap: 6 }}>
        {["🔒 Secure", "⚡ Fast", "🎨 Creative"].map((tag) => (
          <span key={tag} style={{ fontSize: 11, fontWeight: 700, background: "rgba(34,197,94,.12)", color: "#15803D", padding: "3px 9px", borderRadius: 20 }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
