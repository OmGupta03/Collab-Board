// // ChatPanel owns its own scroll ref + auto-scroll effect
// // so WhiteboardRoom doesn't need to care about it

// import { useRef, useEffect } from "react";
// import ChatMessage from "./ChatMessage.jsx";
// import ChatInput from "./ChatInput.jsx";
// import { TSUB } from "../../constants/whiteboard.js";

// export default function ChatPanel({ messages, typing, chatInput, onTyping, onSend, onFileChange, uploading, fileInputRef }) {
//   const chatEndRef = useRef(null);

//   // Auto-scroll to bottom whenever messages change
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <>
//       <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
//         {messages.length === 0 && (
//           <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "'Caveat',cursive", color: TSUB, fontSize: 16 }}>
//             No messages yet — say hi! 👋
//           </div>
//         )}
//         {messages.map(m => <ChatMessage key={m.id} m={m} />)}
//         {typing && (
//           <div style={{ fontSize: 12, color: TSUB, fontStyle: "italic", paddingLeft: 4 }}>{typing}</div>
//         )}
//         <div ref={chatEndRef} />
//       </div>

//       <ChatInput
//         chatInput={chatInput}
//         onTyping={onTyping}
//         onSend={onSend}
//         onFileChange={onFileChange}
//         uploading={uploading}
//         fileInputRef={fileInputRef}
//       />
//     </>
//   );
// }