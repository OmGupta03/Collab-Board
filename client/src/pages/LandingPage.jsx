import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0EB",
        backgroundImage:
          "radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)",
        backgroundSize: "24px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans',sans-serif",
        gap: 24,
        padding: 32,
        textAlign: "center",
      }}
    >
      <style>{`
        @keyframes floatLogo {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .logoRow{
          display:flex;
          align-items:center;
          gap:14px;
          animation: floatLogo 4s ease-in-out infinite;
        }
      `}</style>

      {/* Logo + Title */}

      <div className="logoRow">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "linear-gradient(135deg,#8B5CF6,#A78BFA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 24px rgba(139,92,246,.4)",
          }}
        >
          <Pencil size={28} color="#fff" strokeWidth={2.5} />
        </div>

        <h1
          style={{
            fontFamily: "'Nunito',sans-serif",
            fontWeight: 900,
            fontSize: 48,
            color: "#2D1B69",
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}
        >
          CollabBoard
        </h1>
      </div>

      {/* Subtitle */}

      <p
        style={{
          fontFamily: "'Caveat',cursive",
          fontSize: 22,
          color: "#7C6B3A",
          fontWeight: 600,
          maxWidth: 480,
        }}
      >
        Real-time collaborative whiteboard — draw, brainstorm, and build
        together 🎨
      </p>

      {/* Buttons */}

      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "14px 32px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#8B5CF6,#A78BFA)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 800,
            boxShadow: "0 4px 20px rgba(139,92,246,.4)",
            transition: "transform .2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "none")
          }
        >
          Get Started Free →
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "14px 32px",
            borderRadius: 12,
            border: "1.5px solid rgba(139,92,246,.3)",
            background: "rgba(255,255,255,.8)",
            color: "#8B5CF6",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 800,
            transition: "transform .2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "none")
          }
        >
          Sign In
        </button>
      </div>
    </div>
  );
}