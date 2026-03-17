// import {
//   Pencil, Eraser, Type, Square, Circle, Triangle, Minus,
//   MousePointer2, Sparkles, Palette, SlidersHorizontal,
//   Undo2, Redo2, Trash2,
// } from "lucide-react";
// import { BORDER, TSUB, PALETTE_COLORS } from "../../constants/whiteboard.js";

// // WB_TOOLS lives here — it uses JSX so can't go in constants.js
// const WB_TOOLS = [
//   { id: "select",   icon: <MousePointer2 size={17} strokeWidth={2} />, label: "Select" },
//   { id: "pencil",   icon: <Pencil        size={17} strokeWidth={2} />, label: "Pencil" },
//   { id: "eraser",   icon: <Eraser        size={17} strokeWidth={2} />, label: "Eraser" },
//   { id: "text",     icon: <Type          size={17} strokeWidth={2} />, label: "Text" },
//   { id: "rect",     icon: <Square        size={17} strokeWidth={2} />, label: "Rectangle" },
//   { id: "circle",   icon: <Circle        size={17} strokeWidth={2} />, label: "Circle" },
//   { id: "triangle", icon: <Triangle      size={17} strokeWidth={2} />, label: "Triangle" },
//   { id: "line",     icon: <Minus         size={17} strokeWidth={2} />, label: "Line" },
// ];

// const Divider = () => (
//   <div style={{ width: 26, height: 1, background: BORDER, margin: "4px 0" }} />
// );

// export default function Toolbar({
//   tool, setTool,
//   color, setColor,
//   brushSize, setBrushSize,
//   showPalette, setShowPalette,
//   showBrush, setShowBrush,
//   showAI, setShowAI,
//   onUndo, onRedo, onClearClick,
// }) {
//   const ToolBtn = ({ id, icon, label, onClick, forceActive }) => {
//     const active = forceActive !== undefined ? forceActive : tool === id;
//     return (
//       <button
//         title={label}
//         onClick={onClick || (() => { setTool(id); setShowPalette(false); setShowBrush(false); })}
//         style={{ width: 40, height: 40, borderRadius: 10, border: active ? "1.5px solid #8B5CF6" : "1.5px solid transparent", background: active ? "#EDE9FE" : "transparent", color: active ? "#8B5CF6" : TSUB, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
//         onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#F5F2FF"; e.currentTarget.style.color = "#8B5CF6"; } }}
//         onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TSUB; } }}
//       >
//         {icon}
//       </button>
//     );
//   };

//   return (
//     <div style={{ position: "fixed", left: 12, top: 70, bottom: 70, zIndex: 20, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,.08)", padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, justifyContent: "center" }}>

//       {/* Drawing tools */}
//       {WB_TOOLS.map(t => <ToolBtn key={t.id} {...t} />)}
//       <Divider />

//       {/* AI */}
//       <ToolBtn
//         id="ai"
//         icon={<Sparkles size={17} strokeWidth={2} />}
//         label="AI Assistant"
//         onClick={() => { setShowAI(true); setShowPalette(false); setShowBrush(false); }}
//         forceActive={showAI}
//       />
//       <Divider />

//       {/* Color picker */}
//       <div style={{ position: "relative" }}>
//         <button
//           title="Colour"
//           onClick={() => { setShowPalette(p => !p); setShowBrush(false); }}
//           style={{ width: 40, height: 40, borderRadius: 10, border: showPalette ? `1.5px solid #8B5CF6` : `1.5px solid ${BORDER}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, transition: "all .15s" }}
//         >
//           <Palette size={15} strokeWidth={2} color={TSUB} />
//           <div style={{ width: 18, height: 5, borderRadius: 3, background: color, border: `1px solid ${BORDER}` }} />
//         </button>

//         {showPalette && (
//           <div className="pop-up" style={{ position: "absolute", left: 52, top: "50%", transform: "translateY(-50%)", background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 100, width: 168 }}>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
//               {PALETTE_COLORS.map(c => (
//                 <div
//                   key={c}
//                   onClick={() => { setColor(c); setShowPalette(false); }}
//                   style={{ width: 22, height: 22, borderRadius: 6, background: c, cursor: "pointer", border: c === color ? "2px solid #8B5CF6" : "1.5px solid rgba(0,0,0,.1)", transform: c === color ? "scale(1.2)" : "none", transition: "transform .15s" }}
//                 />
//               ))}
//             </div>
//             <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
//               <span style={{ fontSize: 11, color: TSUB, fontWeight: 600 }}>Custom</span>
//               <input
//                 type="color"
//                 value={color}
//                 onChange={e => setColor(e.target.value)}
//                 style={{ width: 34, height: 24, borderRadius: 6, border: `1px solid ${BORDER}`, cursor: "pointer", background: "transparent" }}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Brush size */}
//       <div style={{ position: "relative" }}>
//         <button
//           title="Brush Size"
//           onClick={() => { setShowBrush(b => !b); setShowPalette(false); }}
//           style={{ width: 40, height: 40, borderRadius: 10, border: showBrush ? `1.5px solid #8B5CF6` : `1.5px solid ${BORDER}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
//         >
//           <SlidersHorizontal size={15} strokeWidth={2} color={TSUB} />
//         </button>

//         {showBrush && (
//           <div className="pop-up" style={{ position: "absolute", left: 52, top: "50%", transform: "translateY(-50%)", background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 100, width: 148 }}>
//             <p style={{ fontSize: 11, fontWeight: 700, color: TSUB, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Brush Size</p>
//             <input
//               type="range" min={1} max={30} value={brushSize}
//               onChange={e => setBrushSize(Number(e.target.value))}
//               style={{ width: "100%" }}
//             />
//             <p style={{ fontSize: 11, color: TSUB, textAlign: "center", marginTop: 6 }}>{brushSize}px</p>
//           </div>
//         )}
//       </div>

//       <Divider />
//       <ToolBtn id="ux" icon={<Undo2 size={17} strokeWidth={2} />} label="Undo" onClick={onUndo} forceActive={false} />
//       <ToolBtn id="rx" icon={<Redo2 size={17} strokeWidth={2} />} label="Redo" onClick={onRedo} forceActive={false} />
//       <Divider />

//       {/* Clear */}
//       <button
//         title="Clear Board"
//         onClick={onClearClick}
//         style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid transparent", background: "transparent", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
//         onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}
//         onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
//       >
//         <Trash2 size={17} strokeWidth={2} />
//       </button>
//     </div>
//   );
// }