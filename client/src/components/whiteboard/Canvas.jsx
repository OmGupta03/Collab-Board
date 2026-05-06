import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket.js";
import { exportBoardAsPNG } from "../../utils/canvasUtils.js";
import toast from "react-hot-toast";

import TopBar from './TopBar';
import Toolbar from './Toolbar';
import Sidebar from '../sidebar/Sidebar';
import BottomBar from './BottomBar';
import ShapeLayer from './ShapeLayer';
import AIPanel from './AIPanel';
import NotesPanel from './NotesPanel';
import TimerPanel from './TimerPanel';
import ClearModal from './ClearModal';
import FileShareModal from './FileShareModal';
import { aiService } from "../../services/aiService";
import { SHAPE_TOOLS, PAGE_H, BG, TMAIN, BORDER, TSUB, BRUSH_SIZES } from './constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import useTimer from '../../hooks/useTimer';
import useWhiteboardRoom from '../../hooks/useWhiteboardRoom';
import useShapes from '../../hooks/useShapes';
import useSocketEvents from '../../hooks/useSocketEvents';
import useCanvasDrawing from '../../hooks/useCanvasDrawing';
import { roomService } from "../../services/roomService.js";

export default function WhiteboardRoom({ roomId, user, onLeave }) {
  /* ── canvas refs ──────────────────────────────────────── */
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const previewRef = useRef(null);

  /* ── tool state ───────────────────────────────────────── */
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#1E1A14");
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [showPalette, setShowPalette] = useState(false);
  const [showBrush, setShowBrush] = useState(false);

  /* ── sidebar state ────────────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("chat");

  /* ── chat state ───────────────────────────────────────── */
  const [chatInput, setChatInput] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ── AI & UI state ────────────────────────────────────── */
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [showClear, setShowClear] = useState(false);
  const [shapeSnap, setShapeSnap] = useState(false);
  const [snapStatus, setSnapStatus] = useState("");
  const [snapError, setSnapError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [showTimer, setShowTimer] = useState(false);

  /* ── Custom Hooks ───────────────────────────────────── */
  const { emit, on, off } = useSocket();

  const { timerSecs, timerRunning, timerInput, setTimerInput, setTimerRunning, startTimer, resetTimer } = useTimer();

  const { roomInfo, messages, setMessages, onlineUsers, setOnlineUsers, typing, setTyping, typingTimer, stringToColor } = useWhiteboardRoom({ roomId });

  const { shapes, setShapes, selectedId, setSelectedId, dragInfo, setDragInfo, resizeInfo, setResizeInfo, shapeDraft, setShapeDraft, deleteShapeLocally } = useShapes();

  const { canvasPages, canvasH, onScroll, onDown, onMove, onUp, onLeaveCanvas, undo, redo, clearBoard } = useCanvasDrawing({
    canvasRef, previewRef, scrollRef,
    tool, color, brushSize, shapeSnap,
    setSnapStatus, setSnapError,
    shapes, setShapes,
    selectedId, setSelectedId,
    shapeDraft, setShapeDraft,
    dragInfo, setDragInfo,
    resizeInfo, setResizeInfo,
    emit, roomId
  });

  useSocketEvents({
    roomId, on, off, canvasRef, setShapes, setMessages, setTyping, typingTimer, setOnlineUsers, stringToColor
  });

  const initialLoaded = useRef(false);

  useEffect(() => {
    if (roomInfo && !initialLoaded.current) {
      initialLoaded.current = true;
      if (roomInfo.shapes && roomInfo.shapes.length > 0) {
        setShapes(roomInfo.shapes);
      }
      if (roomInfo.history && roomInfo.history.length > 0) {
        const lastBase64 = roomInfo.history[roomInfo.history.length - 1];
        if (lastBase64) {
          const img = new Image();
          img.src = lastBase64;
          img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
            }
          };
        }
      }
    }
  }, [roomInfo, setShapes]);

  /* ════════════════════════════════════════════════════════
     LOCAL HANDLERS
  ════════════════════════════════════════════════════════ */
  /* ── local helpers ────────────────────────────────────── */
  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ── local handlers ────────────────────────────────────── */

  const saveBoard = () => {
    const dataUrl = exportBoardAsPNG(canvasRef.current, shapes);
    const link = document.createElement("a");
    link.download = `collabboard-${roomId}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Board saved as PNG!");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      toast.success("Screen sharing started");
    } catch {
      toast.error("Screen share failed");
    }
  };

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

  const runAI = async (action) => {
    setAiLoading(true); setAiResult("");
    try {
      const base64 = exportBoardAsPNG(canvasRef.current, shapes).split(",")[1];

      if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
        console.warn("No Anthropic API Key - using Mock AI Response");
        await new Promise(r => setTimeout(r, 1200));
        setAiResult("This is a mocked AI response because the VITE_ANTHROPIC_API_KEY is missing in your .env file.\n\n- It looks like a great whiteboard session! 🎨\n- I can see your shapes and lines.\n- To experience the real AI features, add your Anthropic API key to the client/.env file.");
        setAiLoading(false);
        return;
      }

      const data = await aiService.analyzeBoard(base64, action);
      setAiResult(data.result);
    } catch (err) {
      console.error(err);
      setAiResult(`⚠️ ${err.message || "Failed to connect. Please try again."}`);
    }
    setAiLoading(false);
  };

  const deleteShape = (id) => {
    deleteShapeLocally(id);
    emit("draw:shape_delete", { roomId, shapeId: id });
  };

  const canvasCursor = tool === "eraser" ? "cell" : tool === "pencil" || SHAPE_TOOLS.includes(tool) ? "crosshair" : "default";

  const handleClearConfirm = () => {
    clearBoard();
    setShowClear(false);
  };

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

      <TopBar
        roomId={roomId} onLeave={onLeave} onUndo={undo} onRedo={redo}
        shapeSnap={shapeSnap} onToggleSnap={() => { setShapeSnap(s => !s); setSnapStatus(""); setSnapError(""); }}
        snapStatus={snapStatus} snapError={snapError} onCopyRoomId={copyRoomId}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        <Toolbar
          tool={tool} setTool={setTool} color={color} setColor={setColor}
          brushSize={brushSize} setBrushSize={setBrushSize}
          showPalette={showPalette} setShowPalette={setShowPalette}
          showBrush={showBrush} setShowBrush={setShowBrush}
          showAI={showAI} setShowAI={setShowAI}
          onUndo={undo} onRedo={redo} onClearClick={() => setShowClear(true)}
        />

        <div ref={scrollRef} onScroll={onScroll}
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", cursor: canvasCursor }}
          onMouseDown={(e) => onDown(e, () => { setShowPalette(false); setShowBrush(false); })}
          onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onLeaveCanvas}
          onTouchStart={(e) => onDown(e, () => { setShowPalette(false); setShowBrush(false); })}
          onTouchMove={onMove} onTouchEnd={onUp}>

          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(180,165,145,.45) 1.5px,transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0, minHeight: canvasH }} />

          {Array.from({ length: canvasPages - 1 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", top: (i + 1) * PAGE_H, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
              <hr className="pdiv" />
              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(139,92,246,.4)", padding: "2px 0", userSelect: "none" }}>Page {i + 2}</div>
            </div>
          ))}

          {shapeSnap && !snapStatus && !snapError && (
            <div style={{ position: "sticky", top: 16, left: "50%", transform: "translateX(-50%)", width: "fit-content", background: "linear-gradient(135deg,#EDE9FE,#F5F0FF)", border: "1px solid rgba(139,92,246,.25)", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, color: "#6D28D9", zIndex: 5, pointerEvents: "none", whiteSpace: "nowrap", display: "block", textAlign: "center" }}>
              🪄 Shape Snap ON — draw any shape and AI will correct it
            </div>
          )}

          <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1, touchAction: "none" }} />
          <canvas ref={previewRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 2, pointerEvents: "none" }} />

          <ShapeLayer
            shapes={shapes} selectedId={selectedId} shapeDraft={shapeDraft} canvasH={canvasH}
            onSelect={setSelectedId}
            onDragStart={(id, ox, oy) => setDragInfo({ id, ox, oy })}
            onResizeStart={(id, ox, oy, origW, origH) => setResizeInfo({ id, ox, oy, origW, origH })}
            onDelete={deleteShape} onSvgClick={() => setSelectedId(null)}
          />

          <div style={{ height: canvasH, minHeight: canvasH, pointerEvents: "none" }} />
        </div>

        <button onClick={() => setSidebarOpen(o => !o)}
          style={{ position: "absolute", right: sidebarOpen ? 320 : 12, top: "50%", transform: "translateY(-50%)", width: 22, height: 44, borderRadius: "8px 0 0 8px", border: `1px solid ${BORDER}`, borderRight: "none", background: "#FFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: TSUB, zIndex: 30, transition: "right 0.3s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          {sidebarOpen ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
        </button>

        <Sidebar
          open={sidebarOpen} tab={sidebarTab} setTab={setSidebarTab}
          messages={messages} typing={typing} chatEndRef={chatEndRef}
          chatInput={chatInput} onTyping={handleTyping} onSend={sendMsg}
          onFileChange={handleFileShare} uploading={uploading} fileInputRef={fileInputRef}
          onlineUsers={onlineUsers} user={user} roomInfo={roomInfo}
          stringToColor={stringToColor}
        />
      </div>

      <BottomBar
        showNotes={showNotes} setShowNotes={setShowNotes}
        showTimer={showTimer} setShowTimer={setShowTimer} timerRunning={timerRunning} timerSecs={timerSecs}
        startScreenShare={startScreenShare} saveBoard={saveBoard} canvasPages={canvasPages}
        fmtTime={fmtTime}
      />

      {showAI && <AIPanel sidebarOpen={sidebarOpen} onClose={() => setShowAI(false)} onAction={runAI} loading={aiLoading} result={aiResult} />}
      {showNotes && <NotesPanel onClose={() => setShowNotes(false)} notesText={notesText} onChange={setNotesText} />}
      {showTimer && <TimerPanel onClose={() => setShowTimer(false)} timerSecs={timerSecs} timerRunning={timerRunning} timerInput={timerInput} onInputChange={setTimerInput} onStart={startTimer} onPause={() => setTimerRunning(false)} onReset={resetTimer} showNotes={showNotes} />}
      {showClear && <ClearModal onCancel={() => setShowClear(false)} onConfirm={handleClearConfirm} />}
    </div>
  );
}