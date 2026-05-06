import { MoreHorizontal, ExternalLink, Copy, Star, Trash2, Users, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatters.js";

export default function RoomCard({ 
  room, 
  index, 
  user, 
  isStarred, 
  menuOpen, 
  setMenuOpen, 
  onCopyId, 
  onToggleStar, 
  onDelete 
}) {
  const navigate = useNavigate();
  const CARD_COLORS = ["#FDF5C4", "#D4E8FF", "#D4F0E2", "#FAE0CC", "#EDE0FF", "#E8F5CC"];
  const CARD_SHADOWS = ["#DDD09A", "#A8C8EE", "#A4D4B8", "#E4BCA0", "#C8B0EE", "#C4D8A0"];

  const cardColor = CARD_COLORS[index % CARD_COLORS.length];
  const cardShadow = CARD_SHADOWS[index % CARD_SHADOWS.length];
  const isHost = room.hostId?._id === user?._id || room.hostId === user?._id;

  return (
    <div 
      className="rcard" 
      style={{ 
        background: cardColor, 
        borderRadius: 4, 
        padding: "20px 20px 16px", 
        position: "relative", 
        boxShadow: `3px 5px 0 ${cardShadow}, 0 8px 28px rgba(0,0,0,.1)`, 
        transform: `rotate(${(index % 3 === 0) ? -1 : (index % 3 === 1) ? .5 : -.8}deg)`, 
        animationDelay: `${index * .08}s`, 
        backgroundImage: "linear-gradient(rgba(255,255,255,.3) 0, rgba(255,255,255,0) 60px)",
        cursor: "pointer",
        transition: "transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s"
      }}
      onClick={() => navigate(`/room/${room.roomId}`)}
    >
      {/* Tape strip */}
      <div style={{ 
        position: "absolute", 
        top: -12, 
        left: "50%", 
        transform: "translateX(-50%)", 
        width: 52, 
        height: 18, 
        borderRadius: 4, 
        background: "rgba(255,255,255,.55)", 
        border: "1px solid rgba(255,255,255,.8)" 
      }}/>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: "50%", 
            background: room.isActive ? "#22C55E" : "#CBD5E1", 
            boxShadow: room.isActive ? "0 0 6px #22C55E" : undefined 
          }}/>
          <span style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            color: room.isActive ? "#15803D" : "#94A3B8", 
            textTransform: "uppercase", 
            letterSpacing: "0.5px" 
          }}>
            {room.isActive ? "Live" : "Offline"}
          </span>
        </div>
        
        <div style={{ position: "relative" }}>
          <button 
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(menuOpen === room._id ? null : room._id);
            }} 
            style={{ 
              width: 28, height: 28, borderRadius: 8, 
              border: "1px solid rgba(0,0,0,.1)", 
              background: "rgba(255,255,255,.5)", 
              cursor: "pointer", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              color: "#5A4000" 
            }}
          >
            <MoreHorizontal size={14} strokeWidth={2}/>
          </button>
          
          {menuOpen === room._id && (
            <div style={{ 
              position: "absolute", 
              right: 0, 
              top: 34, 
              background: "#FFFDE7", 
              border: "1px solid rgba(200,184,162,.6)", 
              borderRadius: 12, 
              boxShadow: "0 8px 28px rgba(0,0,0,.12)", 
              zIndex: 50, 
              width: 160, 
              overflow: "hidden" 
            }}>
              {[
                { icon: <ExternalLink size={13}/>, label: "Open board",   fn: () => navigate(`/room/${room.roomId}`) },
                { icon: <Copy size={13}/>,         label: "Copy Room ID", fn: () => onCopyId(room.roomId) },
                { icon: <Star size={13}/>,         label: isStarred ? "Unstar board" : "Star board", fn: () => onToggleStar(room._id) },
                ...(isHost ? [{ icon: <Trash2 size={13}/>, label: "Delete", danger: true, fn: () => onDelete(room.roomId) }] : []),
              ].map(m => (
                <div 
                  key={m.label} 
                  className="mitem" 
                  onClick={e => { e.stopPropagation(); m.fn(); setMenuOpen(null); }} 
                  style={{ 
                    padding: "9px 14px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8, 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: m.danger ? "#EF4444" : "#2D1B00", 
                    cursor: "pointer", 
                    transition: "all .1s" 
                  }}
                >
                  {m.icon}
                  {m.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: 20, fontWeight: 700, color: "#2D1B00", marginBottom: 8, lineHeight: 1.25 }}>
        {room.name}
      </h3>

      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 800, 
          background: isHost ? "rgba(139,92,246,.15)" : "rgba(0,0,0,.06)", 
          color: isHost ? "#6D3FCC" : "#5A3E00", 
          padding: "2px 8px", 
          borderRadius: 20, 
          textTransform: "uppercase", 
          letterSpacing: "0.3px" 
        }}>
          {isHost ? "Host" : "Member"}
        </span>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 800, 
          background: "rgba(255,255,255,.55)", 
          color: "#5A3E00", 
          padding: "2px 8px", 
          borderRadius: 20, 
          border: "1px solid rgba(0,0,0,.08)", 
          textTransform: "uppercase" 
        }}>
          {room.settings?.isPrivate ? "🔒 Private" : "🌐 Public"}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px dashed rgba(0,0,0,.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7C6030", fontWeight: 600 }}>
          <Users size={13} strokeWidth={2}/>
          <span>{room.participants?.length || 0} member{(room.participants?.length || 0) !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#A89060" }}>
          <Clock size={12} strokeWidth={2}/>
          {formatDate(room.updatedAt || room.createdAt)}
        </div>
      </div>

      <button 
        onClick={e => { e.stopPropagation(); navigate(`/room/${room.roomId}`); }} 
        style={{ 
          marginTop: 12, width: "100%", padding: "9px", borderRadius: 10, 
          border: "1.5px solid rgba(0,0,0,.12)", 
          background: "rgba(255,255,255,.65)", 
          cursor: "pointer", 
          fontFamily: "'DM Sans',sans-serif", 
          fontWeight: 800, fontSize: 13, color: "#2D1B69", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          gap: 6, transition: "background .15s" 
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.9)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.65)"}
      >
        Open Board <ChevronRight size={14} strokeWidth={2.5}/>
      </button>

      <button 
        className="starbtn" 
        onClick={e => {
          e.stopPropagation();
          onToggleStar(room._id);
        }} 
        style={{ 
          position: "absolute", 
          top: 20, 
          right: 44, 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          padding: 0, 
          transition: "transform .2s", 
          fontSize: 16 
        }}
      >
        {isStarred ? "⭐" : "☆"}
      </button>
    </div>
  );
}