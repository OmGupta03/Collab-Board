// import { useState, useEffect } from "react";
// import { Pencil, Plus, LogIn, LogOut, Search, RefreshCw, Users } from "lucide-react";
// import toast from "react-hot-toast";

// import { roomService } from "../../services/roomService.js";
// import StatsBar       from "./StatsBar.jsx";
// import RoomCard       from "./RoomCard.jsx";
// import CreateRoomModal from "./CreateRoomModal.jsx";
// import JoinRoomModal   from "./JoinRoomModal.jsx";

// const BG = "#FAFAF8", BORDER = "#EAE4DC", TSUB = "#9A8F82", TMAIN = "#1E1A14";

// export default function Dashboard({ user, onEnterRoom, onLogout }) {
//   const [rooms,        setRooms]       = useState([]);
//   const [loading,      setLoading]     = useState(true);
//   const [search,       setSearch]      = useState("");
//   const [showCreate,   setShowCreate]  = useState(false);
//   const [showJoin,     setShowJoin]    = useState(false);
//   const [createLoading,setCreateLoad] = useState(false);
//   const [joinLoading,  setJoinLoad]   = useState(false);

//   /* ── Load rooms on mount ──────────────────────────────── */
//   useEffect(() => { fetchRooms(); }, []);

//   const fetchRooms = async () => {
//     setLoading(true);
//     try {
//       const data = await roomService.getUserRooms();
//       setRooms(Array.isArray(data) ? data : []);
//     } catch {
//       toast.error("Could not load your rooms");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ── Create room ──────────────────────────────────────── */
//   const handleCreate = async (name) => {
//     setCreateLoad(true);
//     try {
//       const room = await roomService.createRoom({ name });
//       setRooms(prev => [room, ...prev]);
//       setShowCreate(false);
//       toast.success(`"${name}" created!`);
//     } catch {
//       toast.error("Failed to create room");
//     } finally {
//       setCreateLoad(false);
//     }
//   };

//   /* ── Join room ────────────────────────────────────────── */
//   const handleJoin = async (roomId) => {
//     setJoinLoad(true);
//     try {
//       await roomService.joinRoom(roomId);
//       setShowJoin(false);
//       toast.success("Joined room!");
//       onEnterRoom(roomId);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Room not found");
//     } finally {
//       setJoinLoad(false);
//     }
//   };

//   /* ── Delete room ──────────────────────────────────────── */
//   const handleDelete = async (roomMongoId) => {
//     if (!window.confirm("Delete this room? This cannot be undone.")) return;
//     try {
//       await roomService.deleteRoom(roomMongoId);
//       setRooms(prev => prev.filter(r => r._id !== roomMongoId));
//       toast.success("Room deleted");
//     } catch {
//       toast.error("Failed to delete room");
//     }
//   };

//   /* ── Filtered rooms ───────────────────────────────────── */
//   const filtered = rooms.filter(r =>
//     r.name?.toLowerCase().includes(search.toLowerCase()) ||
//     r.roomId?.toLowerCase().includes(search.toLowerCase())
//   );

//   /* ── Greeting ─────────────────────────────────────────── */
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

//   return (
//     <div style={{ minHeight: "100vh", background: BG, fontFamily: "'DM Sans',sans-serif", color: TMAIN }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Nunito:wght@800;900&family=Caveat:wght@600;700&display=swap');
//         *{box-sizing:border-box;margin:0;padding:0;}
//         ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#D4C4A8;border-radius:4px;}
//         @keyframes popUp{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
//         @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
//         .room-grid > *{animation:fadeIn .3s ease forwards;}
//       `}</style>

//       {/* ── NAVBAR ────────────────────────────────────────── */}
//       <nav style={{ height: 58, background: "#fff", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", boxShadow: "0 1px 8px rgba(0,0,0,.04)", position: "sticky", top: 0, zIndex: 50 }}>
//         {/* Logo */}
//         <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//           <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(139,92,246,.3)" }}>
//             <Pencil size={15} color="#fff" strokeWidth={2.5} />
//           </div>
//           <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: "#2D1B69", letterSpacing: "-0.3px" }}>CollabBoard</span>
//         </div>

//         {/* Right: user info + logout */}
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           {user?.avatar ? (
//             <img src={user.avatar} alt={user.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `2px solid ${BORDER}` }} />
//           ) : (
//             <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
//               {user?.name?.[0]?.toUpperCase()}
//             </div>
//           )}
//           <div style={{ lineHeight: 1.2 }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: TMAIN }}>{user?.name}</div>
//             <div style={{ fontSize: 11, color: TSUB }}>{user?.email}</div>
//           </div>
//           <button
//             onClick={onLogout}
//             style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 10, border: "1px solid #FECACA", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "background .15s", marginLeft: 4 }}
//             onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
//             onMouseLeave={e => e.currentTarget.style.background = "#FFF5F5"}
//           >
//             <LogOut size={13} strokeWidth={2} /> Logout
//           </button>
//         </div>
//       </nav>

//       {/* ── MAIN CONTENT ──────────────────────────────────── */}
//       <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px" }}>

//         {/* Hero greeting */}
//         <div style={{ marginBottom: 28 }}>
//           <h1 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 26, color: TMAIN, marginBottom: 4 }}>
//             {greeting}, {user?.name?.split(" ")[0]} 👋
//           </h1>
//           <p style={{ fontSize: 14, color: TSUB, fontWeight: 500 }}>
//             You have <strong style={{ color: TMAIN }}>{rooms.length}</strong> room{rooms.length !== 1 ? "s" : ""} — pick up where you left off.
//           </p>
//         </div>

//         {/* Stats */}
//         <StatsBar rooms={rooms} user={user} />

//         {/* Toolbar row */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
//           {/* Search */}
//           <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
//             <Search size={15} strokeWidth={2} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: TSUB, pointerEvents: "none" }} />
//             <input
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search rooms…"
//               style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 11, border: `1.5px solid ${BORDER}`, background: "#fff", fontSize: 13, color: TMAIN, outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color .2s" }}
//               onFocus={e => e.target.style.borderColor = "#8B5CF6"}
//               onBlur={e => e.target.style.borderColor = BORDER}
//             />
//           </div>

//           <div style={{ display: "flex", gap: 9 }}>
//             {/* Refresh */}
//             <button
//               onClick={fetchRooms}
//               title="Refresh"
//               style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", color: TSUB, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
//               onMouseEnter={e => { e.currentTarget.style.background = "#F5F2FF"; e.currentTarget.style.color = "#8B5CF6"; e.currentTarget.style.borderColor = "#C4B5FD"; }}
//               onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = TSUB; e.currentTarget.style.borderColor = BORDER; }}
//             >
//               <RefreshCw size={15} strokeWidth={2} />
//             </button>

//             {/* Join */}
//             <button
//               onClick={() => setShowJoin(true)}
//               style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11, border: `1.5px solid #BAE6FD`, background: "#F0FAFE", color: "#0369A1", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all .15s" }}
//               onMouseEnter={e => e.currentTarget.style.background = "#E0F2FE"}
//               onMouseLeave={e => e.currentTarget.style.background = "#F0FAFE"}
//             >
//               <LogIn size={14} strokeWidth={2.5} /> Join Room
//             </button>

//             {/* Create */}
//             <button
//               onClick={() => setShowCreate(true)}
//               style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 3px 14px rgba(139,92,246,.3)", transition: "box-shadow .2s" }}
//               onMouseEnter={e => e.currentTarget.style.boxShadow = "0 5px 20px rgba(139,92,246,.45)"}
//               onMouseLeave={e => e.currentTarget.style.boxShadow = "0 3px 14px rgba(139,92,246,.3)"}
//             >
//               <Plus size={15} strokeWidth={2.5} /> Create Room
//             </button>
//           </div>
//         </div>

//         {/* ── ROOM GRID ──────────────────────────────────── */}
//         {loading ? (
//           /* Skeleton loader */
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 18 }}>
//             {[1,2,3,4,5,6].map(i => (
//               <div key={i} style={{ height: 170, borderRadius: 16, background: "#f0ebe3", animation: "pulse 1.4s ease infinite", opacity: 0.6 }} />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           /* Empty state */
//           <div style={{ textAlign: "center", padding: "64px 0" }}>
//             <div style={{ width: 72, height: 72, borderRadius: 20, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
//               <Users size={32} color="#8B5CF6" strokeWidth={1.5} />
//             </div>
//             <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: TMAIN, marginBottom: 8 }}>
//               {search ? "No rooms found" : "No rooms yet"}
//             </h3>
//             <p style={{ fontSize: 14, color: TSUB, marginBottom: 22 }}>
//               {search ? `No rooms match "${search}"` : "Create your first room or join one with a Room ID"}
//             </p>
//             {!search && (
//               <button
//                 onClick={() => setShowCreate(true)}
//                 style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 3px 14px rgba(139,92,246,.3)" }}
//               >
//                 <Plus size={15} strokeWidth={2.5} /> Create your first room
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="room-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 18 }}>
//             {filtered.map(room => (
//               <RoomCard
//                 key={room._id}
//                 room={room}
//                 user={user}
//                 onEnter={onEnterRoom}
//                 onDelete={handleDelete}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── MODALS ────────────────────────────────────────── */}
//       {showCreate && (
//         <CreateRoomModal
//           onClose={() => setShowCreate(false)}
//           onCreate={handleCreate}
//           loading={createLoading}
//         />
//       )}
//       {showJoin && (
//         <JoinRoomModal
//           onClose={() => setShowJoin(false)}
//           onJoin={handleJoin}
//           loading={joinLoading}
//         />
//       )}
//     </div>
//   );
// }