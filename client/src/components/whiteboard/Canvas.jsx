import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket.js";
import { exportBoardAsPNG } from "../../utils/canvasUtils.js";
import toast from "react-hot-toast";

import TopBar from './TopBar';
import Toolbar from './Toolbar';
import Sidebar from '../sidebar/Sidebar';
import BottomBar from './BottomBar';
import ShapeLayer from './ShapeLayer';
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
import useVideoChat from '../../hooks/useVideoChat';
import { roomService } from "../../services/roomService.js";
import VideoChat from './VideoChat';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const [hasVideoAccess, setHasVideoAccess] = useState(false);
  const [showVideoChat, setShowVideoChat] = useState(true);

  /* ── Custom Hooks ───────────────────────────────────── */
  const { emit, on, off } = useSocket();

  const { timerSecs, timerRunning, timerInput, setTimerInput, pauseTimer, startTimer, resetTimer } = useTimer({ roomId, emit, on, off });

  const { roomInfo, messages, setMessages, onlineUsers, setOnlineUsers, typing, setTyping, typingTimer, stringToColor } = useWhiteboardRoom({ roomId, onLeave });

  const { shapes, setShapes, selectedId, setSelectedId, dragInfo, setDragInfo, resizeInfo, setResizeInfo, shapeDraft, setShapeDraft, deleteShapeLocally } = useShapes();

  const { canvasPages, currentPage, canvasH, onScroll, onDown, onMove, onUp, onLeaveCanvas, undo, redo, clearBoard } = useCanvasDrawing({
    canvasRef, previewRef, scrollRef,
    tool, color, brushSize,
    shapes, setShapes,
    selectedId, setSelectedId,
    shapeDraft, setShapeDraft,
    dragInfo, setDragInfo,
    resizeInfo, setResizeInfo,
    emit, roomId
  });

  useSocketEvents({
    roomId, on, off, canvasRef, setShapes, setMessages, setTyping, typingTimer, setOnlineUsers, stringToColor, user, onLeave
  });

  const { localStream, remoteStreams, isVideoOn, toggleVideo } = useVideoChat({
    roomId, user, socket: { id: useSocket().socket?.id }, emit, on, off
  });

  const hostIdStr = roomInfo?.hostId?._id || roomInfo?.hostId;
  const isHost = user?._id === hostIdStr;
  const finalHasVideoAccess = isHost || hasVideoAccess;
  const hasActiveVideoStreams = !!localStream || Object.keys(remoteStreams).length > 0;

  useEffect(() => {
    const handleGranted = ({ userId }) => {
      if (userId === user._id) {
        setHasVideoAccess(true);
        toast.success("Host granted you video access!");
      }
    };
    const handleRevoked = ({ userId }) => {
      if (userId === user._id) {
        setHasVideoAccess(false);
        if (isVideoOn) toggleVideo();
        toast("Video access revoked by host", { icon: '🚫' });
      }
    };

    on("video:access_granted", handleGranted);
    on("video:access_revoked", handleRevoked);

    return () => {
      off("video:access_granted", handleGranted);
      off("video:access_revoked", handleRevoked);
    };
  }, [on, off, user._id, isVideoOn, toggleVideo]);

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
    if (aiLoading) return;
    setAiLoading(true);
    const toastId = toast.loading("Analyzing and beautifying your diagram...");
    try {
      const base64 = exportBoardAsPNG(canvasRef.current, shapes).split(",")[1];
      const data = await aiService.analyzeBoard(base64, action);

      if (data && data.success && Array.isArray(data.data?.shapes)) {
        const shapesList = data.data.shapes.map((s, index) => ({
          ...s,
          id: String(Date.now() + index + Math.random()),
          color: s.color || color,
          strokeWidth: s.strokeWidth || brushSize || 2
        }));

        // 1. Clear messy raw hand-drawn pixels from the local canvas
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Sync canvas erase/clear to all other participants
          emit("draw:sync_state", { roomId, base64: canvas.toDataURL() });
        }

        // 2. Add vectorized shapes to local state
        setShapes(prev => [...prev, ...shapesList]);

        // 3. Emit draw:shape_add for each shape to sync it with others and save to MongoDB
        shapesList.forEach(shape => {
          emit("draw:shape_add", { roomId, shape });
        });

        // 4. Save the new combined state to drawing history
        setTimeout(() => {
          if (canvasRef.current) {
            emit("draw:save_history", { roomId, base64: exportBoardAsPNG(canvasRef.current, [...shapes, ...shapesList]) });
          }
        }, 100);

        toast.success(`Success! Converted ${shapesList.length} shape(s).`, { id: toastId });
      } else {
        const errDetail = data?.message || "No shapes identified.";
        toast.error(`AI Error: ${errDetail}`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Failed to connect to AI server.";
      toast.error(`⚠️ ${errMsg}`, { id: toastId });
    }
    setAiLoading(false);
  };

  const deleteShape = (id) => {
    deleteShapeLocally(id);
    emit("draw:shape_delete", { roomId, shapeId: id });
  };

  const canvasCursor = !isHost ? "default" : tool === "eraser" ? "cell" : tool === "pencil" || SHAPE_TOOLS.includes(tool) ? "crosshair" : "default";

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
        .pdiv{border:none;border-top:2px dashed rgba(139,92,246,.2);width:100%;}
      `}</style>

      <TopBar
        roomId={roomId} onLeave={onLeave} onUndo={undo} onRedo={redo}
        onCopyRoomId={copyRoomId}
        isHost={isHost}
      />

      {showVideoChat && <VideoChat localStream={localStream} remoteStreams={remoteStreams} />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {isHost && (
          <Toolbar
            tool={tool} setTool={setTool} color={color} setColor={setColor}
            brushSize={brushSize} setBrushSize={setBrushSize}
            showPalette={showPalette} setShowPalette={setShowPalette}
            showBrush={showBrush} setShowBrush={setShowBrush}
            aiLoading={aiLoading} onAIClick={() => runAI("Beautify Board")}
            onUndo={undo} onRedo={redo} onClearClick={() => setShowClear(true)}
          />
        )}

        <div ref={scrollRef} onScroll={onScroll}
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative", cursor: canvasCursor }}
          onMouseDown={(e) => isHost && onDown(e, () => { setShowPalette(false); setShowBrush(false); })}
          onMouseMove={(e) => isHost && onMove(e)} onMouseUp={(e) => isHost && onUp(e)} onMouseLeave={(e) => isHost && onLeaveCanvas(e)}
          onTouchStart={(e) => isHost && onDown(e, () => { setShowPalette(false); setShowBrush(false); })}
          onTouchMove={(e) => isHost && onMove(e)} onTouchEnd={(e) => isHost && onUp(e)}>

          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(180,165,145,.45) 1.5px,transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0, minHeight: canvasH }} />

          {Array.from({ length: canvasPages - 1 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", top: (i + 1) * PAGE_H, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
              <hr className="pdiv" />
              <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "rgba(139,92,246,.4)", padding: "2px 0", userSelect: "none" }}>Page {i + 2}</div>
            </div>
          ))}

          <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 1, touchAction: "none" }} />
          <canvas ref={previewRef} style={{ position: "absolute", top: 0, left: 0, zIndex: 2, pointerEvents: "none" }} />

          <ShapeLayer
            shapes={shapes} selectedId={selectedId} shapeDraft={shapeDraft} canvasH={canvasH}
            onSelect={(id) => isHost && setSelectedId(id)}
            onDragStart={(id, ox, oy) => isHost && setDragInfo({ id, ox, oy })}
            onResizeStart={(id, ox, oy, origW, origH) => isHost && setResizeInfo({ id, ox, oy, origW, origH })}
            onDelete={(id) => isHost && deleteShape(id)}
            onSvgClick={() => isHost && setSelectedId(null)}
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
          isHost={isHost}
          onGrantVideo={(id) => emit("video:grant_access", { roomId, userId: id })}
          onRevokeVideo={(id) => emit("video:revoke_access", { roomId, userId: id })}
        />
      </div>

      <BottomBar
        showNotes={showNotes} setShowNotes={setShowNotes}
        showTimer={showTimer} setShowTimer={setShowTimer} timerRunning={timerRunning} timerSecs={timerSecs}
        saveBoard={saveBoard} canvasPages={canvasPages} currentPage={currentPage}
        fmtTime={fmtTime}
        isVideoOn={isVideoOn} toggleVideo={toggleVideo} hasVideoAccess={finalHasVideoAccess}
        hasActiveVideoStreams={hasActiveVideoStreams} showVideoChat={showVideoChat} setShowVideoChat={setShowVideoChat}
      />


      {showNotes && <NotesPanel onClose={() => setShowNotes(false)} notesText={notesText} onChange={setNotesText} />}
      {showTimer && <TimerPanel onClose={() => setShowTimer(false)} timerSecs={timerSecs} timerRunning={timerRunning} timerInput={timerInput} onInputChange={setTimerInput} onStart={startTimer} onPause={pauseTimer} onReset={resetTimer} showNotes={showNotes} isHost={isHost} />}
      {showClear && <ClearModal onCancel={() => setShowClear(false)} onConfirm={handleClearConfirm} />}
    </div>
  );
}