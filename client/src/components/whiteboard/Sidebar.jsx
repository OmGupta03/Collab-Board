// import { MessageSquare, Users, ChevronRight, ChevronLeft } from "lucide-react";
// import ChatPanel from "./ChatPanel.jsx";
// import { BORDER, TSUB, TMAIN, WB_PANEL } from "../../constants/whiteboard.js";

// export default function Sidebar({
//   open, onToggle, tab, setTab,
//   // chat props
//   messages, typing, chatInput, onTyping, onSend, onFileChange, uploading, fileInputRef,
//   // people props
//   onlineUsers, user, roomInfo, stringToColor,
// }) {
//   return (
//     <>
//       {/* Collapse / expand toggle */}
//       <button
//         onClick={onToggle}
//         style={{ position: "absolute", right: open ? 296 : 12, top: "50%", transform: "translateY(-50%)", width: 22, height: 44, borderRadius: "8px 0 0 8px", border: `1px solid ${BORDER}`, borderRight: "none", background: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TSUB, zIndex: 25, transition: "right .25s", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}
//       >
//         {open ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
//       </button>

//       {/* Panel */}
//       <div style={{ width: open ? 300 : 0, overflow: "hidden", flexShrink: 0, transition: "width .25s ease", background: WB_PANEL, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", zIndex: 20 }}>
//         <div style={{ width: 300, height: "100%", display: "flex", flexDirection: "column" }}>

//           {/* Tabs */}
//           <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
//             {[
//               { id: "chat",  icon: <MessageSquare size={14} strokeWidth={2} />, label: "Chat" },
//               { id: "users", icon: <Users          size={14} strokeWidth={2} />, label: "People" },
//             ].map(t => (
//               <button
//                 key={t.id}
//                 className="stab"
//                 onClick={() => setTab(t.id)}
//                 style={{ flex: 1, padding: "11px 6px", border: "none", background: "transparent", borderBottom: tab === t.id ? "2px solid #8B5CF6" : "2px solid transparent", color: tab === t.id ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all .15s" }}
//               >
//                 {t.icon}{t.label}
//                 {t.id === "chat" && messages.length > 0 && (
//                   <span style={{ background: "#8B5CF6", color: "#fff", borderRadius: 10, fontSize: 9, fontWeight: 800, padding: "1px 5px" }}>
//                     {messages.length}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Chat tab */}
//           {tab === "chat" && (
//             <ChatPanel
//               messages={messages} typing={typing}
//               chatInput={chatInput} onTyping={onTyping} onSend={onSend}
//               onFileChange={onFileChange} uploading={uploading} fileInputRef={fileInputRef}
//             />
//           )}

//           {/* People tab */}
//           {tab === "users" && (
//             <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
//               <p style={{ fontSize: 11, fontWeight: 700, color: TSUB, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
//                 Online — {onlineUsers.length}
//               </p>
//               {onlineUsers.length === 0 && (
//                 <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "'Caveat',cursive", color: TSUB, fontSize: 16 }}>Just you here 👀</div>
//               )}
//               {onlineUsers.map((u, i) => (
//                 <div key={u.socketId || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "#F8F5F0", border: `1px solid ${BORDER}` }}>
//                   <div style={{ position: "relative" }}>
//                     <div style={{ width: 34, height: 34, borderRadius: "50%", background: stringToColor(u.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
//                       {u.name?.[0]?.toUpperCase()}
//                     </div>
//                     <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: "#22C55E", border: `2px solid ${WB_PANEL}` }} />
//                   </div>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontSize: 13, fontWeight: 700, color: TMAIN }}>
//                       {u.name}{u.userId === user?._id && " (You)"}
//                     </div>
//                     <div style={{ fontSize: 11, color: TSUB }}>
//                       {u.userId === roomInfo?.hostId?._id || u.userId === roomInfo?.hostId ? "Host" : "Member"}
//                     </div>
//                   </div>
//                   {(u.userId === roomInfo?.hostId?._id || u.userId === roomInfo?.hostId) && (
//                     <div style={{ background: "#EDE9FE", color: "#8B5CF6", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.5px" }}>HOST</div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }