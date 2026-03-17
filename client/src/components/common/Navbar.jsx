import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Pencil, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 36px", height: 58,
      background: "rgba(255,252,240,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(200,184,162,0.5)",
      boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div onClick={() => navigate("/dashboard")} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
        <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#8B5CF6,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 10px rgba(139,92,246,.35)" }}>
          <Pencil size={16} color="#fff" strokeWidth={2.5}/>
        </div>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:"#2D1B69", letterSpacing:"-0.5px" }}>CollabBoard</span>
      </div>

      {/* Right */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div onClick={() => navigate("/profile")} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#A78BFA)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:800 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#2D1B00", lineHeight:1.2 }}>{user?.name}</div>
            <div style={{ fontSize:11, color:"#A89060" }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ width:1, height:26, background:"rgba(200,184,162,.6)" }}/>
        <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, border:"1px solid rgba(200,184,162,.6)", background:"transparent", color:"#7C3030", cursor:"pointer", fontSize:13, fontWeight:700 }}
          onMouseEnter={e=>e.currentTarget.style.background="#FFF0F0"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <LogOut size={14} strokeWidth={2}/> Logout
        </button>
      </div>
    </nav>
  );
}