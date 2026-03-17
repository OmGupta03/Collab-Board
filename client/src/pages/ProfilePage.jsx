import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
import { useAuth }      from "../context/AuthContext.jsx";
import Navbar           from "../components/common/Navbar.jsx";
import { User, Save }   from "lucide-react";
import toast            from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate             = useNavigate();
  const [name,    setName]   = useState(user?.name    || "");
  const [focused, setFocused]= useState("");

  const handleSave = () => {
    updateUser({ ...user, name });
    toast.success("Profile updated!");
  };

  return (
    <div style={{ minHeight:"100vh",background:"#F5F0EB",backgroundImage:"radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)",backgroundSize:"24px 24px",fontFamily:"'DM Sans',sans-serif" }}>
      <Navbar/>
      <div style={{ maxWidth:600,margin:"48px auto",padding:"0 24px" }}>
        <div style={{ background:"#FFFDE7",borderRadius:4,padding:"40px 36px",boxShadow:"4px 6px 0 #DDD09A,0 16px 48px rgba(0,0,0,.1)",position:"relative",borderTop:"2px solid rgba(255,255,255,.8)" }}>
          <div style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",width:60,height:20,borderRadius:4,background:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.9)" }}/>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:32 }}>
            <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#8B5CF6,#A78BFA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#fff",fontWeight:800,boxShadow:"0 4px 16px rgba(139,92,246,.35)" }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:24,color:"#2D1B69" }}>{user?.name}</h2>
              <p style={{ fontSize:13,color:"#A89060",fontWeight:500 }}>{user?.email}</p>
            </div>
          </div>

          <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#7C6030",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px" }}>Display Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} onFocus={()=>setFocused("n")} onBlur={()=>setFocused("")}
            style={{ width:"100%",padding:"11px 13px",borderRadius:10,marginBottom:24,border:focused==="n"?"1.5px solid #8B5CF6":"1.5px solid rgba(0,0,0,.12)",boxShadow:focused==="n"?"0 0 0 3px rgba(139,92,246,.15)":"none",background:"rgba(255,255,255,.7)",fontSize:14,fontWeight:500,color:"#2D1B69",transition:"all .2s",outline:"none" }}/>

          <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#7C6030",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px" }}>Email</label>
          <input value={user?.email} disabled
            style={{ width:"100%",padding:"11px 13px",borderRadius:10,marginBottom:24,border:"1.5px solid rgba(0,0,0,.08)",background:"rgba(0,0,0,.04)",fontSize:14,fontWeight:500,color:"#A89060",outline:"none" }}/>

          <button onClick={handleSave} style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#8B5CF6,#A78BFA)",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:800,boxShadow:"0 4px 18px rgba(139,92,246,.38)" }}>
            <Save size={16} strokeWidth={2.5}/> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}