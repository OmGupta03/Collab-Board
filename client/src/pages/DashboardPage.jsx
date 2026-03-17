import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useRoom }             from "../hooks/useRoom.js";
import { useAuth }             from "../context/AuthContext.jsx";
import Navbar                  from "../components/common/Navbar.jsx";
import { formatDate }          from "../utils/formatters.js";
import {
  Plus, LogIn as LogInIcon, Search, Clock, Users, Star,
  MoreHorizontal, Trash2, Copy, ExternalLink, X,
  Zap, Lock, Globe, ChevronRight, Layers, TrendingUp, BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { rooms, loading, fetchRooms, createRoom, joinRoom, deleteRoom } = useRoom();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin,   setShowJoin]   = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newPrivate, setNewPrivate] = useState(false);
  const [joinId,     setJoinId]     = useState("");
  const [menuOpen,   setMenuOpen]   = useState(null);
  const [starred,    setStarred]    = useState([]);
  const [creating,   setCreating]   = useState(false);
  const [joining,    setJoining]    = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || r.isActive)
  );

  const CARD_COLORS = ["#FDF5C4","#D4E8FF","#D4F0E2","#FAE0CC","#EDE0FF","#E8F5CC"];
  const CARD_SHADOWS = ["#DDD09A","#A8C8EE","#A4D4B8","#E4BCA0","#C8B0EE","#C4D8A0"];

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Please enter a board name"); return; }
    setCreating(true);
    const room = await createRoom(newName, newPrivate);
    setCreating(false);
    if (room) { setShowCreate(false); setNewName(""); navigate(`/room/${room.roomId}`); }
  };

  const handleJoin = async () => {
    if (!joinId.trim()) { toast.error("Please enter a Room ID"); return; }
    setJoining(true);
    const room = await joinRoom(joinId.trim().toUpperCase());
    setJoining(false);
    if (room) { setShowJoin(false); setJoinId(""); navigate(`/room/${room.roomId}`); }
  };

  const copyRoomId = (roomId) => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  const STATS = [
    { icon:<Layers size={18} strokeWidth={2}/>,     label:"Total Boards",  value:rooms.length,                               color:"#8B5CF6", bg:"#EDE9FE" },
    { icon:<Users size={18} strokeWidth={2}/>,      label:"Collaborators", value:rooms.reduce((a,r)=>a+(r.participants?.length||0),0), color:"#EC4899", bg:"#FDF2F8" },
    { icon:<TrendingUp size={18} strokeWidth={2}/>, label:"Active Today",  value:rooms.filter(r=>r.isActive).length,          color:"#22C55E", bg:"#F0FDF4" },
    { icon:<Star size={18} strokeWidth={2}/>,       label:"Starred",       value:starred.length,                              color:"#F59E0B", bg:"#FFFBEB" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0EB", backgroundImage:"radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)", backgroundSize:"24px 24px", fontFamily:"'DM Sans',sans-serif", color:"#2D1B00" }}>
      <style>{`
        @keyframes popIn{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tapeW{0%,100%{transform:translateX(-50%) rotate(-1deg)}50%{transform:translateX(-50%) rotate(1deg)}}
        .rcard{transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s;cursor:pointer;animation:popIn .5s both;}
        .rcard:hover{transform:translateY(-6px) scale(1.02) !important;}
        .stcard{transition:transform .2s;animation:popIn .4s ease both;}.stcard:hover{transform:translateY(-3px);}
        .btn-cr:hover{transform:translateY(-3px) rotate(.5deg);box-shadow:0 8px 28px rgba(139,92,246,.45) !important;}
        .btn-jo:hover{transform:translateY(-3px) rotate(-.5deg);box-shadow:0 8px 28px rgba(34,197,94,.35) !important;}
        .fchip{transition:all .15s;cursor:pointer;}.fchip:hover{transform:translateY(-1px);}
        .idash:focus{outline:none;border-color:#8B5CF6 !important;box-shadow:0 0 0 3px rgba(139,92,246,.15) !important;}
        .mover{position:fixed;inset:0;background:rgba(80,50,10,.25);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:200;}
        .mcard{animation:slDown .3s cubic-bezier(.34,1.56,.64,1);}
        .tapst{position:absolute;top:-13px;left:50%;width:56px;height:20px;border-radius:4px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);animation:tapeW 3s ease-in-out infinite;}
        .mitem:hover{background:rgba(139,92,246,.08) !important;color:#8B5CF6 !important;}
        .starbtn:hover{transform:scale(1.3);}
      `}</style>

      <Navbar />

      <div style={{ maxWidth:1160, margin:"0 auto", padding:"36px 24px 60px" }}>
        {/* Greeting */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:32,color:"#2D1B69",letterSpacing:"-0.5px",marginBottom:4 }}>
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontFamily:"'Caveat',cursive",fontSize:18,color:"#7C6B3A",fontWeight:600 }}>
            {rooms.length > 0 ? `You have ${rooms.filter(r=>r.isActive).length} active boards — let's build something great!` : "Create your first board and start collaborating!"}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:36 }}>
          {STATS.map((s,i) => (
            <div key={i} className="stcard" style={{ background:s.bg,border:`1.5px solid ${s.color}30`,borderRadius:16,padding:"16px 20px",boxShadow:`0 3px 14px ${s.color}18`,animationDelay:`${i*.07}s`,display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:42,height:42,borderRadius:12,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:s.color,flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:24,fontWeight:900,color:s.color,lineHeight:1,fontFamily:"'Nunito',sans-serif" }}>{s.value}</div>
                <div style={{ fontSize:12,fontWeight:600,color:"#7C6030",marginTop:2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex",gap:14,marginBottom:32,flexWrap:"wrap" }}>
          {[
            { label:"Create New Room",   bg:"#FDF5C4",sh:"#DDD09A",tc:"#5A3E00",cls:"btn-cr",icon:<Plus size={18} strokeWidth={2.5}/>,          fn:()=>setShowCreate(true) },
            { label:"Join with Room ID", bg:"#D4F0E2",sh:"#A4D4B8",tc:"#145A30",cls:"btn-jo",icon:<LogInIcon size={18} strokeWidth={2.5}/>,     fn:()=>setShowJoin(true) },
            { label:"Browse Templates",  bg:"#D4E8FF",sh:"#A8C8EE",tc:"#0C3A6E",cls:"",       icon:<BookOpen size={18} strokeWidth={2.5}/>,       fn:()=>{} },
          ].map(b => (
            <button key={b.label} className={b.cls} onClick={b.fn} style={{ display:"flex",alignItems:"center",gap:10,padding:"14px 26px",borderRadius:4,background:b.bg,border:"none",cursor:"pointer",boxShadow:`3px 4px 0 ${b.sh},0 6px 20px rgba(0,0,0,.1)`,fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:15,color:b.tc,position:"relative",transition:"transform .18s,box-shadow .18s" }}>
              <div className="tapst" style={{ width:44,height:16 }}/>{b.icon}{b.label}
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28,flexWrap:"wrap" }}>
          <div style={{ position:"relative",flex:1,minWidth:220 }}>
            <Search size={15} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#A89060",pointerEvents:"none" }}/>
            <input className="idash" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search boards…"
              style={{ width:"100%",padding:"10px 12px 10px 36px",borderRadius:10,border:"1.5px solid rgba(200,184,162,.7)",background:"rgba(255,252,240,.9)",fontSize:13,fontWeight:500,color:"#2D1B00",transition:"all .2s" }}/>
          </div>
          {[{id:"all",label:"All Boards"},{id:"active",label:"🟢 Active"}].map(f => (
            <button key={f.id} className="fchip" onClick={()=>setFilter(f.id)} style={{ padding:"8px 16px",borderRadius:20,border:filter===f.id?"1.5px solid #8B5CF6":"1.5px solid rgba(200,184,162,.7)",background:filter===f.id?"#EDE9FE":"rgba(255,252,240,.9)",color:filter===f.id?"#6D3FCC":"#7C6030",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .15s" }}>{f.label}</button>
          ))}
        </div>

        {/* Rooms grid */}
        {loading ? (
          <div style={{ textAlign:"center",padding:"60px 0",fontFamily:"'Caveat',cursive",fontSize:20,color:"#7C6B3A" }}>Loading your boards… ✏️</div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20 }}>
            {filtered.map((room, i) => {
              const cardColor  = CARD_COLORS[i % CARD_COLORS.length];
              const cardShadow = CARD_SHADOWS[i % CARD_SHADOWS.length];
              const isHost     = room.hostId?._id === user?._id || room.hostId === user?._id;
              return (
                <div key={room._id} className="rcard" style={{ background:cardColor,borderRadius:4,padding:"20px 20px 16px",position:"relative",boxShadow:`3px 5px 0 ${cardShadow},0 8px 28px rgba(0,0,0,.1)`,transform:`rotate(${(i%3===0)?-1:(i%3===1)?.5:-.8}deg)`,animationDelay:`${i*.08}s`,backgroundImage:"linear-gradient(rgba(255,255,255,.3) 0,rgba(255,255,255,0) 60px)" }}>
                  <div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",width:52,height:18,borderRadius:4,background:"rgba(255,255,255,.55)",border:"1px solid rgba(255,255,255,.8)" }}/>

                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:room.isActive?"#22C55E":"#CBD5E1",boxShadow:room.isActive?"0 0 6px #22C55E":undefined }}/>
                      <span style={{ fontSize:11,fontWeight:700,color:room.isActive?"#15803D":"#94A3B8",textTransform:"uppercase",letterSpacing:"0.5px" }}>{room.isActive?"Live":"Offline"}</span>
                    </div>
                    <div style={{ position:"relative" }}>
                      <button onClick={e=>{e.stopPropagation();setMenuOpen(menuOpen===room._id?null:room._id);}} style={{ width:28,height:28,borderRadius:8,border:"1px solid rgba(0,0,0,.1)",background:"rgba(255,255,255,.5)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#5A4000" }}>
                        <MoreHorizontal size={14} strokeWidth={2}/>
                      </button>
                      {menuOpen===room._id&&(
                        <div style={{ position:"absolute",right:0,top:34,background:"#FFFDE7",border:"1px solid rgba(200,184,162,.6)",borderRadius:12,boxShadow:"0 8px 28px rgba(0,0,0,.12)",zIndex:50,width:160,overflow:"hidden" }}>
                          {[
                            {icon:<ExternalLink size={13}/>,label:"Open board",  fn:()=>{setMenuOpen(null);navigate(`/room/${room.roomId}`);}},
                            {icon:<Copy size={13}/>,        label:"Copy Room ID",fn:()=>{setMenuOpen(null);copyRoomId(room.roomId);}},
                            {icon:<Star size={13}/>,        label:"Star board",  fn:()=>{setMenuOpen(null);setStarred(s=>s.includes(room._id)?s.filter(x=>x!==room._id):[...s,room._id]);}},
                            ...(isHost?[{icon:<Trash2 size={13}/>,label:"Delete",danger:true,fn:()=>{setMenuOpen(null);deleteRoom(room.roomId);}}]:[]),
                          ].map(m => (
                            <div key={m.label} className="mitem" onClick={m.fn} style={{ padding:"9px 14px",display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,color:m.danger?"#EF4444":"#2D1B00",cursor:"pointer",transition:"all .1s" }}>{m.icon}{m.label}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontFamily:"'Caveat',cursive",fontSize:20,fontWeight:700,color:"#2D1B00",marginBottom:8,lineHeight:1.25 }}>{room.name}</h3>

                  <div style={{ display:"flex",gap:5,marginBottom:14,flexWrap:"wrap" }}>
                    <span style={{ fontSize:10,fontWeight:800,background:isHost?"rgba(139,92,246,.15)":"rgba(0,0,0,.06)",color:isHost?"#6D3FCC":"#5A3E00",padding:"2px 8px",borderRadius:20,textTransform:"uppercase",letterSpacing:"0.3px" }}>{isHost?"Host":"Member"}</span>
                    <span style={{ fontSize:10,fontWeight:800,background:"rgba(255,255,255,.55)",color:"#5A3E00",padding:"2px 8px",borderRadius:20,border:"1px solid rgba(0,0,0,.08)",textTransform:"uppercase" }}>
                      {room.settings?.isPrivate?"🔒 Private":"🌐 Public"}
                    </span>
                  </div>

                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px dashed rgba(0,0,0,.1)" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#7C6030",fontWeight:600 }}>
                      <Users size={13} strokeWidth={2}/>
                      <span>{room.participants?.length || 0} member{(room.participants?.length||0)!==1?"s":""}</span>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#A89060" }}>
                      <Clock size={12} strokeWidth={2}/>{formatDate(room.updatedAt)}
                    </div>
                  </div>

                  <button onClick={()=>navigate(`/room/${room.roomId}`)} style={{ marginTop:12,width:"100%",padding:"9px",borderRadius:10,border:"1.5px solid rgba(0,0,0,.12)",background:"rgba(255,255,255,.65)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:13,color:"#2D1B69",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.9)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.65)"}>
                    Open Board <ChevronRight size={14} strokeWidth={2.5}/>
                  </button>

                  <button className="starbtn" onClick={e=>{e.stopPropagation();setStarred(s=>s.includes(room._id)?s.filter(x=>x!==room._id):[...s,room._id]);}} style={{ position:"absolute",top:20,right:44,background:"none",border:"none",cursor:"pointer",padding:0,transition:"transform .2s",fontSize:16 }}>
                    {starred.includes(room._id)?"⭐":"☆"}
                  </button>
                </div>
              );
            })}

            {/* Add new tile */}
            <div onClick={()=>setShowCreate(true)} style={{ background:"rgba(255,252,240,.5)",borderRadius:4,padding:"20px",border:"2px dashed rgba(200,184,162,.8)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",minHeight:280,transition:"all .2s",transform:"rotate(.5deg)" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(237,233,254,.5)";e.currentTarget.style.borderColor="#8B5CF6";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,252,240,.5)";e.currentTarget.style.borderColor="rgba(200,184,162,.8)";}}>
              <div style={{ width:48,height:48,borderRadius:14,background:"rgba(139,92,246,.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,border:"1.5px solid rgba(139,92,246,.15)" }}><Plus size={22} color="#8B5CF6" strokeWidth={2.5}/></div>
              <span style={{ fontFamily:"'Caveat',cursive",fontSize:17,fontWeight:700,color:"#7C6B3A" }}>New Board</span>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate&&(
        <div className="mover" onClick={()=>setShowCreate(false)}>
          <div className="mcard" onClick={e=>e.stopPropagation()} style={{ background:"#FEFAE8",borderRadius:4,padding:"40px 36px 32px",width:420,position:"relative",boxShadow:"4px 6px 0 #DDD09A,0 16px 48px rgba(0,0,0,.14)" }}>
            <div style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",width:60,height:20,borderRadius:4,background:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.9)" }}/>
            <button onClick={()=>setShowCreate(false)} style={{ position:"absolute",top:16,right:16,background:"rgba(0,0,0,.07)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#7C6030" }}><X size={14} strokeWidth={2.5}/></button>
            <h2 style={{ fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:26,color:"#2D1B00",marginBottom:6 }}>📌 Create a New Board</h2>
            <p style={{ fontSize:13,color:"#A89060",fontWeight:500,marginBottom:24 }}>Give it a name and invite your team instantly</p>
            <label style={{ fontSize:12,fontWeight:700,color:"#7C6030",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6,display:"block" }}>Board Name</label>
            <input className="idash" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCreate()} placeholder="e.g. Product Launch Sprint"
              style={{ width:"100%",padding:"11px 13px",borderRadius:10,marginBottom:16,border:"1.5px solid rgba(0,0,0,.12)",background:"rgba(255,255,255,.7)",fontSize:14,fontWeight:500,color:"#2D1B00" }}/>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(255,255,255,.5)",borderRadius:10,marginBottom:24,border:"1.5px solid rgba(0,0,0,.08)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                {newPrivate?<Lock size={15} color="#8B5CF6" strokeWidth={2}/>:<Globe size={15} color="#22C55E" strokeWidth={2}/>}
                <span style={{ fontSize:13,fontWeight:700,color:"#2D1B00" }}>{newPrivate?"Private Room":"Public Room"}</span>
              </div>
              <div onClick={()=>setNewPrivate(p=>!p)} style={{ width:40,height:22,borderRadius:100,background:newPrivate?"#8B5CF6":"#22C55E",position:"relative",cursor:"pointer",transition:"background .2s" }}>
                <div style={{ position:"absolute",top:3,left:newPrivate?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
              </div>
            </div>
            <button onClick={handleCreate} disabled={creating} style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#8B5CF6,#A78BFA)",color:"#fff",cursor:"pointer",fontSize:15,fontWeight:800,boxShadow:"0 4px 18px rgba(139,92,246,.38)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:creating?0.7:1 }}>
              <Zap size={16} strokeWidth={2.5}/> {creating?"Creating…":"Create & Open Board →"}
            </button>
          </div>
        </div>
      )}

      {/* Join modal */}
      {showJoin&&(
        <div className="mover" onClick={()=>setShowJoin(false)}>
          <div className="mcard" onClick={e=>e.stopPropagation()} style={{ background:"#E8F8F0",borderRadius:4,padding:"40px 36px 32px",width:400,position:"relative",boxShadow:"4px 6px 0 #A4D4B8,0 16px 48px rgba(0,0,0,.12)" }}>
            <div style={{ position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",width:60,height:20,borderRadius:4,background:"rgba(255,255,255,.6)",border:"1px solid rgba(255,255,255,.9)" }}/>
            <button onClick={()=>setShowJoin(false)} style={{ position:"absolute",top:16,right:16,background:"rgba(0,0,0,.07)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#145A30" }}><X size={14} strokeWidth={2.5}/></button>
            <h2 style={{ fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:26,color:"#0D3320",marginBottom:6 }}>🔗 Join a Board</h2>
            <p style={{ fontSize:13,color:"#4A8060",fontWeight:500,marginBottom:24 }}>Paste the Room ID shared by the host</p>
            <label style={{ fontSize:12,fontWeight:700,color:"#2D6040",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6,display:"block" }}>Room ID</label>
            <input className="idash" value={joinId} onChange={e=>setJoinId(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&handleJoin()} placeholder="CB-XXXXX"
              style={{ width:"100%",padding:"13px 14px",borderRadius:10,marginBottom:24,border:"1.5px solid rgba(0,0,0,.12)",background:"rgba(255,255,255,.7)",fontSize:20,fontWeight:800,color:"#0D3320",letterSpacing:"4px",textAlign:"center",fontFamily:"'Nunito',sans-serif" }}/>
            <button onClick={handleJoin} disabled={joining} style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#16A34A,#22C55E)",color:"#fff",cursor:"pointer",fontSize:15,fontWeight:800,boxShadow:"0 4px 18px rgba(34,197,94,.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:joining?0.7:1 }}>
              <LogInIcon size={16} strokeWidth={2.5}/> {joining?"Joining…":"Join Board →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}