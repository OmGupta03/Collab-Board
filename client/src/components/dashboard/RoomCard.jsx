// import { Users, Clock, LogIn, Trash2, Crown } from "lucide-react";

// const BORDER = "#EAE4DC", TSUB = "#9A8F82", TMAIN = "#1E1A14";

// function timeAgo(dateStr) {
//   const diff = Date.now() - new Date(dateStr).getTime();
//   const mins  = Math.floor(diff / 60000);
//   const hours = Math.floor(diff / 3600000);
//   const days  = Math.floor(diff / 86400000);
//   if (mins  < 1)  return "Just now";
//   if (mins  < 60) return `${mins}m ago`;
//   if (hours < 24) return `${hours}h ago`;
//   return `${days}d ago`;
// }

// const CARD_COLORS = ["#8B5CF6","#F97316","#06B6D4","#22C55E","#EC4899","#EAB308"];
// const cardColor = (name) => {
//   let hash = 0;
//   for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
// };

// export default function RoomCard({ room, user, onEnter, onDelete }) {
//   const isHost  = room.hostId?._id === user?._id || room.hostId === user?._id;
//   const accent  = cardColor(room.name);
//   const initial = (room.name || "R")[0].toUpperCase();

//   return (
//     <div
//       style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.05)", transition: "box-shadow .2s, transform .2s", cursor: "default" }}
//       onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
//       onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
//     >
//       {/* Colour strip + initial */}
//       <div style={{ height: 72, background: `linear-gradient(135deg,${accent}22,${accent}11)`, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 14, position: "relative" }}>
//         <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${accent},${accent}CC)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "'Nunito',sans-serif", boxShadow: `0 4px 12px ${accent}44`, flexShrink: 0 }}>
//           {initial}
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ fontSize: 15, fontWeight: 800, color: TMAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Nunito',sans-serif" }}>{room.name}</div>
//           <div style={{ fontSize: 11, color: TSUB, fontWeight: 600, marginTop: 1, fontFamily: "'DM Sans',sans-serif" }}>ID: {room.roomId}</div>
//         </div>
//         {isHost && (
//           <div style={{ position: "absolute", top: 10, right: 12, background: "#FFF8E1", border: "1px solid #FDE68A", color: "#D97706", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
//             <Crown size={9} strokeWidth={2.5} /> Host
//           </div>
//         )}
//       </div>

//       {/* Body */}
//       <div style={{ padding: "14px 18px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: TSUB, fontWeight: 600 }}>
//             <Users size={13} strokeWidth={2} />
//             <span>{room.participants?.length || 1} member{(room.participants?.length || 1) !== 1 ? "s" : ""}</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: TSUB, fontWeight: 600 }}>
//             <Clock size={13} strokeWidth={2} />
//             <span>{timeAgo(room.updatedAt || room.createdAt)}</span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div style={{ display: "flex", gap: 8 }}>
//           <button
//             onClick={() => onEnter(room.roomId)}
//             style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${accent},${accent}CC)`, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", boxShadow: `0 2px 10px ${accent}33`, transition: "box-shadow .2s" }}
//             onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 18px ${accent}55`}
//             onMouseLeave={e => e.currentTarget.style.boxShadow = `0 2px 10px ${accent}33`}
//           >
//             <LogIn size={14} strokeWidth={2.5} /> Enter
//           </button>
//           {isHost && (
//             <button
//               onClick={() => onDelete(room._id)}
//               style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #FECACA", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
//               onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; }}
//               onMouseLeave={e => { e.currentTarget.style.background = "#FFF5F5"; }}
//               title="Delete room"
//             >
//               <Trash2 size={14} strokeWidth={2} />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }