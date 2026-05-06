import { useEffect, useState, useCallback } from "react";
import { useNavigate }         from "react-router-dom";
import { useRoom }             from "../hooks/useRoom.js";
import { useAuth }             from "../hooks/useAuth.js";
import Navbar                  from "../components/common/Navbar.jsx";
import { Plus, LogIn as LogInIcon, Search, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

// Modular Components
import StatsBar         from "../components/dashboard/StatsBar.jsx";
import RoomCard         from "../components/dashboard/RoomCard.jsx";
import CreateRoomModal  from "../components/dashboard/CreateRoomModal.jsx";
import JoinRoomModal    from "../components/dashboard/JoinRoomModal.jsx";

export default function DashboardPage() {
  const { rooms, loading, fetchRooms, createRoom, joinRoom, deleteRoom } = useRoom();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin,   setShowJoin]   = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newPrivate, setNewPrivate]   = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [joinId,       setJoinId]       = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [menuOpen,   setMenuOpen]   = useState(null);
  const [starred,    setStarred]    = useState([]);
  const [creating,   setCreating]   = useState(false);
  const [joining,    setJoining]    = useState(false);

  useEffect(() => { 
    fetchRooms(); 
  }, [fetchRooms]);

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || r.isActive)
  );

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Please enter a board name"); return; }
    if (newPrivate && !roomPassword.trim()) { toast.error("Private rooms require a password"); return; }
    setCreating(true);
    const room = await createRoom(newName, newPrivate, roomPassword);
    setCreating(false);
    if (room) { 
      setShowCreate(false); 
      setNewName(""); 
      setRoomPassword("");
      navigate(`/room/${room.roomId}`); 
    }
  };

  const handleJoin = async () => {
    if (!joinId.trim()) { toast.error("Please enter a Room ID"); return; }
    setJoining(true);
    const room = await joinRoom(joinId.trim().toUpperCase(), joinPassword);
    setJoining(false);
    if (room) { 
      setShowJoin(false); 
      setJoinId(""); 
      setJoinPassword("");
      navigate(`/room/${room.roomId}`); 
    }
  };

  const copyRoomId = useCallback((roomId) => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  }, []);

  const toggleStar = useCallback((roomId) => {
    setStarred(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#F5F0EB", 
      backgroundImage: "radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)", 
      backgroundSize: "24px 24px", 
      fontFamily: "'DM Sans',sans-serif", 
      color: "#2D1B00" 
    }}>
      <style>{`
        @keyframes popIn{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tapeW{0%,100%{transform:translateX(-50%) rotate(-1deg)}50%{transform:translateX(-50%) rotate(1deg)}}
        .rcard{animation:popIn .5s both;}
        .rcard:hover{transform:translateY(-6px) scale(1.02) !important;}
        .stcard:hover{transform:translateY(-3px);}
        .btn-cr:hover{transform:translateY(-3px) rotate(.5deg);box-shadow:0 8px 28px rgba(139,92,246,.45) !important;}
        .btn-jo:hover{transform:translateY(-3px) rotate(-.5deg);box-shadow:0 8px 28px rgba(34,197,94,.35) !important;}
        .btn-nt:hover{transform:translateY(-3px) rotate(.5deg);box-shadow:0 8px 28px rgba(59,130,246,.35) !important;}
        .btn-as:hover{transform:translateY(-3px) rotate(-.5deg);box-shadow:0 8px 28px rgba(243,114,44,.35) !important;}
        .fchip{transition:all .15s;cursor:pointer;}.fchip:hover{transform:translateY(-1px);}
        .idash:focus{outline:none;border-color:#8B5CF6 !important;box-shadow:0 0 0 3px rgba(139,92,246,.15) !important;}
        .mcard{animation:slDown .3s cubic-bezier(.34,1.56,.64,1);}
        .tapst{position:absolute;top:-13px;left:50%;width:56px;height:20px;border-radius:4px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);animation:tapeW 3s ease-in-out infinite;}
        .mitem:hover{background:rgba(139,92,246,.08) !important;color:#8B5CF6 !important;}
        .starbtn:hover{transform:scale(1.3);}
      `}</style>

      <Navbar />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px 60px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 32, color: "#2D1B69", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontFamily: "'Caveat',cursive", fontSize: 18, color: "#7C6B3A", fontWeight: 600 }}>
            {rooms.length > 0 ? `You have ${rooms.filter(r=>r.isActive).length} active boards — let's build something great!` : "Create your first board and start collaborating!"}
          </p>
        </div>

        {/* Stats */}
        <StatsBar rooms={rooms} starredCount={starred.length} />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
          {[
            { label: "Create New Room",   bg: "#FDF5C4", sh: "#DDD09A", tc: "#5A3E00", cls: "btn-cr", icon: <Plus size={18} strokeWidth={2.5}/>,          fn: () => setShowCreate(true) },
            { label: "Join with Room ID", bg: "#D4F0E2", sh: "#A4D4B8", tc: "#145A30", cls: "btn-jo", icon: <LogInIcon size={18} strokeWidth={2.5}/>,     fn: () => setShowJoin(true) },
            { label: "Notes",             bg: "#D4E8FF", sh: "#A8C8EE", tc: "#0C3A6E", cls: "btn-nt", icon: <BookOpen size={18} strokeWidth={2.5}/>,       fn: () => navigate("/materials?tab=Note") },
            { label: "Assignments",       bg: "#FFE4E6", sh: "#FDA4AF", tc: "#881337", cls: "btn-as", icon: <BookOpen size={18} strokeWidth={2.5}/>,       fn: () => navigate("/materials?tab=Assignment") },
          ].map(b => (
            <button key={b.label} className={b.cls} onClick={b.fn} style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 26px", borderRadius: 4, background: b.bg, border: "none", cursor: "pointer", boxShadow: `3px 4px 0 ${b.sh}, 0 6px 20px rgba(0,0,0,.1)`, fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 15, color: b.tc, position: "relative", transition: "transform .18s,box-shadow .18s" }}>
              <div className="tapst" style={{ width: 44, height: 16 }}/>{b.icon}{b.label}
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A89060", pointerEvents: "none" }}/>
            <input className="idash" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search boards…"
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1.5px solid rgba(200,184,162,.7)", background: "rgba(255,252,240,.9)", fontSize: 13, fontWeight: 500, color: "#2D1B00", transition: "all .2s" }}/>
          </div>
          {[{ id: "all", label: "All Boards" }, { id: "active", label: "🟢 Active" }].map(f => (
            <button key={f.id} className="fchip" onClick={() => setFilter(f.id)} style={{ padding: "8px 16px", borderRadius: 20, border: filter === f.id ? "1.5px solid #8B5CF6" : "1.5px solid rgba(200,184,162,.7)", background: filter === f.id ? "#EDE9FE" : "rgba(255,252,240,.9)", color: filter === f.id ? "#6D3FCC" : "#7C6030", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s" }}>{f.label}</button>
          ))}
        </div>

        {/* Rooms grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Caveat',cursive", fontSize: 20, color: "#7C6B3A" }}>Loading your boards… ✏️</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {filtered.map((room, i) => (
              <RoomCard 
                key={room._id} 
                room={room} 
                index={i} 
                user={user}
                isStarred={starred.includes(room._id)}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                onCopyId={copyRoomId}
                onToggleStar={toggleStar}
                onDelete={deleteRoom}
              />
            ))}

            {/* Add new tile */}
            <div onClick={() => setShowCreate(true)} style={{ background: "rgba(255,252,240,.5)", borderRadius: 4, padding: "20px", border: "2px dashed rgba(200,184,162,.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: 280, transition: "all .2s", transform: "rotate(.5deg)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(237,233,254,.5)"; e.currentTarget.style.borderColor = "#8B5CF6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,252,240,.5)"; e.currentTarget.style.borderColor = "rgba(200,184,162,.8)"; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(139,92,246,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, border: "1.5px solid rgba(139,92,246,.15)" }}><Plus size={22} color="#8B5CF6" strokeWidth={2.5}/></div>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: 17, fontWeight: 700, color: "#7C6B3A" }}>New Board</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateRoomModal 
        isOpen={showCreate} 
        onClose={() => { setShowCreate(false); setRoomPassword(""); }} 
        onCreate={handleCreate}
        newName={newName}
        setNewName={setNewName}
        newPrivate={newPrivate}
        setNewPrivate={setNewPrivate}
        password={roomPassword}
        setPassword={setRoomPassword}
        loading={creating}
      />

      <JoinRoomModal 
        isOpen={showJoin} 
        onClose={() => { setShowJoin(false); setJoinPassword(""); }} 
        onJoin={handleJoin}
        joinId={joinId}
        setJoinId={setJoinId}
        password={joinPassword}
        setPassword={setJoinPassword}
        loading={joining}
      />
    </div>
  );
}