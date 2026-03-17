// import { X } from "lucide-react";
// import { TSUB } from "../../constants/whiteboard.js";

// export default function NotesPanel({ onClose, notesText, onChange }) {
//   return (
//     <div className="pop-up" style={{ position: "fixed", bottom: 56, left: 14, width: 300, background: "#FFFDE7", border: `1px solid #E8D84A`, borderRadius: 4, boxShadow: "4px 6px 0 #DDD09A,0 16px 40px rgba(0,0,0,.14)", zIndex: 100, overflow: "hidden" }}>
//       <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", width: 52, height: 18, borderRadius: 4, background: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.9)" }} />

//       <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid rgba(0,0,0,.07)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <span style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 16, color: "#5C4A1A" }}>📝 Quick Notes</span>
//         <button onClick={onClose} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}>
//           <X size={14} strokeWidth={2} />
//         </button>
//       </div>

//       <div style={{ padding: "10px 14px 14px" }}>
//         <textarea
//           value={notesText}
//           onChange={e => onChange(e.target.value)}
//           placeholder="Jot something down…"
//           style={{ width: "100%", height: 130, resize: "none", border: "none", background: "transparent", fontFamily: "'Caveat',cursive", fontSize: 15, color: "#3D3020", lineHeight: 1.7, outline: "none" }}
//         />
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
//           <span style={{ fontSize: 10, color: TSUB }}>{notesText.length} chars</span>
//           <button
//             onClick={() => onChange("")}
//             style={{ fontSize: 11, color: TSUB, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
//           >
//             Clear
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }