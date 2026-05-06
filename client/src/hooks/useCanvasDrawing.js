import { useState, useRef, useEffect, useCallback } from "react";
import { aiService } from "../services/aiService";
import { SHAPE_TOOLS, PAGE_H } from "../components/whiteboard/constants.jsx";
import toast from "react-hot-toast";

export default function useCanvasDrawing({
  canvasRef, previewRef, scrollRef,
  tool, color, brushSize, shapeSnap,
  setSnapStatus, setSnapError,
  shapes, setShapes,
  setSelectedId,
  shapeDraft, setShapeDraft,
  dragInfo, setDragInfo,
  resizeInfo, setResizeInfo,
  emit, roomId
}) {
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const strokeBounds = useRef({ minX: 9999, minY: 9999, maxX: 0, maxY: 0 });
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const shapeStart = useRef(null);

  // Buffering optimizations for high-frequency socket emission
  const strokeBuffer = useRef([]);
  const eraseBuffer = useRef([]);
  const lastEmitTime = useRef(0);

  const flushDrawBuffers = useCallback(() => {
    if (strokeBuffer.current.length > 0) {
      emit("draw:stroke", { roomId, strokeData: strokeBuffer.current });
      strokeBuffer.current = [];
    }
    if (eraseBuffer.current.length > 0) {
      emit("draw:erase", { roomId, eraseData: eraseBuffer.current });
      eraseBuffer.current = [];
    }
  }, [emit, roomId]);

  const [canvasPages, setCanvasPages] = useState(1);
  const canvasH = canvasPages * PAGE_H;


  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      const preview = previewRef.current;
      const container = scrollRef.current;
      if (!canvas || !preview || !container) return;
      const w = container.offsetWidth;
      if (w === 0) { requestAnimationFrame(initCanvas); return; }
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width || w;
      tmp.height = canvas.height || canvasH;
      if (canvas.width > 0) tmp.getContext("2d").drawImage(canvas, 0, 0);
      canvas.width = w; canvas.height = canvasH;
      preview.width = w; preview.height = canvasH;
      if (tmp.width > 0) canvas.getContext("2d").drawImage(tmp, 0, 0);
    };
    requestAnimationFrame(initCanvas);
  }, [canvasH, canvasRef, previewRef, scrollRef]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      const preview = previewRef.current;
      if (!canvas || !preview) return;
      const w = container.offsetWidth;
      if (w === 0 || w === canvas.width) return;
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width; tmp.height = canvas.height;
      tmp.getContext("2d").drawImage(canvas, 0, 0);
      canvas.width = w; canvas.height = canvasH;
      preview.width = w; preview.height = canvasH;
      canvas.getContext("2d").drawImage(tmp, 0, 0);
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, [canvasH, canvasRef, previewRef, scrollRef]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      setCanvasPages(p => p + 1);
    }
  };

  const getXY = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches?.[0] ?? e;
    if (!src) return { x: 0, y: 0 };
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const saveHistory = useCallback(() => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    historyRef.current.push(data);
    if (historyRef.current.length > 60) historyRef.current.shift();
    redoRef.current = [];
  }, [canvasRef]);

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
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setShapes([]); setSelectedId(null);
    emit("draw:clear", { roomId });
    toast.success("Board cleared");
  };

  const runShapeSnap = async (b) => {
    setSnapStatus("🔍 Detecting shape…"); setSnapError("");
    try {
      const pad = 24, canvas = canvasRef.current;
      const cropX = Math.max(0, b.minX - pad);
      const cropY = Math.max(0, b.minY - pad);
      const cropW = Math.min(canvas.width - cropX, (b.maxX - b.minX) + pad * 2);
      const cropH = Math.min(canvas.height - cropY, (b.maxY - b.minY) + pad * 2);
      const off = document.createElement("canvas");
      off.width = cropW; off.height = cropH;
      const octx = off.getContext("2d");
      octx.fillStyle = "#FFFFFF"; octx.fillRect(0, 0, cropW, cropH);
      octx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const base64 = off.toDataURL("image/png").split(",")[1];

      const data = await aiService.runShapeSnap(base64);

      const { shape, confidence } = data;

      if (!shape || shape === "none" || confidence < 0.45) {
        setSnapStatus(""); setSnapError("⚠️ No obvious shape detected");
        setTimeout(() => setSnapError(""), 3500);
        return;
      }

      saveHistory();
      const ctx = canvas.getContext("2d"), ep = brushSize + 8;
      ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(b.minX - ep, b.minY - ep, (b.maxX - b.minX) + ep * 2, (b.maxY - b.minY) + ep * 2);
      ctx.restore();

      let type = shape === "ellipse" ? "circle" : shape;
      if (type === "rectangle") type = "rect";
      const newShape = { id: String(Date.now()), type, x: b.minX, y: b.minY, w: b.maxX - b.minX, h: b.maxY - b.minY, color, strokeWidth: brushSize };
      setShapes(prev => [...prev, newShape]);
      emit("draw:shape_add", { roomId, shape: newShape });

      setSnapStatus(`✨ Snapped to ${shape[0].toUpperCase() + shape.slice(1)}!`);
      setTimeout(() => setSnapStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setSnapStatus(""); 
      setSnapError(`⚠️ ${err.message || "Shape Snap failed"}`);
      setTimeout(() => setSnapError(""), 3500);
    }
  };

  const onDown = (e, hideMenus) => {
    if (hideMenus) hideMenus();
    setSelectedId(null);
    const pos = getXY(e);

    if (tool === "text") {
      const text = prompt("Enter text");
      if (!text) return;
      const newShape = {
        id: String(Date.now()), type: "text",
        x: pos.x, y: pos.y, w: text.length * 10 + 8, h: 26,
        color, text, strokeWidth: brushSize
      };
      setShapes(prev => [...prev, newShape]);
      setSelectedId(newShape.id);
      emit("draw:shape_add", { roomId, shape: newShape });
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
        const eData = { fromX: pos.x, fromY: pos.y, toX: pos.x, toY: pos.y, lineWidth: brushSize * 3 };
        eraseBuffer.current.push(eData);
        flushDrawBuffers();
        lastEmitTime.current = Date.now();
      } else {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        const sData = { fromX: pos.x, fromY: pos.y, toX: pos.x, toY: pos.y, color, lineWidth: brushSize };
        strokeBuffer.current.push(sData);
        flushDrawBuffers();
        lastEmitTime.current = Date.now();
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
        ctx.lineWidth = brushSize * 3;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.stroke(); ctx.restore();
        const eData = { fromX: lastPos.current.x, fromY: lastPos.current.y, toX: pos.x, toY: pos.y, lineWidth: brushSize * 3 };
        eraseBuffer.current.push(eData);
        if (Date.now() - lastEmitTime.current > 30) { flushDrawBuffers(); lastEmitTime.current = Date.now(); }
      } else {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.stroke();
        const sData = { fromX: lastPos.current.x, fromY: lastPos.current.y, toX: pos.x, toY: pos.y, color, lineWidth: brushSize };
        strokeBuffer.current.push(sData);
        if (Date.now() - lastEmitTime.current > 30) { flushDrawBuffers(); lastEmitTime.current = Date.now(); }
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
    // Final flush of drawing queues
    flushDrawBuffers();
    
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

      if (tool === "line") {
        newShape = { id: String(Date.now()), type: "line", x: sx, y: sy, w: pos.x - sx, h: pos.y - sy, color, strokeWidth: brushSize };
      } else {
        const x = Math.min(sx, pos.x);
        const y = Math.min(sy, pos.y);
        const w = Math.abs(pos.x - sx);
        const h = Math.abs(pos.y - sy);
        if (w >= 10 && h >= 10) {
          newShape = { id: String(Date.now()), type: tool, x, y, w, h, color, strokeWidth: brushSize };
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

    // Automatically backup full board history to database intermittently
    if (wasDrawing || shapeDraft) {
       emit("draw:save_history", { roomId, base64: canvasRef.current.toDataURL("image/png") });
    }
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

  return {
    canvasPages, canvasH, onScroll,
    onDown, onMove, onUp, onLeaveCanvas,
    undo, redo, clearBoard, saveHistory
  };
}