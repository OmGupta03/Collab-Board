import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import { roomService } from "../../services/roomService.js";
import { drawShapePath, exportBoardAsPNG } from "../../utils/canvasUtils.js";
import { formatTime } from "../../utils/formatters.js";
import toast from "react-hot-toast";
import {
  Pencil, Eraser, Undo2, Redo2, Trash2, SlidersHorizontal,
  Palette, ChevronRight, ChevronLeft, MessageSquare, Users,
  Paperclip, Monitor, Save, Share2, LogOut, Send, X, Check,
  FileText, Timer, Sparkles, Type, Square, Circle,
  MousePointer2, Wand2, Triangle, Minus
} from "lucide-react";

/* ── constants ─────────────────────────────────────────── */
const BRUSH_SIZES = [2, 4, 8, 14, 22];
const PALETTE_COLORS = [
  "#1E1A14", "#64748B", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#FFFFFF", "#F8F5F0", "#FDF5C4", "#D4F0E2", "#D4E8FF",
];
const PAGE_H = 680;
const BG = "#FAFAF8", WB_PANEL = "#FFFFFF", BORDER = "#EAE4DC";
const TSUB = "#9A8F82", TMAIN = "#1E1A14";
const SHAPE_TOOLS = ["rect", "circle", "triangle", "line"];
let shapeIdCounter = 1;

