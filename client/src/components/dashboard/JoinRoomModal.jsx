import { X, LogIn as LogInIcon } from "lucide-react";

export default function JoinRoomModal({ 
  isOpen, 
  onClose, 
  onJoin, 
  joinId, 
  setJoinId, 
  password,
  setPassword,
  loading 
}) {
  if (!isOpen) return null;

  return (
    <div className="mover" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(80,50,10,.25)",
      backdropFilter: "blur(3px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 200
    }}> 
      <div 
        className="mcard" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: "#E8F8F0", 
          borderRadius: 4, 
          padding: "40px 36px 32px", 
          width: 400, 
          position: "relative", 
          boxShadow: "4px 6px 0 #A4D4B8, 0 16px 48px rgba(0,0,0,.12)" 
        }}
      >
        {/* Tape strip */}
        <div style={{ 
          position: "absolute", 
          top: -13, 
          left: "50%", 
          transform: "translateX(-50%)", 
          width: 60, 
          height: 20, 
          borderRadius: 4, 
          background: "rgba(255,255,255,.6)", 
          border: "1px solid rgba(255,255,255,.9)" 
        }}/>
        
        <button 
          onClick={onClose} 
          style={{ 
            position: "absolute", 
            top: 16, 
            right: 16, 
            background: "rgba(0,0,0,.07)", 
            border: "none", 
            borderRadius: 8, 
            width: 28, 
            height: 28, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#145A30" 
          }}
        >
          <X size={14} strokeWidth={2.5}/>
        </button>

        <h2 style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26, color: "#0D3320", marginBottom: 6 }}>
          🔗 Join a Board
        </h2>
        
        <p style={{ fontSize: 13, color: "#4A8060", fontWeight: 500, marginBottom: 24 }}>
          Paste the Room ID shared by the host
        </p>
        
        <label style={{ 
          fontSize: 12, 
          fontWeight: 700, 
          color: "#2D6040", 
          textTransform: "uppercase", 
          letterSpacing: "0.5px", 
          marginBottom: 6, 
          display: "block" 
        }}>
          Room ID
        </label>
        
        <input 
          className="idash" 
          value={joinId} 
          onChange={e => setJoinId(e.target.value.toUpperCase())} 
          placeholder="CB-XXXXX"
          style={{ 
            width: "100%", 
            padding: "13px 14px", 
            borderRadius: 10, 
            marginBottom: 16, 
            border: "1.5px solid rgba(0,0,0,.12)", 
            background: "rgba(255,255,255,.7)", 
            fontSize: 20, 
            fontWeight: 800, 
            color: "#0D3320", 
            letterSpacing: "4px", 
            textAlign: "center", 
            fontFamily: "'Nunito',sans-serif",
            outline: "none"
          }}
        />

        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            color: "#2D6040", 
            textTransform: "uppercase", 
            letterSpacing: "0.5px", 
            marginBottom: 6, 
            display: "block" 
          }}>
            Password (if private)
          </label>
          <input 
            type="password"
            className="idash" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && onJoin()} 
            placeholder="••••••••"
            style={{ 
              width: "100%", 
              padding: "11px 13px", 
              borderRadius: 10, 
              border: "1.5px solid rgba(0,0,0,.12)", 
              background: "rgba(255,255,255,.7)", 
              fontSize: 14, 
              fontWeight: 500, 
              color: "#0D3320",
              outline: "none"
            }}
          />
        </div>

        <button 
          onClick={onJoin} 
          disabled={loading} 
          style={{ 
            width: "100%", padding: "13px", borderRadius: 12, border: "none", 
            background: "linear-gradient(135deg,#16A34A,#22C55E)", color: "#fff", 
            cursor: "pointer", fontSize: 15, fontWeight: 800, 
            boxShadow: "0 4px 18px rgba(34,197,94,.35)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            gap: 8, opacity: loading ? 0.7 : 1,
            transition: "all .2s"
          }}
        >
          <LogInIcon size={16} strokeWidth={2.5}/> 
          {loading ? "Joining…" : "Join Board →"}
        </button>
      </div>
    </div>
  );
}