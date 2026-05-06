import { X, Zap, Lock, Globe } from "lucide-react";

export default function CreateRoomModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  newName, 
  setNewName, 
  newPrivate, 
  setNewPrivate, 
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
          background: "#FEFAE8", 
          borderRadius: 4, 
          padding: "40px 36px 32px", 
          width: 420, 
          position: "relative", 
          boxShadow: "4px 6px 0 #DDD09A, 0 16px 48px rgba(0,0,0,.14)" 
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
            color: "#7C6030" 
          }}
        >
          <X size={14} strokeWidth={2.5}/>
        </button>

        <h2 style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 26, color: "#2D1B00", marginBottom: 6 }}>
          📌 Create a New Board
        </h2>
        
        <p style={{ fontSize: 13, color: "#A89060", fontWeight: 500, marginBottom: 24 }}>
          Give it a name and invite your team instantly
        </p>
        
        <label style={{ 
          fontSize: 12, 
          fontWeight: 700, 
          color: "#7C6030", 
          textTransform: "uppercase", 
          letterSpacing: "0.5px", 
          marginBottom: 6, 
          display: "block" 
        }}>
          Board Name
        </label>
        
        <input 
          className="idash" 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
          placeholder="e.g. Product Launch Sprint"
          style={{ 
            width: "100%", 
            padding: "11px 13px", 
            borderRadius: 10, 
            marginBottom: 16, 
            border: "1.5px solid rgba(0,0,0,.12)", 
            background: "rgba(255,255,255,.7)", 
            fontSize: 14, 
            fontWeight: 500, 
            color: "#2D1B00",
            outline: "none"
          }}
        />

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "10px 14px", 
          background: "rgba(255,255,255,.5)", 
          borderRadius: 10, 
          marginBottom: 16, 
          border: "1.5px solid rgba(0,0,0,.08)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {newPrivate ? <Lock size={15} color="#8B5CF6" strokeWidth={2}/> : <Globe size={15} color="#22C55E" strokeWidth={2}/>}
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2D1B00" }}>
              {newPrivate ? "Private Room" : "Public Room"}
            </span>
          </div>
          <div 
            onClick={() => setNewPrivate(p => !p)} 
            style={{ 
              width: 40, height: 22, borderRadius: 100, 
              background: newPrivate ? "#8B5CF6" : "#22C55E", 
              position: "relative", cursor: "pointer", transition: "background .2s" 
            }}
          >
            <div style={{ 
              position: "absolute", 
              top: 3, 
              left: newPrivate ? 20 : 3, 
              width: 16, height: 16, borderRadius: "50%", 
              background: "#fff", 
              transition: "left .2s", 
              boxShadow: "0 1px 4px rgba(0,0,0,.2)" 
            }}/>
          </div>
        </div>

        {newPrivate && (
          <div style={{ animation: "slDown .3s ease" }}>
            <label style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              color: "#8B5CF6", 
              textTransform: "uppercase", 
              letterSpacing: "0.5px", 
              marginBottom: 6, 
              display: "block" 
            }}>
              Set Room Password
            </label>
            <input 
              type="password"
              className="idash" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Min 4 characters recommended"
              style={{ 
                width: "100%", 
                padding: "11px 13px", 
                borderRadius: 10, 
                marginBottom: 20, 
                border: "1.5px solid rgba(139,92,246,.25)", 
                background: "rgba(255,255,255,.7)", 
                fontSize: 14, 
                fontWeight: 500, 
                color: "#2D1B00",
                outline: "none"
              }}
            />
          </div>
        )}

        <button 
          onClick={onCreate} 
          disabled={loading} 
          style={{ 
            width: "100%", padding: "13px", borderRadius: 12, border: "none", 
            background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", 
            cursor: "pointer", fontSize: 15, fontWeight: 800, 
            boxShadow: "0 4px 18px rgba(139,92,246,.38)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            gap: 8, opacity: loading ? 0.7 : 1,
            transition: "all .2s"
          }}
        >
          <Zap size={16} strokeWidth={2.5}/> 
          {loading ? "Creating…" : "Create & Open Board →"}
        </button>
      </div>
    </div>
  );
}