const WB_TOOLS = [
  { id: "select",   icon: <MousePointer2 size={17} strokeWidth={2} />, label: "Select" },
  { id: "pencil",   icon: <Pencil        size={17} strokeWidth={2} />, label: "Pencil" },
  { id: "eraser",   icon: <Eraser        size={17} strokeWidth={2} />, label: "Eraser" },
  { id: "text",     icon: <Type          size={17} strokeWidth={2} />, label: "Text" },
  { id: "rect",     icon: <Square        size={17} strokeWidth={2} />, label: "Rectangle" },
  { id: "circle",   icon: <Circle        size={17} strokeWidth={2} />, label: "Circle" },
  { id: "triangle", icon: <Triangle      size={17} strokeWidth={2} />, label: "Triangle" },
  { id: "line",     icon: <Minus         size={17} strokeWidth={2} />, label: "Line" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function WhiteboardRoom({ roomId, user, onLeave }) {
  /* ── canvas refs ──────────────────────────────────────── */
  const canvasRef    = useRef(null);
  const previewRef   = useRef(null);
  const scrollRef    = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef   = useRef(null);

  /* ── drawing state refs (not React state — no re-renders) */
  const drawing       = useRef(false);
  const lastPos       = useRef(null);
  const strokeBounds  = useRef({ minX: 9999, minY: 9999, maxX: 0, maxY: 0 });
  const historyRef    = useRef([]);
  const redoRef       = useRef([]);
  const shapeStart    = useRef(null);

  /* ── canvas pages ─────────────────────────────────────── */
  const [canvasPages, setCanvasPages] = useState(1);
  const canvasH = canvasPages * PAGE_H;

  /* ── tool state ───────────────────────────────────────── */
  const [tool,        setTool]        = useState("pencil");
  const [color,       setColor]       = useState("#1E1A14");
  // const [brushIdx,    setBrushIdx]    = useState(1);
  const [brushSize,   setBrushSize]   = useState(BRUSH_SIZES[1]); // FIX: single brush size value
  const [showPalette, setShowPalette] = useState(false);
  const [showBrush,   setShowBrush]   = useState(false);

  /* ── sidebar state ────────────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab,  setSidebarTab]  = useState("chat");

  /* ── chat state ───────────────────────────────────────── */
  const [chatInput, setChatInput] = useState("");
  const [messages,  setMessages]  = useState([]);
  const [typing,    setTyping]    = useState("");
  const typingTimer = useRef(null);

  /* ── shapes state ─────────────────────────────────────── */
  const [shapes,      setShapes]      = useState([]);
  const [selectedId,  setSelectedId]  = useState(null);
  const [dragInfo,    setDragInfo]    = useState(null);
  const [resizeInfo,  setResizeInfo]  = useState(null);
  const [shapeDraft,  setShapeDraft]  = useState(null);

  /* ── online users ─────────────────────────────────────── */
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* ── AI state ─────────────────────────────────────────── */
  const [showAI,    setShowAI]    = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult,  setAiResult]  = useState("");

  /* ── misc ─────────────────────────────────────────────── */
  const [showClear,  setShowClear]  = useState(false);
  const [shapeSnap,  setShapeSnap]  = useState(false);
  const [snapStatus, setSnapStatus] = useState("");
  const [snapError,  setSnapError]  = useState("");
  const [roomInfo,   setRoomInfo]   = useState(null);
  const [uploading,  setUploading]  = useState(false);

  /* ── Notes & Timer state ──────────────────────────────── */
  const [showNotes,     setShowNotes]     = useState(false);
  const [notesText,     setNotesText]     = useState("");
  const [showTimer,     setShowTimer]     = useState(false);
  const [timerSecs,     setTimerSecs]     = useState(300);
  const [timerRunning,  setTimerRunning]  = useState(false);
  const [timerInput,    setTimerInput]    = useState("5");
  const timerRef = useRef(null);

  /* ── socket ───────────────────────────────────────────── */
  const { emit, on, off } = useSocket();

  /* ════════════════════════════════════════════════════════
     Timer effect
     Dependency array is [timerRunning] ONLY — NOT timerSecs.
  ════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!timerRunning) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); setTimerRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const fmtTime   = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const startTimer = () => { const m = parseInt(timerInput) || 5; setTimerSecs(m * 60); setTimerRunning(true); };
  const resetTimer = () => { setTimerRunning(false); const m = parseInt(timerInput) || 5; setTimerSecs(m * 60); };

  /* ════════════════════════════════════════════════════════
     ON MOUNT — load room info + chat history + socket events
  ════════════════════════════════════════════════════════ */
  useEffect(() => {
    loadRoomData();
    registerSocketEvents();
    return () => unregisterSocketEvents();
  }, [roomId]);

  /* auto-scroll chat to bottom */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── load room info & chat history from DB ────────────── */
  const loadRoomData = async () => {
    try {
      const [room, msgs] = await Promise.all([
        roomService.getRoomById(roomId),
        roomService.getMessages(roomId),
      ]);
      setRoomInfo(room);
      const formatted = msgs.map(m => ({
        id:       m._id,
        type:     m.type,
        user:     m.senderId?.name || "Unknown",
        color:    stringToColor(m.senderId?.name || ""),
        text:     m.text,
        fileName: m.fileName,
        fileUrl:  m.fileUrl,
        time:     formatTime(m.createdAt),
      }));
      setMessages(formatted);
    } catch (err) {
      toast.error("Could not load room data");
    }
  };

  /* ── register all socket event listeners ─────────────── */
  const registerSocketEvents = () => {
    on("draw:stroke",       handleRemoteStroke);
    on("draw:erase",        handleRemoteErase);
    on("draw:shape_add",    handleRemoteShapeAdd);
    on("draw:shape_update", handleRemoteShapeUpdate);
    on("draw:shape_delete", handleRemoteShapeDelete);
    on("draw:clear",        handleRemoteClear);
    on("chat:message",      handleRemoteMessage);
    on("chat:typing",       ({ name }) => {
      setTyping(`${name} is typing…`);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(""), 2000);
    });
    on("chat:stop_typing",  () => setTyping(""));
    on("room:users",        (users) => setOnlineUsers(users));
    on("room:user_joined",  ({ name }) => toast(`${name} joined the board 👋`, { icon: "🟢" }));
    on("room:user_left",    ({ name }) => toast(`${name} left the board`,       { icon: "👋" }));
  };

  const unregisterSocketEvents = () => {
    off("draw:stroke");       off("draw:erase");
    off("draw:shape_add");    off("draw:shape_update"); off("draw:shape_delete");
    off("draw:clear");        off("chat:message");
    off("chat:typing");       off("chat:stop_typing");
    off("room:users");        off("room:user_joined");  off("room:user_left");
  };

  /* ════════════════════════════════════════════════════════
     Canvas setup — requestAnimationFrame retry
  ════════════════════════════════════════════════════════ */
  useEffect(() => {
    const initCanvas = () => {
      const canvas    = canvasRef.current;
      const preview   = previewRef.current;
      const container = scrollRef.current;
      if (!canvas || !container) return;
      const w = container.offsetWidth;
      if (w === 0) { requestAnimationFrame(initCanvas); return; }
      const tmp = document.createElement("canvas");
      tmp.width  = canvas.width  || w;
      tmp.height = canvas.height || canvasH;
      if (canvas.width > 0) tmp.getContext("2d").drawImage(canvas, 0, 0);
      canvas.width  = w; canvas.height  = canvasH;
      preview.width = w; preview.height = canvasH;
      if (tmp.width > 0) canvas.getContext("2d").drawImage(tmp, 0, 0);
    };
    requestAnimationFrame(initCanvas);
  }, [canvasH]);

  /* ResizeObserver handles sidebar open/close */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => {
      const canvas  = canvasRef.current;
      const preview = previewRef.current;
      if (!canvas) return;
      const w = container.offsetWidth;
      if (w === 0 || w === canvas.width) return;
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width; tmp.height = canvas.height;
      tmp.getContext("2d").drawImage(canvas, 0, 0);
      canvas.width  = w; canvas.height  = canvasH;
      preview.width = w; preview.height = canvasH;
      canvas.getContext("2d").drawImage(tmp, 0, 0);
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [canvasH]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      setCanvasPages(p => p + 1);
    }
  };

  /* ════════════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════════════ */
  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const saveHistory = useCallback(() => {
    const data = canvasRef.current.toDataURL();
    historyRef.current.push(data);
    if (historyRef.current.length > 60) historyRef.current.shift();
    redoRef.current = [];
  }, []);

  const stringToColor = (str) => {
    const colors = ["#8B5CF6", "#EC4899", "#F97316", "#06B6D4", "#22C55E", "#EF4444"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  /* ════════════════════════════════════════════════════════
     REMOTE SOCKET HANDLERS
  ════════════════════════════════════════════════════════ */
  const handleRemoteStroke = (strokeData) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { fromX, fromY, toX, toY, color, lineWidth } = strokeData;
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
  };

  const handleRemoteErase = (eraseData) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.save(); ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(eraseData.fromX, eraseData.fromY);
    ctx.lineTo(eraseData.toX,   eraseData.toY);
    ctx.strokeStyle = "rgba(0,0,0,1)"; ctx.lineWidth = eraseData.lineWidth;
    ctx.lineCap = "round"; ctx.stroke(); ctx.restore();
  };

  const handleRemoteShapeAdd    = (shape) => setShapes(prev => [...prev, shape]);
  const handleRemoteShapeUpdate = (shape) => setShapes(prev => prev.map(s => s.id === shape.id ? shape : s));
  const handleRemoteShapeDelete = (id)    => setShapes(prev => prev.filter(s => s.id !== id));
  const handleRemoteClear = () => {
    canvasRef.current?.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShapes([]);
  };

  const handleRemoteMessage = (msg) => {
    setMessages(prev => [...prev, {
      id:       msg._id || Date.now(),
      type:     msg.type,
      user:     msg.senderName,
      color:    stringToColor(msg.senderName),
      text:     msg.text,
      fileName: msg.fileName,
      fileUrl:  msg.fileUrl,
      time:     formatTime(msg.createdAt || new Date()),
    }]);
  };

  /* ════════════════════════════════════════════════════════
     LOCAL DRAWING — all handlers are top-level functions
     inside the component, NOT nested inside each other.
  ════════════════════════════════════════════════════════ */

  // FIX: single onDown — no duplicate / nested redefinition
  const onDown = (e) => {
    setShowPalette(false);
    setShowBrush(false);
    setSelectedId(null);

    const pos = getXY(e);

    if (tool === "text") {
      const text = prompt("Enter text");
      if (!text) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = color;
      ctx.font = "18px DM Sans";
      ctx.fillText(text, pos.x, pos.y);
      return;
    }

    if (tool === "pencil" || tool === "eraser") {
      saveHistory();
      drawing.current = true;
      lastPos.current = pos;
      strokeBounds.current = { minX: pos.x, minY: pos.y, maxX: pos.x, maxY: pos.y };
      const ctx = canvasRef.current.getContext("2d");
      if (tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    } else if (SHAPE_TOOLS.includes(tool)) {
      shapeStart.current = pos;
    }
  };

  const onMove = (e) => {
    if (!drawing.current && !shapeStart.current && !dragInfo && !resizeInfo) return;

    const pos = getXY(e);

    if (drawing.current) {
      const b = strokeBounds.current;
      b.minX = Math.min(b.minX, pos.x); b.minY = Math.min(b.minY, pos.y);
      b.maxX = Math.max(b.maxX, pos.x); b.maxY = Math.max(b.maxY, pos.y);

      const ctx = canvasRef.current.getContext("2d");
      if (tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth   = brushSize * 3;
        ctx.lineCap     = "round"; ctx.lineJoin = "round";
        ctx.stroke(); ctx.restore();
        emit("draw:erase", { roomId, eraseData: { fromX: lastPos.current.x, fromY: lastPos.current.y, toX: pos.x, toY: pos.y, lineWidth: brushSize * 3 } });
      } else {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth   = brushSize;
        ctx.lineCap     = "round"; ctx.lineJoin = "round";
        ctx.stroke();
        emit("draw:stroke", { roomId, strokeData: { fromX: lastPos.current.x, fromY: lastPos.current.y, toX: pos.x, toY: pos.y, color, lineWidth: brushSize } });
      }
      lastPos.current = pos;

    } else if (shapeStart.current && SHAPE_TOOLS.includes(tool)) {
      const { x: sx, y: sy } = shapeStart.current;
      setShapeDraft({ type: tool, x: Math.min(sx, pos.x), y: Math.min(sy, pos.y), w: Math.abs(pos.x - sx), h: Math.abs(pos.y - sy), color, strokeWidth: brushSize });

    } else if (dragInfo) {
      setShapes(prev => prev.map(s => s.id === dragInfo.id ? { ...s, x: pos.x - dragInfo.ox, y: pos.y - dragInfo.oy } : s));

    } else if (resizeInfo) {
      const dx = pos.x - resizeInfo.ox, dy = pos.y - resizeInfo.oy;
      setShapes(prev => prev.map(s => s.id === resizeInfo.id ? { ...s, w: Math.max(20, resizeInfo.origW + dx), h: Math.max(20, resizeInfo.origH + dy) } : s));
    }
  };

  const onUp = async (e) => {
  const wasDrawing = drawing.current;
  const hadShape = shapeStart.current;

  drawing.current = false;

  const pos = e ? getXY(e) : lastPos.current;

  if (wasDrawing && tool === "pencil" && shapeSnap && pos) {
    const b = strokeBounds.current;
    if ((b.maxX - b.minX) > 30 && (b.maxY - b.minY) > 30) {
      await runShapeSnap(b);
    }
  }

  if (hadShape && SHAPE_TOOLS.includes(tool) && pos) {
    const { x: sx, y: sy } = hadShape;

    let newShape = null;

    // ✅ LINE TOOL (start point must stay fixed)
    if (tool === "line") {
      newShape = {
        id: shapeIdCounter++,
        type: "line",
        x: sx,
        y: sy,
        w: pos.x - sx,
        h: pos.y - sy,
        color,
        strokeWidth: brushSize
      };
    }

    // ✅ OTHER SHAPES (rectangle, circle, triangle)
    else {
      const x = Math.min(sx, pos.x);
      const y = Math.min(sy, pos.y);
      const w = Math.abs(pos.x - sx);
      const h = Math.abs(pos.y - sy);

      if (w >= 10 && h >= 10) {
        newShape = {
          id: shapeIdCounter++,
          type: tool,
          x,
          y,
          w,
          h,
          color,
          strokeWidth: BRUSH_SIZES[brushIdx]
        };
      }
    }

    if (newShape) {
      setShapes(prev => [...prev, newShape]);
      setSelectedId(newShape.id);
      emit("draw:shape_add", { roomId, shape: newShape });
    }

    setShapeDraft(null);
    shapeStart.current = null;
  }

  if (dragInfo) {
    const moved = shapes.find(s => s.id === dragInfo.id);
    if (moved) emit("draw:shape_update", { roomId, shape: moved });
    setDragInfo(null);
  }

  if (resizeInfo) {
    const resized = shapes.find(s => s.id === resizeInfo.id);
    if (resized) emit("draw:shape_update", { roomId, shape: resized });
    setResizeInfo(null);
  }

  lastPos.current = null;
};
  const onLeaveCanvas = () => {
    if (drawing.current) {
      drawing.current = false;
      lastPos.current = null;
    }
    if (shapeStart.current) {
      setShapeDraft(null);
      shapeStart.current = null;
    }
    setDragInfo(null);
    setResizeInfo(null);
  };

  /* ════════════════════════════════════════════════════════
     SHAPE SNAP via Claude Vision API
  ════════════════════════════════════════════════════════ */
  const runShapeSnap = async (b) => {
    setSnapStatus("🔍 Detecting shape…"); setSnapError("");
    try {
      const pad = 24, canvas = canvasRef.current;
      const cropX = Math.max(0, b.minX - pad);
      const cropY = Math.max(0, b.minY - pad);
      const cropW = Math.min(canvas.width  - cropX, (b.maxX - b.minX) + pad * 2);
      const cropH = Math.min(canvas.height - cropY, (b.maxY - b.minY) + pad * 2);
      const off   = document.createElement("canvas");
      off.width = cropW; off.height = cropH;
      const octx = off.getContext("2d");
      octx.fillStyle = "#FFFFFF"; octx.fillRect(0, 0, cropW, cropH);
      octx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const base64 = off.toDataURL("image/png").split(",")[1];

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 150,
          messages: [{
            role: "user", content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
              { type: "text",  text: `Identify the primary shape. Reply ONLY with JSON: {"shape":"<type>","confidence":<0-1>}\nAllowed: "rectangle","circle","ellipse","triangle","line","none". Be generous.` },
            ]
          }],
        }),
      });
      const data = await res.json();
      const { shape, confidence } = JSON.parse((data?.content?.[0]?.text || "").trim().replace(/```json|```/g, ""));

      if (!shape || shape === "none" || confidence < 0.45) {
        setSnapStatus("💬 No clear shape detected");
        setTimeout(() => setSnapStatus(""), 2500); return;
      }

      saveHistory();
      const ctx = canvas.getContext("2d"), ep = brushSize + 8;
      ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(b.minX - ep, b.minY - ep, (b.maxX - b.minX) + ep * 2, (b.maxY - b.minY) + ep * 2);
      ctx.restore();

      const type     = shape === "ellipse" ? "circle" : shape;
      const newShape = { id: shapeIdCounter++, type, x: b.minX, y: b.minY, w: b.maxX - b.minX, h: b.maxY - b.minY, color, strokeWidth: brushSize };
      setShapes(prev => [...prev, newShape]);
      emit("draw:shape_add", { roomId, shape: newShape });

      setSnapStatus(`✨ Snapped to ${shape[0].toUpperCase() + shape.slice(1)}!`);
      setTimeout(() => setSnapStatus(""), 3000);
    } catch (err) {
      setSnapStatus(""); setSnapError("⚠️ Shape Snap failed");
      setTimeout(() => setSnapError(""), 3500);
    }
  };

  /* ════════════════════════════════════════════════════════
     UNDO / REDO / CLEAR / SAVE
  ════════════════════════════════════════════════════════ */
  const undo = () => {
    if (!historyRef.current.length) return;
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    redoRef.current.push(canvas.toDataURL());
    const img = new Image();
    img.src = historyRef.current.pop();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
  };

  const redo = () => {
    if (!redoRef.current.length) return;
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    historyRef.current.push(canvas.toDataURL());
    const img = new Image();
    img.src = redoRef.current.pop();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
  };

  const clearBoard = () => {
    saveHistory();
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShapes([]); setSelectedId(null); setShowClear(false);
    emit("draw:clear", { roomId });
    toast.success("Board cleared");
  };

  const saveBoard = () => {
    const dataUrl = exportBoardAsPNG(canvasRef.current, shapes);
    const link    = document.createElement("a");
    link.download = `collabboard-${roomId}.png`;
    link.href     = dataUrl;
    link.click();
    toast.success("Board saved as PNG!");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  /* ════════════════════════════════════════════════════════
     SCREEN SHARE
  ════════════════════════════════════════════════════════ */
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video  = document.createElement("video");
      video.srcObject = stream;
      video.play();
      toast.success("Screen sharing started");
    } catch (err) {
      toast.error("Screen share failed");
    }
  };

  /* ════════════════════════════════════════════════════════
     CHAT
  ════════════════════════════════════════════════════════ */
  const sendMsg = () => {
    if (!chatInput.trim()) return;
    emit("chat:message", { roomId, senderId: user._id, senderName: user.name, text: chatInput.trim(), type: "text" });
    emit("chat:stop_typing", { roomId });
    setChatInput("");
  };

  const handleTyping = (val) => {
    setChatInput(val);
    emit("chat:typing", { roomId, name: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emit("chat:stop_typing", { roomId }), 1500);
  };

  const handleFileShare = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await roomService.uploadFile(roomId, file);
      emit("chat:message", { roomId, senderId: user._id, senderName: user.name, text: "", type: "file", fileUrl: uploaded.fileUrl, fileName: uploaded.fileName });
      toast.success("File shared!");
    } catch {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ════════════════════════════════════════════════════════
     AI BOARD ANALYSIS
  ════════════════════════════════════════════════════════ */
  const runAI = async (action) => {
    setAiLoading(true); setAiResult("");
    try {
      const base64  = exportBoardAsPNG(canvasRef.current, shapes).split(",")[1];
      const prompts = {
        "Summarise":     "Describe what is drawn on this whiteboard in 2-3 brief bullet points. Start each with an emoji.",
        "Suggest Ideas": "Based on the content drawn, suggest 3 ideas to extend this diagram. Be concise.",
        "Auto Layout":   "Describe a cleaner layout for these shapes and content. Be concise.",
        "Fix Text":      "If there is any text visible, suggest corrections. Otherwise say 'No text found.'",
      };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 300,
          messages: [{
            role: "user", content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
              { type: "text",  text: prompts[action] || prompts["Summarise"] },
            ]
          }],
        }),
      });
      const data = await res.json();
      setAiResult(data?.content?.[0]?.text?.trim() || "No response.");
    } catch {
      setAiResult("⚠️ Failed to connect. Please try again.");
    }
    setAiLoading(false);
  };

  /* ════════════════════════════════════════════════════════
     SHAPE DELETE
  ════════════════════════════════════════════════════════ */
  const deleteShape = (id) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    setSelectedId(null);
    emit("draw:shape_delete", { roomId, shapeId: id });
  };

  /* ════════════════════════════════════════════════════════
     SMALL SUB-COMPONENTS
  ════════════════════════════════════════════════════════ */
  const Divider = () => <div style={{ width: 26, height: 1, background: BORDER, margin: "4px 0" }} />;

  const ToolBtn = ({ id, icon, label, onClick, forceActive }) => {
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

  const canvasCursor = tool === "eraser" ? "cell" : tool === "pencil" ? "crosshair" : SHAPE_TOOLS.includes(tool) ? "crosshair" : "default";

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif", background: BG, color: TMAIN, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Nunito:wght@800;900&family=Caveat:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#D4C4A8;border-radius:4px;}
        .tb-btn:hover{background:#F5F2EE !important;color:${TMAIN} !important;}
        .msg-inp:focus{outline:none;border-color:#8B5CF6 !important;box-shadow:0 0 0 3px rgba(139,92,246,.12) !important;}
        .bot-btn:hover{background:#F5F2EE !important;border-color:#D4C8BC !important;}
        .ai-act:hover{background:#EDE9FE !important;border-color:#8B5CF6 !important;}
        .stab:hover{color:#8B5CF6 !important;}
        @keyframes popUp{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .pop-up{animation:popUp .22s cubic-bezier(.34,1.56,.64,1) forwards;}
        .slide-in{animation:slideIn .18s ease forwards;}
        .pulsing{animation:pulse 1.2s ease infinite;}
        .snap-on{background:linear-gradient(135deg,#8B5CF6,#A78BFA) !important;color:#fff !important;border-color:transparent !important;box-shadow:0 3px 12px rgba(139,92,246,.35) !important;}
        .pdiv{border:none;border-top:2px dashed rgba(139,92,246,.2);width:100%;}
      `}</style>

      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div style={{ height: 54, display: "flex", alignItems: "center", padding: "0 14px", gap: 4, flexShrink: 0, background: WB_PANEL, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 8px rgba(0,0,0,.04)", zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 10, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(139,92,246,.28)" }}>
            <Pencil size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 17, color: "#2D1B69", letterSpacing: "-0.3px" }}>CollabBoard</span>
        </div>

        {["File", "Editing"].map((m, i) => (
          <button key={m} className="tb-btn" style={{ padding: "5px 11px", borderRadius: 8, border: "none", background: i === 1 ? "#EDE9FE" : "transparent", color: i === 1 ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, transition: "all .15s" }}>
            {i === 1 && <Pencil size={12} strokeWidth={2} />}{m}
          </button>
        ))}

        <div style={{ display: "flex", gap: 1, marginLeft: 2, padding: "2px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#F8F5F0" }}>
          <button className="tb-btn" onClick={undo} title="Undo" style={{ padding: 6, borderRadius: 7, border: "none", background: "transparent", color: TSUB, cursor: "pointer", display: "flex" }}><Undo2 size={15} strokeWidth={2} /></button>
          <button className="tb-btn" onClick={redo} title="Redo" style={{ padding: 6, borderRadius: 7, border: "none", background: "transparent", color: TSUB, cursor: "pointer", display: "flex" }}><Redo2 size={15} strokeWidth={2} /></button>
        </div>

        {/* Shape Snap */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <button className={shapeSnap ? "snap-on" : ""} onClick={() => { setShapeSnap(s => !s); setSnapStatus(""); setSnapError(""); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#F8F5F0", color: TSUB, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all .2s" }}>
            <Wand2 size={14} strokeWidth={2} />{shapeSnap ? "Shape Snap ON" : "Shape Snap"}
          </button>
          {snapStatus && <div className="pulsing" style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", background: "#EDE9FE", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(139,92,246,.2)" }}>{snapStatus}</div>}
          {snapError  && <div style={{ fontSize: 12, fontWeight: 700, color: "#B91C1C", background: "#FEF2F2", padding: "4px 12px", borderRadius: 20, border: "1px solid #FECACA" }}>{snapError}</div>}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={copyRoomId} title="Copy Room ID"
            style={{ background: "#F0EBFF", border: "1px solid #DDD0F7", color: "#8B5CF6", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8, letterSpacing: "0.5px", fontFamily: "'Nunito',sans-serif", cursor: "pointer" }}>
            {roomId}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 2px 10px rgba(139,92,246,.28)" }}>
            <Share2 size={14} strokeWidth={2.5} /> Share
          </button>
          <button onClick={onLeave}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 10, border: "1px solid #FECACA", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
            onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
            onMouseLeave={e => e.currentTarget.style.background = "#FFF5F5"}>
            <LogOut size={14} strokeWidth={2} /> Leave
          </button>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* ── LEFT TOOLBAR ──────────────────────────────── */}
          <div style={{
    position: "fixed",
    left: 12,
    top: 70,          // space below top bar
    bottom: 70,       // space above bottom bar
    zIndex: 20,
    background: "#FFF",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,.08)",
    padding: "10px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    justifyContent: "center"

  }}>          {WB_TOOLS.map(t => <ToolBtn key={t.id} {...t} />)}
          <Divider />
          <ToolBtn id="ai" icon={<Sparkles size={17} strokeWidth={2} />} label="AI Assistant"
            onClick={() => { setShowAI(true); setShowPalette(false); setShowBrush(false); }} forceActive={showAI} />
          <Divider />

          {/* Colour picker */}
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

          {/* Brush size — FIX: single range input, not mapped array */}
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
          <ToolBtn id="ux" icon={<Undo2 size={17} strokeWidth={2} />} label="Undo" onClick={undo} forceActive={false} />
          <ToolBtn id="rx" icon={<Redo2 size={17} strokeWidth={2} />} label="Redo" onClick={redo} forceActive={false} />
          <Divider />
          <button title="Clear Board" onClick={() => setShowClear(true)}
            style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid transparent", background: "transparent", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
            <Trash2 size={17} strokeWidth={2} />
          </button>
        </div>

        {/* ── CANVAS AREA ───────────────────────────────── */}
        <div ref={scrollRef} onScroll={onScroll}
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", cursor: canvasCursor }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onLeaveCanvas}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>

          {/* dot grid background */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(180,165,145,.45) 1.5px,transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0, minHeight: canvasH }} />

          {/* page dividers */}
          {Array.from({ length: canvasPages - 1 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", top: (i + 1) * PAGE_H, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
              <hr className="pdiv" />
              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(139,92,246,.4)", padding: "2px 0", userSelect: "none" }}>Page {i + 2}</div>
            </div>
          ))}

          {/* shape snap hint */}
          {shapeSnap && !snapStatus && !snapError && (
            <div style={{ position: "sticky", top: 16, left: "50%", transform: "translateX(-50%)", width: "fit-content", background: "linear-gradient(135deg,#EDE9FE,#F5F0FF)", border: "1px solid rgba(139,92,246,.25)", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#6D28D9", zIndex: 5, pointerEvents: "none", whiteSpace: "nowrap", display: "block", textAlign: "center" }}>
              🪄 Shape Snap ON — draw any shape and AI will correct it
            </div>
          )}

          {/* freehand canvas */}
          <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1, touchAction: "none" }} />

          {/* shape preview canvas */}
          <canvas ref={previewRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 2, pointerEvents: "none" }} />

          {/* draft shape while drawing */}
          {shapeDraft && (
            <svg style={{ position: "absolute", top: 0, left: 0, zIndex: 6, pointerEvents: "none", width: "100%", height: canvasH }}>
              <ShapeSVG s={{ ...shapeDraft, id: -1 }} draft />
            </svg>
          )}

          {/* SVG shapes layer */}
          <svg style={{ position: "absolute", top: 0, left: 0, zIndex: 5, width: "100%", height: canvasH, overflow: "visible" }}
            onMouseDown={e => { if (e.target.tagName === "svg") setSelectedId(null); }}>
            {shapes.map(s => (
              <ShapeEl key={s.id} s={s} selected={selectedId === s.id}
                onSelect={() => setSelectedId(s.id)}
                onDragStart={(ox, oy) => setDragInfo({ id: s.id, ox, oy })}
                onResizeStart={(ox, oy) => setResizeInfo({ id: s.id, ox, oy, origW: s.w, origH: s.h })}
                onDelete={() => deleteShape(s.id)} />
            ))}
          </svg>

          <div style={{ height: canvasH, minHeight: canvasH, pointerEvents: "none" }} />
        </div>

        {/* ── SIDEBAR TOGGLE ────────────────────────────── */}
        <button onClick={() => setSidebarOpen(o => !o)}
          style={{ position: "absolute", right: sidebarOpen ? 296 : 12, top: "50%", transform: "translateY(-50%)", width: 22, height: 44, borderRadius: "8px 0 0 8px", border: `1px solid ${BORDER}`, borderRight: "none", background: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TSUB, zIndex: 25, transition: "right .25s", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          {sidebarOpen ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
        </button>

        {/* ── RIGHT SIDEBAR ─────────────────────────────── */}
        <div style={{ width: sidebarOpen ? 300 : 0, overflow: "hidden", flexShrink: 0, transition: "width .25s ease", background: WB_PANEL, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", zIndex: 20 }}>
          <div style={{ width: 300, height: "100%", display: "flex", flexDirection: "column" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              {[
                { id: "chat",  icon: <MessageSquare size={14} strokeWidth={2} />, label: "Chat" },
                { id: "users", icon: <Users          size={14} strokeWidth={2} />, label: "People" },
              ].map(t => (
                <button key={t.id} className="stab" onClick={() => setSidebarTab(t.id)}
                  style={{ flex: 1, padding: "11px 6px", border: "none", background: "transparent", borderBottom: sidebarTab === t.id ? "2px solid #8B5CF6" : "2px solid transparent", color: sidebarTab === t.id ? "#8B5CF6" : TSUB, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all .15s" }}>
                  {t.icon}{t.label}
                  {t.id === "chat" && messages.length > 0 && <span style={{ background: "#8B5CF6", color: "#fff", borderRadius: 10, fontSize: 9, fontWeight: 800, padding: "1px 5px" }}>{messages.length}</span>}
                </button>
              ))}
            </div>

            {/* ── CHAT TAB ──────────────────────────────── */}
            {sidebarTab === "chat" && <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "'Caveat',cursive", color: TSUB, fontSize: 16 }}>No messages yet — say hi! 👋</div>
                )}
                {messages.map(m => (
                  <div key={m.id} className="slide-in">
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 800, flexShrink: 0 }}>{m.user[0]}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.user}</span>
                      <span style={{ fontSize: 10, color: TSUB }}>{m.time}</span>
                    </div>
                    {m.type === "text" && (
                      <div style={{ fontSize: 13, color: TMAIN, paddingLeft: 28, lineHeight: 1.55 }}>{m.text}</div>
                    )}
                    {m.type === "file" && (
                      <a href={m.fileUrl} target="_blank" rel="noreferrer"
                        style={{ marginLeft: 28, display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "#F5F0FF", border: "1px solid #DDD0F7", cursor: "pointer", textDecoration: "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#EDE9FE"}
                        onMouseLeave={e => e.currentTarget.style.background = "#F5F0FF"}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={14} color="#8B5CF6" strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: TMAIN, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fileName}</div>
                          <div style={{ fontSize: 11, color: TSUB }}>Click to open</div>
                        </div>
                        <Check size={13} color="#22C55E" strokeWidth={2.5} />
                      </a>
                    )}
                  </div>
                ))}
                {typing && <div style={{ fontSize: 12, color: TSUB, fontStyle: "italic", paddingLeft: 4 }}>{typing}</div>}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 7, flexShrink: 0 }}>
                <input className="msg-inp" value={chatInput}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
                  placeholder="Type a message…"
                  style={{ flex: 1, padding: "8px 11px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#F8F5F0", color: TMAIN, fontSize: 13, transition: "border-color .2s" }} />
                <button title={uploading ? "Uploading…" : "Attach File"}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${BORDER}`, background: uploading ? "#EDE9FE" : "#F8F5F0", color: uploading ? "#8B5CF6" : TSUB, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}
                  onMouseEnter={e => { if (!uploading) { e.currentTarget.style.background = "#EDE9FE"; e.currentTarget.style.color = "#8B5CF6"; } }}
                  onMouseLeave={e => { if (!uploading) { e.currentTarget.style.background = "#F8F5F0"; e.currentTarget.style.color = TSUB; } }}>
                  <Paperclip size={15} strokeWidth={2} />
                </button>
                <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileShare} />
                <button onClick={sendMsg}
                  style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Send size={14} strokeWidth={2.5} />
                </button>
              </div>
            </>}

            {/* ── PEOPLE TAB ────────────────────────────── */}
            {sidebarTab === "users" && (
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: TSUB, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
                  Online — {onlineUsers.length}
                </p>
                {onlineUsers.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "'Caveat',cursive", color: TSUB, fontSize: 16 }}>Just you here 👀</div>
                )}
                {onlineUsers.map((u, i) => (
                  <div key={u.socketId || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "#F8F5F0", border: `1px solid ${BORDER}` }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: stringToColor(u.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: "#22C55E", border: `2px solid ${WB_PANEL}` }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TMAIN }}>{u.name}{u.userId === user?._id && " (You)"}</div>
                      <div style={{ fontSize: 11, color: TSUB }}>{u.userId === roomInfo?.hostId?._id || u.userId === roomInfo?.hostId ? "Host" : "Member"}</div>
                    </div>
                    {(u.userId === roomInfo?.hostId?._id || u.userId === roomInfo?.hostId) && (
                      <div style={{ background: "#EDE9FE", color: "#8B5CF6", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.5px" }}>HOST</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────── */}
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

      {/* ── AI PANEL ────────────────────────────────────── */}
      {showAI && (
        <div className="pop-up" style={{ position: "fixed", bottom: 64, right: sidebarOpen ? 308 : 16, width: 296, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,.13)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={14} color="#fff" strokeWidth={2} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 14, color: TMAIN }}>AI Assistant</span>
              <span style={{ background: "#D4F0E2", color: "#15803D", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.5px" }}>BETA</span>
            </div>
            <button onClick={() => setShowAI(false)} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}><X size={15} strokeWidth={2} /></button>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[{ icon: "📋", label: "Summarise" }, { icon: "🎨", label: "Auto Layout" }, { icon: "💡", label: "Suggest Ideas" }, { icon: "✍️", label: "Fix Text" }].map(a => (
                <button key={a.label} className="ai-act" onClick={() => runAI(a.label)}
                  style={{ padding: "10px 8px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#F8F5F0", color: TMAIN, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all .15s" }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span><span>{a.label}</span>
                </button>
              ))}
            </div>
            {aiLoading && <div style={{ padding: 12, borderRadius: 10, background: "#EDE9FE", border: "1px solid rgba(139,92,246,.2)", textAlign: "center", color: "#8B5CF6", fontSize: 13, fontWeight: 600 }}>✨ Analysing your board…</div>}
            {aiResult  && <div style={{ padding: 12, borderRadius: 10, background: "#F0FDF4", border: "1px solid rgba(34,197,94,.2)", fontSize: 12, color: "#065F46", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{aiResult}</div>}
          </div>
        </div>
      )}

      {/* ── NOTES PANEL ─────────────────────────────────── */}
      {showNotes && (
        <div className="pop-up" style={{ position: "fixed", bottom: 56, left: 14, width: 300, background: "#FFFDE7", border: `1px solid #E8D84A`, borderRadius: 4, boxShadow: "4px 6px 0 #DDD09A,0 16px 40px rgba(0,0,0,.14)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", width: 52, height: 18, borderRadius: 4, background: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.9)" }} />
          <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid rgba(0,0,0,.07)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: 16, color: "#5C4A1A" }}>📝 Quick Notes</span>
            <button onClick={() => setShowNotes(false)} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}><X size={14} strokeWidth={2} /></button>
          </div>
          <div style={{ padding: "10px 14px 14px" }}>
            <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
              placeholder="Jot something down…"
              style={{ width: "100%", height: 130, resize: "none", border: "none", background: "transparent", fontFamily: "'Caveat',cursive", fontSize: 15, color: "#3D3020", lineHeight: 1.7, outline: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: TSUB }}>{notesText.length} chars</span>
              <button onClick={() => setNotesText("")}
                style={{ fontSize: 11, color: TSUB, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TIMER PANEL ─────────────────────────────────── */}
      {showTimer && (
        <div className="pop-up" style={{ position: "fixed", bottom: 56, left: showNotes ? 326 : 14, width: 230, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: "0 16px 40px rgba(0,0,0,.12)", zIndex: 100, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Timer size={14} color="#8B5CF6" strokeWidth={2} />
              <span style={{ fontWeight: 800, fontSize: 13, color: TMAIN }}>Session Timer</span>
            </div>
            <button onClick={() => setShowTimer(false)} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}><X size={14} strokeWidth={2} /></button>
          </div>
          <div style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 46, letterSpacing: "-1px", color: timerSecs < 60 ? "#EF4444" : timerSecs < 120 ? "#F97316" : "#8B5CF6", lineHeight: 1, marginBottom: 12 }}>
              {fmtTime(timerSecs)}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: TSUB, fontWeight: 600 }}>Minutes</span>
              <input type="number" min="1" max="120" value={timerInput}
                onChange={e => { setTimerInput(e.target.value); if (!timerRunning) { const m = parseInt(e.target.value) || 5; setTimerSecs(m * 60); } }}
                style={{ width: 56, padding: "5px 8px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 13, fontWeight: 700, color: TMAIN, textAlign: "center", outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
              <button onClick={timerRunning ? () => setTimerRunning(false) : startTimer}
                style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: timerRunning ? "#FEF2F2" : "linear-gradient(135deg,#8B5CF6,#A78BFA)", color: timerRunning ? "#EF4444" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
                {timerRunning ? "Pause" : "Start"}
              </button>
              <button onClick={resetTimer}
                style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLEAR CONFIRM ───────────────────────────────── */}
      {showClear && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,20,10,.28)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div className="pop-up" style={{ background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 28px 22px", width: 310, textAlign: "center", boxShadow: "0 16px 48px rgba(0,0,0,.12)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Trash2 size={20} color="#EF4444" strokeWidth={2} /></div>
            <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 18, color: TMAIN, marginBottom: 8 }}>Clear the board?</h3>
            <p style={{ fontSize: 13, color: TSUB, marginBottom: 20, lineHeight: 1.5 }}>This will erase all drawings and shapes for everyone. Cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowClear(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: TSUB, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Cancel</button>
              <button onClick={clearBoard} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Clear Board</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SVG SHAPE HELPERS  (outside the main component)
════════════════════════════════════════════════════════ */
function ShapeEl({ s, selected, onSelect, onDragStart, onResizeStart, onDelete }) {
  return (
    <g>
      <ShapeSVG s={s} selected={selected}
        onMouseDown={e => { e.stopPropagation(); onSelect(); onDragStart(e.clientX - s.x, e.clientY - s.y); }} />
      {selected && <>
        <rect x={s.x - 6} y={s.y - 6} width={s.w + 12} height={s.h + 12} rx={6}
          fill="none" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.7} pointerEvents="none" />
        <g transform={`translate(${s.x + s.w + 2},${s.y - 14})`} style={{ cursor: "pointer" }}
          onClick={e => { e.stopPropagation(); onDelete(); }}>
          <circle r={8} fill="#EF4444" stroke="#fff" strokeWidth={1.5} />
          <line x1={-4} y1={-4} x2={4} y2={4} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={4} y1={-4} x2={-4} y2={4} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
        </g>
        <rect x={s.x + s.w - 6} y={s.y + s.h - 6} width={12} height={12} rx={3}
          fill="#8B5CF6" stroke="#fff" strokeWidth={1.5} style={{ cursor: "nwse-resize" }}
          onMouseDown={e => { e.stopPropagation(); onResizeStart(e.clientX, e.clientY); }} />
        <g transform={`translate(${s.x + s.w / 2},${s.y - 14})`} pointerEvents="none" opacity={0.7}>
          <circle r={8} fill="#8B5CF6" stroke="#fff" strokeWidth={1.5} />
          <text textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#fff" fontWeight="bold">✥</text>
        </g>
      </>}
    </g>
  );
}

function ShapeSVG({ s, selected, onMouseDown, draft }) {
  const props = {
    fill: "none", stroke: s.color, strokeWidth: s.strokeWidth,
    strokeLinecap: "round", strokeLinejoin: "round",
    style: { cursor: selected ? "move" : draft ? "crosshair" : "grab" },
    onMouseDown,
  };
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  if (s.type === "rect")     return <rect    x={s.x} y={s.y} width={s.w} height={s.h} {...props} />;
  if (s.type === "circle")   return <ellipse cx={cx} cy={cy} rx={Math.abs(s.w / 2)} ry={Math.abs(s.h / 2)} {...props} />;
  if (s.type === "triangle") return <polygon points={`${cx},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`} {...props} />;
  if (s.type === "line")     return <line x1={s.x} y1={s.y} x2={s.x + s.w} y2={s.y + s.h} {...props} />;
  return null;
}