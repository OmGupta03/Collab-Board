// import { Paperclip, Send } from "lucide-react";
// import { BORDER, TSUB, TMAIN } from "../../constants/whiteboard.js";

// export default function ChatInput({ chatInput, onTyping, onSend, onFileChange, uploading, fileInputRef }) {
//   return (
//     <div style={{ padding: "10px 12px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 7, flexShrink: 0 }}>
//       <input
//         className="msg-inp"
//         value={chatInput}
//         onChange={e => onTyping(e.target.value)}
//         onKeyDown={e => e.key === "Enter" && onSend()}
//         placeholder="Type a message…"
//         style={{ flex: 1, padding: "8px 11px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#F8F5F0", color: TMAIN, fontSize: 13, transition: "border-color .2s" }}
//       />

//       {/* File attach */}
//       <button
//         title={uploading ? "Uploading…" : "Attach File"}
//         onClick={() => !uploading && fileInputRef.current?.click()}
//         style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: uploading ? "#EDE9FE" : "#F8F5F0", color: uploading ? "#8B5CF6" : TSUB, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
//         onMouseEnter={e => { if (!uploading) { e.currentTarget.style.background = "#EDE9FE"; e.currentTarget.style.color = "#8B5CF6"; } }}
//         onMouseLeave={e => { if (!uploading) { e.currentTarget.style.background = "#F8F5F0"; e.currentTarget.style.color = TSUB; } }}
//       >
//         <Paperclip size={15} strokeWidth={2} />
//       </button>
//       <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={onFileChange} />

//       {/* Send */}
//       <button
//         onClick={onSend}
//         style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
//       >
//         <Send size={14} strokeWidth={2.5} />
//       </button>
//     </div>
//   );
// }