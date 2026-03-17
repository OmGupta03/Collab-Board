import { useRef, useCallback } from "react";

const BRUSH_SIZES = [2, 4, 8, 14, 22];

export const useCanvas = ({ color, brushIdx, tool, onStrokeEnd }) => {
  const canvasRef    = useRef(null);
  const drawing      = useRef(false);
  const lastPos      = useRef(null);
  const strokeBounds = useRef({ minX:9999, minY:9999, maxX:0, maxY:0 });
  const historyRef   = useRef([]);
  const redoRef      = useRef([]);

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

  const startDraw = (e) => {
    const pos = getXY(e);
    saveHistory();
    drawing.current = true;
    lastPos.current = pos;
    strokeBounds.current = { minX:pos.x, minY:pos.y, maxX:pos.x, maxY:pos.y };
    const ctx = canvasRef.current.getContext("2d");
    if (tool === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, BRUSH_SIZES[brushIdx] * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, BRUSH_SIZES[brushIdx] / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  const draw = (e) => {
    if (!drawing.current) return;
    const pos = getXY(e);
    const b   = strokeBounds.current;
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
      ctx.lineWidth = BRUSH_SIZES[brushIdx] * 3;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.stroke(); ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = BRUSH_SIZES[brushIdx];
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onStrokeEnd?.(strokeBounds.current);
  };

  const undo = () => {
    if (!historyRef.current.length) return;
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    redoRef.current.push(canvas.toDataURL());
    const img = new Image();
    img.src = historyRef.current.pop();
    img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
  };

  const redo = () => {
    if (!redoRef.current.length) return;
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    historyRef.current.push(canvas.toDataURL());
    const img = new Image();
    img.src = redoRef.current.pop();
    img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
  };

  const clearCanvas = () => {
    saveHistory();
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  const exportPNG = () => {
    return canvasRef.current.toDataURL("image/png");
  };

  return { canvasRef, startDraw, draw, endDraw, undo, redo, clearCanvas, exportPNG, saveHistory };
};