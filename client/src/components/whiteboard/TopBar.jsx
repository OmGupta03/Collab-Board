// import { Pencil, Undo2, Redo2, Wand2, Share2, LogOut } from "lucide-react";
// import { BORDER, TSUB, WB_PANEL } from "../../constants/whiteboard.js";

// export default function TopBar({
//   roomId, onLeave, onUndo, onRedo,
//   shapeSnap, onToggleSnap, snapStatus, snapError,
//   onCopyRoomId,
// }) {
//   return (
//     <div style={{ height: 54, display: "flex", alignItems: "center", padding: "0 14px", gap: 4, flexShrink: 0, background: WB_PANEL, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 8px rgba(0,0,0,.04)", zIndex: 30 }}>

//       {/* Logo */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 10, cursor: "pointer" }}>
//         <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(139,92,246,.28)" }}>
//           <Pencil size={15} color="#fff" strokeWidth={2.5} />
//         </div>
//         <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 17, color: "#2D1B69", letterSpacing: "-0.3px" }}>CollabBoard</span>
//       </div>

//       {/* Menu pills */}
//       {["File", "Editing"].map((m, i) => (
//         <button key={m} className="tb-btn" style={{ padding: "5px 11px", borderRadius: 8, border: "none", background: i === 1 ? "#EDE9FE" : "transparent", color: i === 1 ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, transition: "all .15s" }}>
//           {i === 1 && <Pencil size={12} strokeWidth={2} />}{m}
//         </button>
//       ))}

//       {/* Undo / Redo group */}
//       <div style={{ display: "flex", gap: 1, marginLeft: 2, padding: "2px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#F8F5F0" }}>
//         <button className="tb-btn" onClick={onUndo} title="Undo" style={{ padding: 6, borderRadius: 7, border: "none", background: "transparent", color: TSUB, cursor: "pointer", display: "flex" }}>
//           <Undo2 size={15} strokeWidth={2} />
//         </button>
//         <button className="tb-btn" onClick={onRedo} title="Redo" style={{ padding: 6, borderRadius: 7, border: "none", background: "transparent", color: TSUB, cursor: "pointer", display: "flex" }}>
//           <Redo2 size={15} strokeWidth={2} />
//         </button>
//       </div>

//       {/* Shape Snap + status */}
//       <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
//         <button
//           className={shapeSnap ? "snap-on" : ""}
//           onClick={onToggleSnap}
//           style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#F8F5F0", color: TSUB, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all .2s" }}
//         >
//           <Wand2 size={14} strokeWidth={2} />
//           {shapeSnap ? "Shape Snap ON" : "Shape Snap"}
//         </button>
//         {snapStatus && (
//           <div className="pulsing" style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", background: "#EDE9FE", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(139,92,246,.2)" }}>
//             {snapStatus}
//           </div>
//         )}
//         {snapError && (
//           <div style={{ fontSize: 12, fontWeight: 700, color: "#B91C1C", background: "#FEF2F2", padding: "4px 12px", borderRadius: 20, border: "1px solid #FECACA" }}>
//             {snapError}
//           </div>
//         )}
//       </div>

//       {/* Right: Room ID + Share + Leave */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <button
//           onClick={onCopyRoomId}
//           title="Copy Room ID"
//           style={{ background: "#F0EBFF", border: "1px solid #DDD0F7", color: "#8B5CF6", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8, letterSpacing: "0.5px", fontFamily: "'Nunito',sans-serif", cursor: "pointer" }}
//         >
//           {roomId}
//         </button>
//         <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 10px rgba(139,92,246,.28)" }}>
//           <Share2 size={14} strokeWidth={2.5} /> Share
//         </button>
//         <button
//           onClick={onLeave}
//           style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 10, border: "1px solid #FECACA", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
//           onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
//           onMouseLeave={e => e.currentTarget.style.background = "#FFF5F5"}
//         >
//           <LogOut size={14} strokeWidth={2} /> Leave
//         </button>
//       </div>
//     </div>
//   );
// }