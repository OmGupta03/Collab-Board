// import { Trash2 } from "lucide-react";
// import { BORDER, TSUB, TMAIN } from "../../constants/whiteboard.js";

// export default function ClearModal({ onCancel, onConfirm }) {
//   return (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(30,20,10,.28)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
//       <div className="pop-up" style={{ background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 28px 22px", width: 310, textAlign: "center", boxShadow: "0 16px 48px rgba(0,0,0,.12)" }}>
//         <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
//           <Trash2 size={20} color="#EF4444" strokeWidth={2} />
//         </div>
//         <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: TMAIN, marginBottom: 8 }}>Clear the board?</h3>
//         <p style={{ fontSize: 13, color: TSUB, marginBottom: 20, lineHeight: 1.5 }}>This will erase all drawings and shapes for everyone. Cannot be undone.</p>
//         <div style={{ display: "flex", gap: 10 }}>
//           <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Cancel</button>
//           <button onClick={onConfirm} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Clear Board</button>
//         </div>
//       </div>
//     </div>
//   );
// }