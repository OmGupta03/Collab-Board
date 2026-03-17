// import { Sparkles, X } from "lucide-react";
// import { BORDER, TSUB, TMAIN } from "../../constants/whiteboard.js";

// const AI_ACTIONS = [
//   { icon: "📋", label: "Summarise" },
//   { icon: "🎨", label: "Auto Layout" },
//   { icon: "💡", label: "Suggest Ideas" },
//   { icon: "✍️", label: "Fix Text" },
// ];

// export default function AIPanel({ sidebarOpen, onClose, onAction, loading, result }) {
//   return (
//     <div className="pop-up" style={{ position: "fixed", bottom: 64, right: sidebarOpen ? 308 : 16, width: 296, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,.13)", zIndex: 100, overflow: "hidden" }}>

//       {/* Header */}
//       <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <Sparkles size={14} color="#fff" strokeWidth={2} />
//           </div>
//           <span style={{ fontWeight: 800, fontSize: 14, color: TMAIN }}>AI Assistant</span>
//           <span style={{ background: "#D4F0E2", color: "#15803D", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.5px" }}>BETA</span>
//         </div>
//         <button onClick={onClose} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}>
//           <X size={15} strokeWidth={2} />
//         </button>
//       </div>

//       {/* Actions grid */}
//       <div style={{ padding: 14 }}>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
//           {AI_ACTIONS.map(a => (
//             <button
//               key={a.label}
//               className="ai-act"
//               onClick={() => onAction(a.label)}
//               style={{ padding: "10px 8px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#F8F5F0", color: TMAIN, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .15s" }}
//             >
//               <span style={{ fontSize: 18 }}>{a.icon}</span>
//               <span>{a.label}</span>
//             </button>
//           ))}
//         </div>

//         {loading && (
//           <div style={{ padding: 12, borderRadius: 10, background: "#EDE9FE", border: "1px solid rgba(139,92,246,.2)", textAlign: "center", color: "#8B5CF6", fontSize: 13, fontWeight: 600 }}>
//             ✨ Analysing your board…
//           </div>
//         )}
//         {result && (
//           <div style={{ padding: 12, borderRadius: 10, background: "#F0FDF4", border: "1px solid rgba(34,197,94,.2)", fontSize: 12, color: "#065F46", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
//             {result}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }