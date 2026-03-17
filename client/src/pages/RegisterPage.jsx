import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Pencil, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
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
        backgroundImage:
          "radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`

        @keyframes slideUp{
          from{opacity:0;transform:translateY(30px) rotate(1deg)}
          to{opacity:1;transform:translateY(0) rotate(1deg)}
        }

        // @keyframes floatCard{
        //   0%,100%{transform:rotate(1deg) translateY(0px)}
        //   50%{transform:rotate(1deg) translateY(-5px)}
        // }

        .rcard{
          animation:
          slideUp .6s cubic-bezier(.34,1.56,.64,1) forwards,
          floatCard 6s ease-in-out infinite;
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

      <div
        className="rcard"
        style={{
          width: 420,
          background: "#E8F8F0",
          borderRadius: 4,
          padding: "44px 36px 36px",
          position: "relative",
          transform: "rotate(1deg)",
          boxShadow:
            "4px 6px 0 #A4D4B8,6px 10px 30px rgba(0,0,0,.18)",
          borderTop: "2px solid rgba(255,255,255,.8)",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3),transparent 70px)",
        }}
      >
        <div className="tape" />

        {/* Logo */}

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg,#8B5CF6,#A78BFA)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pencil size={17} color="#fff" strokeWidth={2.5} />
            </div>

            <span
              style={{
                fontFamily: "'Nunito',sans-serif",
                fontWeight: 900,
                fontSize: 22,
                color: "#2D1B69",
              }}
            >
              CollabBoard
            </span>
          </div>

          <p
            style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 17,
              color: "#2D6040",
              fontWeight: 600,
            }}
          >
            Create your account — it's free! 🚀
          </p>
        </div>

        {/* Inputs */}

        {[
          {
            label: "Full Name",
            value: name,
            set: setName,
            type: "text",
            id: "n",
            ph: "Name",
          },
          {
            label: "Email",
            value: email,
            set: setEmail,
            type: "email",
            id: "e",
            ph: "you@example.com",
          },
          {
            label: "Password",
            value: password,
            set: setPassword,
            type: showPass ? "text" : "password",
            id: "p",
            ph: "Min. 6 characters",
          },
        ].map((f) => (
          <div key={f.id} style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#2D6040",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {f.label}
            </label>

            <div style={{ position: "relative" }}>
              <input
                className="inp"
                type={f.type}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                onFocus={() => setFocused(f.id)}
                onBlur={() => setFocused("")}
                placeholder={f.ph}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleRegister()
                }
                style={{
                  border:
                    focused === f.id
                      ? "1.5px solid #16A34A"
                      : "1.5px solid rgba(0,0,0,.12)",
                  boxShadow:
                    focused === f.id
                      ? "0 0 0 3px rgba(34,197,94,.15)"
                      : "none",
                  color: "#0D3320",
                  paddingRight: f.id === "p" ? 40 : 13,
                }}
              />

              {f.id === "p" && (
                <button
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#4A8060",
                  }}
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Button */}

        <button
          className="btn"
          onClick={handleRegister}
          disabled={loading}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            border: "none",
            background:
              "linear-gradient(135deg,#16A34A,#22C55E)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 800,
            boxShadow: "0 4px 18px rgba(34,197,94,.38)",
            transition: "all .2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating account… 🚀" : "Create Account →"}
        </button>

        {/* Login Link */}

        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontFamily: "'Caveat',cursive",
            color: "#2D6040",
            fontSize: 16,
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#16A34A",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>

        {/* Bottom badges */}

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px dashed rgba(0,0,0,.1)",
            display: "flex",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {["🔒 Secure", "⚡ Fast", "🎨 Creative"].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(34,197,94,.12)",
                color: "#15803D",
                padding: "3px 9px",
                borderRadius: 20,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}