import React from 'react';
import { SlidersHorizontal, Palette, Undo2, Redo2, Trash2, Sparkles } from 'lucide-react';
import { WB_TOOLS, PALETTE_COLORS, TSUB, BORDER } from './constants';

const Divider = () => <div style={{ width: 26, height: 1, background: BORDER, margin: "4px 0" }} />;

const ToolBtn = ({ id, icon, label, onClick, forceActive, tool, setTool, setShowAI, setShowPalette, setShowBrush }) => {
  const active = forceActive !== undefined ? forceActive : tool === id;
  return (
    <button title={label}
      onClick={onClick || (() => { setTool(id); if (id === "ai") setShowAI(true); setShowPalette(false); setShowBrush(false); })}
      style={{ width: 40, height: 40, borderRadius: 10, border: active ? "1.5px solid #8B5CF6" : "1.5px solid transparent", background: active ? "#EDE9FE" : "transparent", color: active ? "#8B5CF6" : TSUB, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#F5F2FF"; e.currentTarget.style.color = "#8B5CF6"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TSUB; } }}>
      {icon}
    </button>
  );
};

export default function Toolbar({
  tool, setTool, color, setColor, brushSize, setBrushSize,
  showPalette, setShowPalette, showBrush, setShowBrush,
  showAI, setShowAI, onUndo, onRedo, onClearClick
}) {

  return (
    <div style={{ position: "fixed", left: 12, top: 70, bottom: 70, zIndex: 20, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,.08)", padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, justifyContent: "center" }}>
      {WB_TOOLS.map(t => <ToolBtn key={t.id} {...t} tool={tool} setTool={setTool} setShowAI={setShowAI} setShowPalette={setShowPalette} setShowBrush={setShowBrush} />)}
      <Divider />
      <ToolBtn id="ai" icon={<Sparkles size={17} strokeWidth={2} />} label="AI Assistant"
        onClick={() => { setShowAI(true); setShowPalette(false); setShowBrush(false); }} forceActive={showAI} tool={tool} setTool={setTool} setShowAI={setShowAI} setShowPalette={setShowPalette} setShowBrush={setShowBrush} />
      <Divider />

      <div style={{ position: "relative" }}>
        <button title="Colour" onClick={() => { setShowPalette(p => !p); setShowBrush(false); }}
          style={{ width: 40, height: 40, borderRadius: 10, border: showPalette ? `1.5px solid #8B5CF6` : `1.5px solid ${BORDER}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, transition: "all .15s" }}>
          <Palette size={15} strokeWidth={2} color={TSUB} />
          <div style={{ width: 18, height: 5, borderRadius: 3, background: color, border: `1px solid ${BORDER}` }} />
        </button>
        {showPalette && (
          <div className="pop-up" style={{ position: "absolute", left: 52, top: "50%", transform: "translateY(-50%)", background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 100, width: 168 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {PALETTE_COLORS.map(c => (
                <div key={c} onClick={() => { setColor(c); setShowPalette(false); }}
                  style={{ width: 22, height: 22, borderRadius: 6, background: c, cursor: "pointer", border: c === color ? "2px solid #8B5CF6" : "1.5px solid rgba(0,0,0,.1)", transform: c === color ? "scale(1.2)" : "none", transition: "transform .15s" }} />
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: TSUB, fontWeight: 600 }}>Custom</span>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: 34, height: 24, borderRadius: 6, border: `1px solid ${BORDER}`, cursor: "pointer", background: "transparent" }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button title="Brush Size" onClick={() => { setShowBrush(b => !b); setShowPalette(false); }}
          style={{ width: 40, height: 40, borderRadius: 10, border: showBrush ? `1.5px solid #8B5CF6` : `1.5px solid ${BORDER}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
          <SlidersHorizontal size={15} strokeWidth={2} color={TSUB} />
        </button>
        {showBrush && (
          <div className="pop-up" style={{ position: "absolute", left: 52, top: "50%", transform: "translateY(-50%)", background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 100, width: 148 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: TSUB, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Brush Size</p>
            <input
              type="range" min={1} max={30} value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: 11, color: TSUB, textAlign: "center", marginTop: 6 }}>{brushSize}px</p>
          </div>
        )}
      </div>

      <Divider />
      <ToolBtn id="ux" icon={<Undo2 size={17} strokeWidth={2} />} label="Undo" onClick={onUndo} forceActive={false} tool={tool} setTool={setTool} setShowAI={setShowAI} setShowPalette={setShowPalette} setShowBrush={setShowBrush} />
      <ToolBtn id="rx" icon={<Redo2 size={17} strokeWidth={2} />} label="Redo" onClick={onRedo} forceActive={false} tool={tool} setTool={setTool} setShowAI={setShowAI} setShowPalette={setShowPalette} setShowBrush={setShowBrush} />
      <Divider />
      <button title="Clear Board" onClick={onClearClick}
        style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid transparent", background: "transparent", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
        <Trash2 size={17} strokeWidth={2} />
      </button>
    </div>
  );
}