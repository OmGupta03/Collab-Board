import { Send, Upload } from 'lucide-react';
import { TSUB, BORDER } from '../whiteboard/constants';
import MessageItem from './MessageItem';

export default function ChatPanel({ messages, typing, chatEndRef, chatInput, onTyping, onSend, onFileChange, uploading, fileInputRef }) {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {messages.length === 0 ? (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: TSUB, fontSize: 14 }}>
                        No messages yet. Say hello! 👋
                    </div>
                ) : (
                    messages.map(msg => <MessageItem key={msg.id} msg={msg} isSystem={msg.type === "system"} />)
                )}
                {typing && (
                    <div style={{ fontSize: 13, color: "#8B5CF6", fontStyle: "italic", marginLeft: 4 }} className="pulsing slide-in">
                        {typing}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "16px 20px", borderTop: `1px solid ${BORDER}`, background: "#FFF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F5F2EE", padding: "8px 16px", borderRadius: 24, border: "1px solid transparent", transition: "all .2s" }} className="chat-inp-container">
                    <input type="file" ref={fileInputRef} hidden onChange={onFileChange} />

                    <button onClick={() => fileInputRef.current?.click()} className="stab" disabled={uploading} style={{ background: "transparent", border: "none", color: TSUB, cursor: uploading ? "wait" : "pointer", display: "flex" }}>
                        <Upload size={18} strokeWidth={2.5} />
                    </button>

                    <input className="msg-inp" value={chatInput} onChange={e => onTyping(e.target.value)} onKeyDown={e => e.key === "Enter" && onSend()} placeholder="Type a message..." style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, color: "#1E1A14" }} />

                    <button onClick={onSend} disabled={!chatInput.trim()} style={{ background: chatInput.trim() ? "#8B5CF6" : "#E5E7EB", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", cursor: chatInput.trim() ? "pointer" : "default", transition: "background .2s", boxShadow: chatInput.trim() ? "0 2px 8px rgba(139,92,246,0.3)" : "none" }}>
                        <Send size={14} style={{ marginLeft: -2 }} />
                    </button>
                </div>
            </div>
        </div>
    );
}