import { TMAIN, TSUB, BORDER } from '../whiteboard/constants';

export default function UsersList({ onlineUsers, user, roomInfo, stringToColor }) {
    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {onlineUsers.length === 0 ? (
                <div style={{ textAlign: "center", color: TSUB, fontSize: 14, marginTop: 40 }}>
                    Just you here right now <br /> Share the URL to invite others!
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {onlineUsers.map(u => {
                        const isMe = u.id === user._id;
                        const isHost = u.id === roomInfo?.host;
                        const col = stringToColor(u.name);
                        return (
                            <div key={u.id} className="slide-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFF", padding: "12px 16px", borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 12, background: isMe ? "linear-gradient(135deg, #1E1A14, #4A4036)" : `linear-gradient(135deg, ${col}, ${col}DD)`, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                                        {u.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: TMAIN, display: "flex", alignItems: "center", gap: 6 }}>
                                            {u.name} {isMe && <span style={{ fontSize: 11, fontWeight: 600, color: "#8B5CF6", background: "#F5F3FF", padding: "2px 6px", borderRadius: 6 }}>You</span>}
                                        </span>
                                        <span style={{ fontSize: 12, color: TSUB, display: "flex", alignItems: "center", gap: 4 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.2)" }} /> Online
                                        </span>
                                    </div>
                                </div>
                                {isHost && (
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", background: "#FEF3C7", padding: "4px 8px", borderRadius: 8, letterSpacing: 0.5, border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                                        HOST
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
