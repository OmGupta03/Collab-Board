// import { useState } from "react";
// import { X, Pencil, Sparkles } from "lucide-react";

// const BORDER = "#EAE4DC", TSUB = "#9A8F82", TMAIN = "#1E1A14";

// export default function CreateRoomModal({ onClose, onCreate, loading }) {
//   const [name, setName] = useState("");

//   const handleSubmit = () => {
//     if (!name.trim()) return;
//     onCreate(name.trim());
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(30,20,10,.32)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
//       <div
//         style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "28px 28px 24px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "popUp .22s cubic-bezier(.34,1.56,.64,1) forwards" }}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(139,92,246,.3)" }}>
//               <Pencil size={16} color="#fff" strokeWidth={2.5} />
//             </div>
//             <div>
//               <h3 style={{ fontSize: 16, fontWeight: 900, color: TMAIN, fontFamily: "'Nunito',sans-serif", lineHeight: 1 }}>Create a Room</h3>
//               <p style={{ fontSize: 12, color: TSUB, marginTop: 2 }}>Start a new collaborative board</p>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex", padding: 4 }}>
//             <X size={18} strokeWidth={2} />
//           </button>
//         </div>

//         {/* Input */}
//         <div style={{ marginBottom: 20 }}>
//           <label style={{ fontSize: 12, fontWeight: 700, color: TSUB, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>
//             Room Name
//           </label>
//           <input
//             autoFocus
//             value={name}
//             onChange={e => setName(e.target.value)}
//             onKeyDown={e => e.key === "Enter" && handleSubmit()}
//             placeholder="e.g. Product Roadmap, Sprint Planning…"
//             maxLength={50}
//             style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#FAFAF8", color: TMAIN, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "border-color .2s, box-shadow .2s", boxSizing: "border-box" }}
//             onFocus={e => { e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,.12)"; }}
//             onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }}
//           />
//           <div style={{ fontSize: 11, color: TSUB, textAlign: "right", marginTop: 5 }}>{name.length}/50</div>
//         </div>

//         {/* Buttons */}
//         <div style={{ display: "flex", gap: 10 }}>
//           <button
//             onClick={onClose}
//             style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={!name.trim() || loading}
//             style={{ flex: 2, padding: "11px", borderRadius: 12, border: "none", background: !name.trim() || loading ? "#D4C8BC" : "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: !name.trim() || loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: !name.trim() || loading ? "none" : "0 3px 14px rgba(139,92,246,.3)", transition: "all .2s" }}
//           >
//             <Sparkles size={14} strokeWidth={2} />
//             {loading ? "Creating…" : "Create Room"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }