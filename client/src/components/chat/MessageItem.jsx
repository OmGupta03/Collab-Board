import { Download } from 'lucide-react';
import { TSUB } from '../whiteboard/constants';

export default function MessageItem({ msg, isSystem }) {
    if (isSystem) {
        return (
            <div style={{ textAlign: "center", fontSize: 13, color: TSUB, margin: "16px 0", fontStyle: "italic", opacity: 0.8 }} className="slide-in">
                {msg.text}
            </div>
        );
    }

    return (
        <div className="slide-in" style={{ marginBottom: 20 }}>
            {/* Name & Time */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6, paddingLeft: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: msg.color }}>{msg.user}</span>
                <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", fontWeight: 500 }}>{msg.time}</span>
            </div>

            {/* Bubble */}
            <div style={{
                background: "#FFF",
                padding: "12px 14px",
                borderRadius: "0 14px 14px 14px",
                fontSize: 14,
                lineHeight: 1.5,
                color: "#1E1A14",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.04)"
            }}>
                {msg.type === "text" ? (
                    msg.text
                ) : (
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, color: "#8B5CF6", textDecoration: "none", fontWeight: 600, background: "#F5F3FF", padding: "8px 12px", borderRadius: 8 }}>
                        <Download size={16} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.fileName}</span>
                    </a>
                )}
            </div>
        </div>
    );
}
