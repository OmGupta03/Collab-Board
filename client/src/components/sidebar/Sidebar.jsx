import { TMAIN, TSUB, BORDER } from '../whiteboard/constants';
import ChatPanel from '../chat/ChatPanel';
import UsersList from './UsersList';

export default function Sidebar({
    open, tab, setTab,
    messages, typing, chatEndRef, chatInput,
    onTyping, onSend, onFileChange, uploading, fileInputRef,
    onlineUsers, user, roomInfo, stringToColor,
    isHost, onGrantVideo, onRevokeVideo
}) {
    return (
        <div style={{
            width: 320, background: "#FAF8F5", borderLeft: `1px solid ${BORDER}`,
            display: "flex", flexDirection: "column",
            position: "relative", zIndex: 20, transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            marginRight: open ? 0 : -320
        }}>
            {/* Tabs */}
            <div style={{ display: "flex", padding: "16px 20px 0", borderBottom: `1px solid ${BORDER}`, background: "rgba(250,248,245,0.8)", backdropFilter: "blur(12px)" }}>
                <button onClick={() => setTab("chat")} className="stab" style={{ flex: 1, paddingBottom: 12, background: "none", border: "none", fontSize: 14, fontWeight: tab === "chat" ? 700 : 600, color: tab === "chat" ? "#8B5CF6" : TSUB, position: "relative", cursor: "pointer", transition: "color .2s" }}>
                    Group Chat
                    {tab === "chat" && <div className="slide-in" style={{ position: "absolute", bottom: -1, left: "20%", right: "20%", height: 3, background: "#8B5CF6", borderRadius: "3px 3px 0 0" }} />}
                </button>
                <button onClick={() => setTab("users")} className="stab" style={{ flex: 1, paddingBottom: 12, background: "none", border: "none", fontSize: 14, fontWeight: tab === "users" ? 700 : 600, color: tab === "users" ? "#1E1A14" : TSUB, position: "relative", cursor: "pointer", transition: "color .2s" }}>
                    Online ({onlineUsers.length})
                    {tab === "users" && <div className="slide-in" style={{ position: "absolute", bottom: -1, left: "20%", right: "20%", height: 3, background: "#1E1A14", borderRadius: "3px 3px 0 0" }} />}
                </button>
            </div>

            {tab === "chat" ? (
                <ChatPanel
                    messages={messages} typing={typing} chatEndRef={chatEndRef}
                    chatInput={chatInput} onTyping={onTyping} onSend={onSend}
                    onFileChange={onFileChange} uploading={uploading} fileInputRef={fileInputRef}
                />
            ) : (
                <UsersList
                    onlineUsers={onlineUsers} user={user} roomInfo={roomInfo}
                    stringToColor={stringToColor}
                    isHost={isHost}
                    onGrantVideo={onGrantVideo}
                    onRevokeVideo={onRevokeVideo}
                />
            )}
        </div>
    );
}
