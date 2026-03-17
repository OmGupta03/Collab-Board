// import { Timer, X } from "lucide-react";
// import { BORDER, TSUB, TMAIN } from "../../constants/whiteboard.js";

// const fmtTime = s =>
//   `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// export default function TimerPanel({
//   onClose, timerSecs, timerRunning,
//   timerInput, onInputChange,
//   onStart, onPause, onReset,
//   showNotes,
// }) {
//   return (
//     <div className="pop-up" style={{ position: "fixed", bottom: 56, left: showNotes ? 326 : 14, width: 230, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 16px 40px rgba(0,0,0,.12)", zIndex: 100, overflow: "hidden" }}>

//       <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//           <Timer size={14} color="#8B5CF6" strokeWidth={2} />
//           <span style={{ fontWeight: 800, fontSize: 13, color: TMAIN }}>Session Timer</span>
//         </div>
//         <button onClick={onClose} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}>
//           <X size={14} strokeWidth={2} />
//         </button>
//       </div>

//       <div style={{ padding: 14, textAlign: "center" }}>
//         <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 46, letterSpacing: "-1px", color: timerSecs < 60 ? "#EF4444" : timerSecs < 120 ? "#F97316" : "#8B5CF6", lineHeight: 1, marginBottom: 12 }}>
//           {fmtTime(timerSecs)}
//         </div>

//         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
//           <span style={{ fontSize: 12, color: TSUB, fontWeight: 600 }}>Minutes</span>
//           <input
//             type="number" min="1" max="120" value={timerInput}
//             onChange={e => onInputChange(e.target.value)}
//             style={{ width: 56, padding: "5px 8px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 13, fontWeight: 700, color: TMAIN, textAlign: "center", outline: "none" }}
//           />
//         </div>

//         <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
//           <button
//             onClick={timerRunning ? onPause : onStart}
//             style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: timerRunning ? "#FEF2F2" : "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: timerRunning ? "#EF4444" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800 }}
//           >
//             {timerRunning ? "Pause" : "Start"}
//           </button>
//           <button
//             onClick={onReset}
//             style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
//           >
//             Reset
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }