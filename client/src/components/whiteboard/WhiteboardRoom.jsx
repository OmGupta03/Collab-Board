// import { useState, useRef, useEffect, useCallback } from "react";
// import { useSocket } from "../../context/SocketContext.jsx";
// import { roomService } from "../../services/roomService.js";
// import { drawShapePath, exportBoardAsPNG } from "../../utils/canvasUtils.js";
// import { formatTime } from "../../utils/formatters.js";
// import toast from "react-hot-toast";
// import { FileText, Timer, Monitor, Save } from "lucide-react";

// import { PAGE_H, SHAPE_TOOLS, BG, WB_PANEL, BORDER, TSUB, TMAIN, BRUSH_SIZES } from "../../constants/whiteboard.js";

// import TopBar      from "./TopBar.jsx";
// import Toolbar     from "./Toolbar.jsx";
// import ShapeLayer  from "./ShapeLayer.jsx";
// import Sidebar     from "./Sidebar.jsx";
// import AIPanel     from "./AIPanel.jsx";
// import NotesPanel  from "./NotesPanel.jsx";
// import TimerPanel  from "./TimerPanel.jsx";
// import ClearModal  from "./ClearModal.jsx";

// let shapeIdCounter = 1;

// export default function WhiteboardRoom({ roomId, user, onLeave }) {
//   /* ── Refs ─────────────────────────────────────────────── */
//   const canvasRef    = useRef(null);
//   const previewRef   = useRef(null);
//   const scrollRef    = useRef(null);
//   const fileInputRef = useRef(null);
//   const drawing      = useRef(false);
//   const lastPos      = useRef(null);
//   const strokeBounds = useRef({ minX: 9999, minY: 9999, maxX: 0, maxY: 0 });
//   const historyRef   = useRef([]);
//   const redoRef      = useRef([]);
//   const shapeStart   = useRef(null);
//   const typingTimer  = useRef(null);
//   const timerRef     = useRef(null);

//   /* ── Canvas pages ─────────────────────────────────────── */
//   const [canvasPages, setCanvasPages] = useState(1);
//   const canvasH = canvasPages * PAGE_H;

//   /* ── Tool state ───────────────────────────────────────── */
//   const [tool,        setTool]        = useState("pencil");
//   const [color,       setColor]       = useState("#1E1A14");
//   const [brushSize,   setBrushSize]   = useState(BRUSH_SIZES[1]);
//   const [showPalette, setShowPalette] = useState(false);
//   const [showBrush,   setShowBrush]   = useState(false);

//   /* ── Sidebar ──────────────────────────────────────────── */
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [sidebarTab,  setSidebarTab]  = useState("chat");

//   /* ── Chat ─────────────────────────────────────────────── */
//   const [chatInput, setChatInput] = useState("");
//   const [messages,  setMessages]  = useState([]);
//   const [typing,    setTyping]    = useState("");

//   /* ── Shapes ───────────────────────────────────────────── */
//   const [shapes,     setShapes]     = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [dragInfo,   setDragInfo]   = useState(null);
//   const [resizeInfo, setResizeInfo] = useState(null);
//   const [shapeDraft, setShapeDraft] = useState(null);

//   /* ── Online users ─────────────────────────────────────── */
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   /* ── AI ───────────────────────────────────────────────── */
//   const [showAI,    setShowAI]    = useState(false);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [aiResult,  setAiResult]  = useState("");

//   /* ── Misc ─────────────────────────────────────────────── */
//   const [showClear,  setShowClear]  = useState(false);
//   const [shapeSnap,  setShapeSnap]  = useState(false);
//   const [snapStatus, setSnapStatus] = useState("");
//   const [snapError,  setSnapError]  = useState("");
//   const [roomInfo,   setRoomInfo]   = useState(null);
//   const [uploading,  setUploading]  = useState(false);

//   /* ── Notes & Timer ────────────────────────────────────── */
//   const [showNotes,    setShowNotes]    = useState(false);
//   const [notesText,    setNotesText]    = useState("");
//   const [showTimer,    setShowTimer]    = useState(false);
//   const [timerSecs,    setTimerSecs]    = useState(300);
//   const [timerRunning, setTimerRunning] = useState(false);
//   const [timerInput,   setTimerInput]   = useState("5");

//   /* ── Socket ───────────────────────────────────────────── */
//   const { emit, on, off } = useSocket();

//   /* ════════════════════════════════════════════════════════
//      TIMER
//   ════════════════════════════════════════════════════════ */
//   useEffect(() => {
//     if (!timerRunning) { clearInterval(timerRef.current); return; }
//     timerRef.current = setInterval(() => {
//       setTimerSecs(s => {
//         if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
//         return s - 1;
//       });
//     }, 1000);
//     return () => clearInterval(timerRef.current);
//   }, [timerRunning]);

//   const fmtTime  = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
//   const startTimer = () => { const m = parseInt(timerInput) || 5; setTimerSecs(m * 60); setTimerRunning(true); };
//   const resetTimer = () => { setTimerRunning(false); const m = parseInt(timerInput) || 5; setTimerSecs(m * 60); };

//   // Handler passed to TimerPanel — updates input and preview secs if not running
//   const handleTimerInputChange = (val) => {
//     setTimerInput(val);
//     if (!timerRunning) { const m = parseInt(val) || 5; setTimerSecs(m * 60); }
//   };

//   /* ════════════════════════════════════════════════════════
//      ON MOUNT
//   ════════════════════════════════════════════════════════ */
//   useEffect(() => {
//     loadRoomData();
//     registerSocketEvents();
//     return () => unregisterSocketEvents();
//   }, [roomId]);

//   const loadRoomData = async () => {
//     try {
//       const [room, msgs] = await Promise.all([
//         roomService.getRoomById(roomId),
//         roomService.getMessages(roomId),
//       ]);
//       setRoomInfo(room);
//       setMessages(msgs.map(m => ({
//         id: m._id, type: m.type,
//         user: m.senderId?.name || "Unknown",
//         color: stringToColor(m.senderId?.name || ""),
//         text: m.text, fileName: m.fileName, fileUrl: m.fileUrl,
//         time: formatTime(m.createdAt),
//       })));
//     } catch {
//       toast.error("Could not load room data");
//     }
//   };

//   /* ════════════════════════════════════════════════════════
//      SOCKET EVENTS
//   ════════════════════════════════════════════════════════ */
//   const registerSocketEvents = () => {
//     on("draw:stroke",       handleRemoteStroke);
//     on("draw:erase",        handleRemoteErase);
//     on("draw:shape_add",    handleRemoteShapeAdd);
//     on("draw:shape_update", handleRemoteShapeUpdate);
//     on("draw:shape_delete", handleRemoteShapeDelete);
//     on("draw:clear",        handleRemoteClear);
//     on("chat:message",      handleRemoteMessage);
//     on("chat:typing",       ({ name }) => {
//       setTyping(`${name} is typing…`);
//       clearTimeout(typingTimer.current);
//       typingTimer.current = setTimeout(() => setTyping(""), 2000);
//     });
//     on("chat:stop_typing",  () => setTyping(""));
//     on("room:users",        users => setOnlineUsers(users));
//     on("room:user_joined",  ({ name }) => toast(`${name} joined the board 👋`, { icon: "🟢" }));
//     on("room:user_left",    ({ name }) => toast(`${name} left the board`,      { icon: "👋" }));
//   };

//   const unregisterSocketEvents = () => {
//     ["draw:stroke","draw:erase","draw:shape_add","draw:shape_update","draw:shape_delete",
//      "draw:clear","chat:message","chat:typing","chat:stop_typing",
//      "room:users","room:user_joined","room:user_left"].forEach(e => off(e));
//   };

//   /* ════════════════════════════════════════════════════════
//      CANVAS SETUP
//   ════════════════════════════════════════════════════════ */
//   useEffect(() => {
//     const initCanvas = () => {
//       const canvas = canvasRef.current, preview = previewRef.current, container = scrollRef.current;
//       if (!canvas || !container) return;
//       const w = container.offsetWidth;
//       if (w === 0) { requestAnimationFrame(initCanvas); return; }
//       const tmp = document.createElement("canvas");
//       tmp.width = canvas.width || w; tmp.height = canvas.height || canvasH;
//       if (canvas.width > 0) tmp.getContext("2d").drawImage(canvas, 0, 0);
//       canvas.width = w; canvas.height = canvasH;
//       preview.width = w; preview.height = canvasH;
//       if (tmp.width > 0) canvas.getContext("2d").drawImage(tmp, 0, 0);
//     };
//     requestAnimationFrame(initCanvas);
//   }, [canvasH]);

//   useEffect(() => {
//     const container = scrollRef.current;
//     if (!container) return;
//     const obs = new ResizeObserver(() => {
//       const canvas = canvasRef.current, preview = previewRef.current;
//       if (!canvas) return;
//       const w = container.offsetWidth;
//       if (w === 0 || w === canvas.width) return;
//       const tmp = document.createElement("canvas");
//       tmp.width = canvas.width; tmp.height = canvas.height;
//       tmp.getContext("2d").drawImage(canvas, 0, 0);
//       canvas.width = w; canvas.height = canvasH;
//       preview.width = w; preview.height = canvasH;
//       canvas.getContext("2d").drawImage(tmp, 0, 0);
//     });
//     obs.observe(container);
//     return () => obs.disconnect();
//   }, [canvasH]);

//   const onScroll = () => {
//     const el = scrollRef.current;
//     if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 60)
//       setCanvasPages(p => p + 1);
//   };

//   /* ════════════════════════════════════════════════════════
//      HELPERS
//   ════════════════════════════════════════════════════════ */
//   const getXY = (e) => {
//     const rect = canvasRef.current.getBoundingClientRect();
//     const src  = e.touches ? e.touches[0] : e;
//     return { x: src.clientX - rect.left, y: src.clientY - rect.top };
//   };

//   const saveHistory = useCallback(() => {
//     const data = canvasRef.current.toDataURL();
//     historyRef.current.push(data);
//     if (historyRef.current.length > 60) historyRef.current.shift();
//     redoRef.current = [];
//   }, []);

//   const stringToColor = (str) => {
//     const colors = ["#8B5CF6","#EC4899","#F97316","#06B6D4","#22C55E","#EF4444"];
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     return colors[Math.abs(hash) % colors.length];
//   };

//   /* ════════════════════════════════════════════════════════
//      REMOTE HANDLERS
//   ════════════════════════════════════════════════════════ */
//   const handleRemoteStroke = ({ fromX, fromY, toX, toY, color, lineWidth }) => {
//     const ctx = canvasRef.current?.getContext("2d");
//     if (!ctx) return;
//     ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
//     ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
//     ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
//   };

//   const handleRemoteErase = ({ fromX, fromY, toX, toY, lineWidth }) => {
//     const ctx = canvasRef.current?.getContext("2d");
//     if (!ctx) return;
//     ctx.save(); ctx.globalCompositeOperation = "destination-out";
//     ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
//     ctx.strokeStyle = "rgba(0,0,0,1)"; ctx.lineWidth = lineWidth;
//     ctx.lineCap = "round"; ctx.stroke(); ctx.restore();
//   };

//   const handleRemoteShapeAdd    = (shape) => setShapes(prev => [...prev, shape]);
//   const handleRemoteShapeUpdate = (shape) => setShapes(prev => prev.map(s => s.id === shape.id ? shape : s));
//   const handleRemoteShapeDelete = (id)    => setShapes(prev => prev.filter(s => s.id !== id));
//   const handleRemoteClear = () => {
//     canvasRef.current?.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     setShapes([]);
//   };
//   const handleRemoteMessage = (msg) => {
//     setMessages(prev => [...prev, {
//       id: msg._id || Date.now(), type: msg.type,
//       user: msg.senderName, color: stringToColor(msg.senderName),
//       text: msg.text, fileName: msg.fileName, fileUrl: msg.fileUrl,
//       time: formatTime(msg.createdAt || new Date()),
//     }]);
//   };

//   /* ════════════════════════════════════════════════════════
//      DRAWING
//   ════════════════════════════════════════════════════════ */
//   const onDown = (e) => {
//     setShowPalette(false); setShowBrush(false); setSelectedId(null);
//     const pos = getXY(e);

//     if (tool === "text") {
//       const text = prompt("Enter text");
//       if (!text) return;
//       const ctx = canvasRef.current.getContext("2d");
//       ctx.fillStyle = color; ctx.font = "18px DM Sans";
//       ctx.fillText(text, pos.x, pos.y);
//       return;
//     }

//     if (tool === "pencil" || tool === "eraser") {
//       saveHistory(); drawing.current = true; lastPos.current = pos;
//       strokeBounds.current = { minX: pos.x, minY: pos.y, maxX: pos.x, maxY: pos.y };
//       const ctx = canvasRef.current.getContext("2d");
//       if (tool === "eraser") {
//         ctx.save(); ctx.globalCompositeOperation = "destination-out";
//         ctx.beginPath(); ctx.arc(pos.x, pos.y, brushSize * 1.5, 0, Math.PI * 2);
//         ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fill(); ctx.restore();
//       } else {
//         ctx.beginPath(); ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
//         ctx.fillStyle = color; ctx.fill();
//       }
//     } else if (SHAPE_TOOLS.includes(tool)) {
//       shapeStart.current = pos;
//     }
//   };

//   const onMove = (e) => {
//     if (!drawing.current && !shapeStart.current && !dragInfo && !resizeInfo) return;
//     const pos = getXY(e);

//     if (drawing.current) {
//       const b = strokeBounds.current;
//       b.minX = Math.min(b.minX, pos.x); b.minY = Math.min(b.minY, pos.y);
//       b.maxX = Math.max(b.maxX, pos.x); b.maxY = Math.max(b.maxY, pos.y);
//       const ctx = canvasRef.current.getContext("2d");
//       if (tool === "eraser") {
//         ctx.save(); ctx.globalCompositeOperation = "destination-out";
//         ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
//         ctx.strokeStyle = "rgba(0,0,0,1)"; ctx.lineWidth = brushSize * 3;
//         ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); ctx.restore();
//         emit("draw:erase", { roomId, eraseData: { fromX: lastPos.current.x, fromY: lastPos.current.y, toX: pos.x, toY: pos.y, lineWidth: brushSize * 3 } });
//       } else {
//         ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y);
//         ctx.strokeStyle = color; ctx.lineWidth = brushSize;
//         ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
//         emit("draw:stroke", { roomId, strokeData: { fromX: lastPos.current.x, fromY: lastPos.current.y, toX: pos.x, toY: pos.y, color, lineWidth: brushSize } });
//       }
//       lastPos.current = pos;
//     } else if (shapeStart.current && SHAPE_TOOLS.includes(tool)) {
//       const { x: sx, y: sy } = shapeStart.current;
//       setShapeDraft({ type: tool, x: Math.min(sx, pos.x), y: Math.min(sy, pos.y), w: Math.abs(pos.x - sx), h: Math.abs(pos.y - sy), color, strokeWidth: brushSize });
//     } else if (dragInfo) {
//       setShapes(prev => prev.map(s => s.id === dragInfo.id ? { ...s, x: pos.x - dragInfo.ox, y: pos.y - dragInfo.oy } : s));
//     } else if (resizeInfo) {
//       const dx = pos.x - resizeInfo.ox, dy = pos.y - resizeInfo.oy;
//       setShapes(prev => prev.map(s => s.id === resizeInfo.id ? { ...s, w: Math.max(20, resizeInfo.origW + dx), h: Math.max(20, resizeInfo.origH + dy) } : s));
//     }
//   };

//   const onUp = async (e) => {
//     const wasDrawing = drawing.current;
//     const hadShape   = shapeStart.current;
//     drawing.current  = false;
//     const pos = e ? getXY(e) : lastPos.current;

//     if (wasDrawing && tool === "pencil" && shapeSnap && pos) {
//       const b = strokeBounds.current;
//       if ((b.maxX - b.minX) > 30 && (b.maxY - b.minY) > 30) await runShapeSnap(b);
//     }

//     if (hadShape && SHAPE_TOOLS.includes(tool) && pos) {
//       const { x: sx, y: sy } = hadShape;
//       let newShape = null;
//       if (tool === "line") {
//         newShape = { id: shapeIdCounter++, type: "line", x: sx, y: sy, w: pos.x - sx, h: pos.y - sy, color, strokeWidth: brushSize };
//       } else {
//         const x = Math.min(sx, pos.x), y = Math.min(sy, pos.y);
//         const w = Math.abs(pos.x - sx), h = Math.abs(pos.y - sy);
//         if (w >= 10 && h >= 10)
//           newShape = { id: shapeIdCounter++, type: tool, x, y, w, h, color, strokeWidth: brushSize };
//       }
//       if (newShape) {
//         setShapes(prev => [...prev, newShape]);
//         setSelectedId(newShape.id);
//         emit("draw:shape_add", { roomId, shape: newShape });
//       }
//       setShapeDraft(null);
//       shapeStart.current = null;
//     }

//     if (dragInfo) {
//       const moved = shapes.find(s => s.id === dragInfo.id);
//       if (moved) emit("draw:shape_update", { roomId, shape: moved });
//       setDragInfo(null);
//     }
//     if (resizeInfo) {
//       const resized = shapes.find(s => s.id === resizeInfo.id);
//       if (resized) emit("draw:shape_update", { roomId, shape: resized });
//       setResizeInfo(null);
//     }
//     lastPos.current = null;
//   };

//   const onLeaveCanvas = () => {
//     if (drawing.current) { drawing.current = false; lastPos.current = null; }
//     if (shapeStart.current) { setShapeDraft(null); shapeStart.current = null; }
//     setDragInfo(null); setResizeInfo(null);
//   };

//   /* ════════════════════════════════════════════════════════
//      SHAPE SNAP
//   ════════════════════════════════════════════════════════ */
//   const runShapeSnap = async (b) => {
//     setSnapStatus("🔍 Detecting shape…"); setSnapError("");
//     try {
//       const pad = 24, canvas = canvasRef.current;
//       const cropX = Math.max(0, b.minX - pad), cropY = Math.max(0, b.minY - pad);
//       const cropW = Math.min(canvas.width - cropX, (b.maxX - b.minX) + pad * 2);
//       const cropH = Math.min(canvas.height - cropY, (b.maxY - b.minY) + pad * 2);
//       const off = document.createElement("canvas");
//       off.width = cropW; off.height = cropH;
//       const octx = off.getContext("2d");
//       octx.fillStyle = "#FFFFFF"; octx.fillRect(0, 0, cropW, cropH);
//       octx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
//       const base64 = off.toDataURL("image/png").split(",")[1];
//       const res = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514", max_tokens: 150,
//           messages: [{ role: "user", content: [
//             { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
//             { type: "text", text: `Identify the primary shape. Reply ONLY with JSON: {"shape":"<type>","confidence":<0-1>}\nAllowed: "rectangle","circle","ellipse","triangle","line","none".` },
//           ]}],
//         }),
//       });
//       const data = await res.json();
//       const { shape, confidence } = JSON.parse((data?.content?.[0]?.text || "").trim().replace(/```json|```/g, ""));
//       if (!shape || shape === "none" || confidence < 0.45) {
//         setSnapStatus("💬 No clear shape detected");
//         setTimeout(() => setSnapStatus(""), 2500); return;
//       }
//       saveHistory();
//       const ctx = canvas.getContext("2d"), ep = brushSize + 8;
//       ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,1)";
//       ctx.fillRect(b.minX - ep, b.minY - ep, (b.maxX - b.minX) + ep * 2, (b.maxY - b.minY) + ep * 2);
//       ctx.restore();
//       const type = shape === "ellipse" ? "circle" : shape;
//       const newShape = { id: shapeIdCounter++, type, x: b.minX, y: b.minY, w: b.maxX - b.minX, h: b.maxY - b.minY, color, strokeWidth: brushSize };
//       setShapes(prev => [...prev, newShape]);
//       emit("draw:shape_add", { roomId, shape: newShape });
//       setSnapStatus(`✨ Snapped to ${shape[0].toUpperCase() + shape.slice(1)}!`);
//       setTimeout(() => setSnapStatus(""), 3000);
//     } catch {
//       setSnapStatus(""); setSnapError("⚠️ Shape Snap failed");
//       setTimeout(() => setSnapError(""), 3500);
//     }
//   };

