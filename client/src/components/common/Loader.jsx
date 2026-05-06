export default function Loader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F5F0EB",
      backgroundImage: "radial-gradient(circle, #C8B8A2 1.2px, transparent 1.2px)",
      backgroundSize: "24px 24px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          animation: "spin 1s linear infinite",
          boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
        }}>
          <span style={{ fontSize: 22 }}>✏️</span>
        </div>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "#7C6B3A", fontWeight: 600 }}>
          Loading CollabBoard…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}