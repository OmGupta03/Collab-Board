export const drawShapePath = (ctx, type, x, y, w, h) => {
  const cx = x + w / 2, cy = y + h / 2;
  ctx.beginPath();
  if (type === "rect")     { ctx.rect(x, y, w, h); }
  else if (type === "circle")   { ctx.ellipse(cx, cy, Math.abs(w/2), Math.abs(h/2), 0, 0, Math.PI*2); }
  else if (type === "triangle") { ctx.moveTo(cx,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.closePath(); }
  else if (type === "line")     { ctx.moveTo(x,cy); ctx.lineTo(x+w,cy); }
};

export const exportBoardAsPNG = (canvas, shapes) => {
  const off = document.createElement("canvas");
  off.width  = canvas.width;
  off.height = canvas.height;
  const ctx = off.getContext("2d");
  ctx.fillStyle = "#FAFAF8";
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 0);
  shapes.forEach(s => {
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth   = s.strokeWidth;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    drawShapePath(ctx, s.type, s.x, s.y, s.w, s.h);
    ctx.stroke();
    ctx.restore();
  });
  return off.toDataURL("image/png");
};