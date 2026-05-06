import React from 'react';
import { FileText, Timer, Monitor, Save } from 'lucide-react';
import { WB_PANEL, BORDER, TSUB } from './constants';

export default function BottomBar({
    showNotes, setShowNotes,
    showTimer, setShowTimer, timerRunning, timerSecs,
    startScreenShare, saveBoard, canvasPages,
    fmtTime
}) {
    return (
        <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", flexShrink: 0, background: WB_PANEL, borderTop: `1px solid ${BORDER}`, zIndex: 20 }}>
            <div style={{ display: "flex", gap: 4 }}>
                <button className="bot-btn" onClick={() => setShowNotes(n => !n)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8, border: showNotes ? `1px solid #8B5CF6` : `1px solid ${BORDER}`, background: showNotes ? "#EDE9FE" : "transparent", color: showNotes ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
                    <FileText size={13} strokeWidth={2} /> Notes
                </button>
                <button className="bot-btn" onClick={() => setShowTimer(t => !t)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8, border: showTimer ? `1px solid #8B5CF6` : `1px solid ${BORDER}`, background: showTimer ? "#EDE9FE" : "transparent", color: showTimer ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
                    <Timer size={13} strokeWidth={2} /> {timerRunning ? fmtTime(timerSecs) : "Timer"}
                </button>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button className="bot-btn" onClick={startScreenShare} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
                    <Monitor size={14} strokeWidth={2} /> Share Screen
                </button>
                <button onClick={saveBoard}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 10px rgba(139,92,246,.25)", transition: "box-shadow .2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(139,92,246,.4)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(139,92,246,.25)"}>
                    <Save size={14} strokeWidth={2.5} /> Save Board
                </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: TSUB }}>
                <span>Pages</span>
                <span style={{ background: "#F0EBFF", color: "#8B5CF6", padding: "2px 9px", borderRadius: 6, fontWeight: 800, fontSize: 11 }}>{canvasPages}</span>
            </div>
        </div>
    );
}
