// import { FileText, Check } from "lucide-react";
// import { TSUB, TMAIN } from "../../constants/whiteboard.js";

// export default function ChatMessage({ m }) {
//   return (
//     <div className="slide-in">
//       {/* Header: avatar + name + time */}
//       <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
//         <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
//           {m.user[0]}
//         </div>
//         <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.user}</span>
//         <span style={{ fontSize: 10, color: TSUB }}>{m.time}</span>
//       </div>

//       {/* Text message */}
//       {m.type === "text" && (
//         <div style={{ fontSize: 13, color: TMAIN, paddingLeft: 28, lineHeight: 1.55 }}>{m.text}</div>
//       )}

//       {/* File message */}
//       {m.type === "file" && (
        
//           href={m.fileUrl}
//           target="_blank"
//           rel="noreferrer"
//           style={{ marginLeft: 28, display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "#F5F0FF", border: "1px solid #DDD0F7", cursor: "pointer", textDecoration: "none" }}
//           onMouseEnter={e => e.currentTarget.style.background = "#EDE9FE"}
//           onMouseLeave={e => e.currentTarget.style.background = "#F5F0FF"}
//         >
//           <div style={{ width: 28, height: 28, borderRadius: 7, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//             <FileText size={14} color="#8B5CF6" strokeWidth={2} />
//           </div>
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: 12, fontWeight: 700, color: TMAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fileName}</div>
//             <div style={{ fontSize: 11, color: TSUB }}>Click to open</div>
//           </div>
//           <Check size={13} color="#22C55E" strokeWidth={2.5} />
//         </a>
//       )}
//     </div>
//   );
// }