//   /* ════════════════════════════════════════════════════════
//      UNDO / REDO / CLEAR / SAVE
//   ════════════════════════════════════════════════════════ */
//   const undo = () => {
//     if (!historyRef.current.length) return;
//     const canvas = canvasRef.current, ctx = canvas.getContext("2d");
//     redoRef.current.push(canvas.toDataURL());
//     const img = new Image();
//     img.src = historyRef.current.pop();
//     img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
//   };

//   const redo = () => {
//     if (!redoRef.current.length) return;
//     const canvas = canvasRef.current, ctx = canvas.getContext("2d");
//     historyRef.current.push(canvas.toDataURL());
//     const img = new Image();
//     img.src = redoRef.current.pop();
//     img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
//   };

//   const clearBoard = () => {
//     saveHistory();
//     canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     setShapes([]); setSelectedId(null); setShowClear(false);
//     emit("draw:clear", { roomId });
//     toast.success("Board cleared");
//   };

//   const saveBoard = () => {
//     const dataUrl = exportBoardAsPNG(canvasRef.current, shapes);
//     const link = document.createElement("a");
//     link.download = `collabboard-${roomId}.png`; link.href = dataUrl; link.click();
//     toast.success("Board saved as PNG!");
//   };

//   const copyRoomId = () => { navigator.clipboard.writeText(roomId); toast.success("Room ID copied!"); };

//   /* ════════════════════════════════════════════════════════
//      SCREEN SHARE
//   ════════════════════════════════════════════════════════ */
//   const startScreenShare = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//       const video = document.createElement("video");
//       video.srcObject = stream; video.play();
//       toast.success("Screen sharing started");
//     } catch { toast.error("Screen share failed"); }
//   };

//   /* ════════════════════════════════════════════════════════
//      CHAT
//   ════════════════════════════════════════════════════════ */
//   const sendMsg = () => {
//     if (!chatInput.trim()) return;
//     emit("chat:message", { roomId, senderId: user._id, senderName: user.name, text: chatInput.trim(), type: "text" });
//     emit("chat:stop_typing", { roomId });
//     setChatInput("");
//   };

//   const handleTyping = (val) => {
//     setChatInput(val);
//     emit("chat:typing", { roomId, name: user.name });
//     clearTimeout(typingTimer.current);
//     typingTimer.current = setTimeout(() => emit("chat:stop_typing", { roomId }), 1500);
//   };

//   const handleFileShare = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);
//     try {
//       const uploaded = await roomService.uploadFile(roomId, file);
//       emit("chat:message", { roomId, senderId: user._id, senderName: user.name, text: "", type: "file", fileUrl: uploaded.fileUrl, fileName: uploaded.fileName });
//       toast.success("File shared!");
//     } catch { toast.error("File upload failed"); }
//     finally { setUploading(false); e.target.value = ""; }
//   };

//   /* ════════════════════════════════════════════════════════
//      AI ANALYSIS
//   ════════════════════════════════════════════════════════ */
//   const runAI = async (action) => {
//     setAiLoading(true); setAiResult("");
//     try {
//       const base64 = exportBoardAsPNG(canvasRef.current, shapes).split(",")[1];
//       const prompts = {
//         "Summarise":     "Describe what is drawn on this whiteboard in 2-3 brief bullet points. Start each with an emoji.",
//         "Suggest Ideas": "Based on the content drawn, suggest 3 ideas to extend this diagram. Be concise.",
//         "Auto Layout":   "Describe a cleaner layout for these shapes and content. Be concise.",
//         "Fix Text":      "If there is any text visible, suggest corrections. Otherwise say 'No text found.'",
//       };
//       const res = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514", max_tokens: 300,
//           messages: [{ role: "user", content: [
//             { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
//             { type: "text", text: prompts[action] || prompts["Summarise"] },
//           ]}],
//         }),
//       });
//       const data = await res.json();
//       setAiResult(data?.content?.[0]?.text?.trim() || "No response.");
//     } catch { setAiResult("⚠️ Failed to connect. Please try again."); }
//     setAiLoading(false);
//   };

//   /* ════════════════════════════════════════════════════════
//      SHAPE DELETE
//   ════════════════════════════════════════════════════════ */
//   const deleteShape = (id) => {
//     setShapes(prev => prev.filter(s => s.id !== id));
//     setSelectedId(null);
//     emit("draw:shape_delete", { roomId, shapeId: id });
//   };

//   const canvasCursor = tool === "eraser" ? "cell" : SHAPE_TOOLS.includes(tool) || tool === "pencil" ? "crosshair" : "default";

//   /* ════════════════════════════════════════════════════════
//      RENDER
//   ════════════════════════════════════════════════════════ */
//   return (
//     <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif", background: BG, color: TMAIN, overflow: "hidden" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Nunito:wght@800;900&family=Caveat:wght@600;700&display=swap');
//         *{box-sizing:border-box;margin:0;padding:0;}
//         ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#D4C4A8;border-radius:4px;}
//         .tb-btn:hover{background:#F5F2EE !important;color:${TMAIN} !important;}
//         .msg-inp:focus{outline:none;border-color:#8B5CF6 !important;box-shadow:0 0 0 3px rgba(139,92,246,.12) !important;}
//         .bot-btn:hover{background:#F5F2EE !important;border-color:#D4C8BC !important;}
//         .ai-act:hover{background:#EDE9FE !important;border-color:#8B5CF6 !important;}
//         .stab:hover{color:#8B5CF6 !important;}
//         @keyframes popUp{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
//         @keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
//         @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
//         .pop-up{animation:popUp .22s cubic-bezier(.34,1.56,.64,1) forwards;}
//         .slide-in{animation:slideIn .18s ease forwards;}
//         .pulsing{animation:pulse 1.2s ease infinite;}
//         .snap-on{background:linear-gradient(135deg,#8B5CF6,#A78BFA) !important;color:#fff !important;border-color:transparent !important;box-shadow:0 3px 12px rgba(139,92,246,.35) !important;}
//         .pdiv{border:none;border-top:2px dashed rgba(139,92,246,.2);width:100%;}
//       `}</style>

//       {/* TOP BAR */}
//       <TopBar
//         roomId={roomId} onLeave={onLeave}
//         onUndo={undo} onRedo={redo}
//         shapeSnap={shapeSnap} onToggleSnap={() => { setShapeSnap(s => !s); setSnapStatus(""); setSnapError(""); }}
//         snapStatus={snapStatus} snapError={snapError}
//         onCopyRoomId={copyRoomId}
//       />

//       {/* MAIN AREA */}
//       <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

//         {/* LEFT TOOLBAR */}
//         <Toolbar
//           tool={tool} setTool={setTool}
//           color={color} setColor={setColor}
//           brushSize={brushSize} setBrushSize={setBrushSize}
//           showPalette={showPalette} setShowPalette={setShowPalette}
//           showBrush={showBrush} setShowBrush={setShowBrush}
//           showAI={showAI} setShowAI={setShowAI}
//           onUndo={undo} onRedo={redo}
//           onClearClick={() => setShowClear(true)}
//         />

//         {/* CANVAS AREA */}
//         <div
//           ref={scrollRef}
//           onScroll={onScroll}
//           style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", cursor: canvasCursor }}
//           onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onLeaveCanvas}
//           onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
//         >
//           {/* Dot grid */}
//           <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(180,165,145,.45) 1.5px,transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0, minHeight: canvasH }} />

//           {/* Page dividers */}
//           {Array.from({ length: canvasPages - 1 }).map((_, i) => (
//             <div key={i} style={{ position: "absolute", top: (i + 1) * PAGE_H, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
//               <hr className="pdiv" />
//               <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(139,92,246,.4)", padding: "2px 0", userSelect: "none" }}>Page {i + 2}</div>
//             </div>
//           ))}

//           {/* Shape snap hint */}
//           {shapeSnap && !snapStatus && !snapError && (
//             <div style={{ position: "sticky", top: 16, left: "50%", transform: "translateX(-50%)", width: "fit-content", background: "linear-gradient(135deg,#EDE9FE,#F5F0FF)", border: "1px solid rgba(139,92,246,.25)", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#6D28D9", zIndex: 5, pointerEvents: "none", whiteSpace: "nowrap" }}>
//               🪄 Shape Snap ON — draw any shape and AI will correct it
//             </div>
//           )}

//           {/* Freehand canvas */}
//           <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1, touchAction: "none" }} />
//           <canvas ref={previewRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 2, pointerEvents: "none" }} />

//           {/* Shapes (draft + committed) */}
//           <ShapeLayer
//             shapes={shapes} selectedId={selectedId}
//             shapeDraft={shapeDraft} canvasH={canvasH}
//             onSelect={id => setSelectedId(id)}
//             onDragStart={(id, ox, oy) => setDragInfo({ id, ox, oy })}
//             onResizeStart={(id, ox, oy, origW, origH) => setResizeInfo({ id, ox, oy, origW, origH })}
//             onDelete={deleteShape}
//             onSvgClick={() => setSelectedId(null)}
//           />

//           <div style={{ height: canvasH, minHeight: canvasH, pointerEvents: "none" }} />
//         </div>

//         {/* RIGHT SIDEBAR */}
//         <Sidebar
//           open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)}
//           tab={sidebarTab} setTab={setSidebarTab}
//           messages={messages} typing={typing}
//           chatInput={chatInput} onTyping={handleTyping} onSend={sendMsg}
//           onFileChange={handleFileShare} uploading={uploading} fileInputRef={fileInputRef}
//           onlineUsers={onlineUsers} user={user} roomInfo={roomInfo}
//           stringToColor={stringToColor}
//         />
//       </div>

//       {/* BOTTOM BAR */}
//       <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", flexShrink: 0, background: WB_PANEL, borderTop: `1px solid ${BORDER}`, zIndex: 20 }}>
//         <div style={{ display: "flex", gap: 4 }}>
//           <button className="bot-btn" onClick={() => setShowNotes(n => !n)}
//             style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8, border: showNotes ? `1px solid #8B5CF6` : `1px solid ${BORDER}`, background: showNotes ? "#EDE9FE" : "transparent", color: showNotes ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
//             <FileText size={13} strokeWidth={2} /> Notes
//           </button>
//           <button className="bot-btn" onClick={() => setShowTimer(t => !t)}
//             style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8, border: showTimer ? `1px solid #8B5CF6` : `1px solid ${BORDER}`, background: showTimer ? "#EDE9FE" : "transparent", color: showTimer ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
//             <Timer size={13} strokeWidth={2} /> {timerRunning ? fmtTime(timerSecs) : "Timer"}
//           </button>
//         </div>
//         <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//           <button className="bot-btn" onClick={startScreenShare}
//             style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" }}>
//             <Monitor size={14} strokeWidth={2} /> Share Screen
//           </button>
//           <button onClick={saveBoard}
//             style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 10px rgba(139,92,246,.25)" }}
//             onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(139,92,246,.4)"}
//             onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(139,92,246,.25)"}>
//             <Save size={14} strokeWidth={2.5} /> Save Board
//           </button>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: TSUB }}>
//           <span>Pages</span>
//           <span style={{ background: "#F0EBFF", color: "#8B5CF6", padding: "2px 9px", borderRadius: 6, fontWeight: 800, fontSize: 11 }}>{canvasPages}</span>
//         </div>
//       </div>

//       {/* FLOATING PANELS */}
//       {showAI && (
//         <AIPanel
//           sidebarOpen={sidebarOpen}
//           onClose={() => setShowAI(false)}
//           onAction={runAI}
//           loading={aiLoading}
//           result={aiResult}
//         />
//       )}
//       {showNotes && (
//         <NotesPanel
//           onClose={() => setShowNotes(false)}
//           notesText={notesText}
//           onChange={setNotesText}
//         />
//       )}
//       {showTimer && (
//         <TimerPanel
//           onClose={() => setShowTimer(false)}
//           timerSecs={timerSecs} timerRunning={timerRunning}
//           timerInput={timerInput} onInputChange={handleTimerInputChange}
//           onStart={startTimer} onPause={() => setTimerRunning(false)} onReset={resetTimer}
//           showNotes={showNotes}
//         />
//       )}
//       {showClear && (
//         <ClearModal onCancel={() => setShowClear(false)} onConfirm={clearBoard} />
//       )}
//     </div>
//   );
// }