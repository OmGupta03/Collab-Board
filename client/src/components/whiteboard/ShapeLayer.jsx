import React from 'react';

export function ShapeEl({ s, selected, onSelect, onDragStart, onResizeStart, onDelete }) {
    return (
        <g>
            <ShapeSVG s={s} selected={selected}
                onMouseDown={e => { 
                    e.stopPropagation(); 
                    onSelect(); 
                    const svgInfo = e.currentTarget.closest('svg').getBoundingClientRect();
                    onDragStart((e.clientX - svgInfo.left) - s.x, (e.clientY - svgInfo.top) - s.y); 
                }} />
            {selected && <>
                <rect x={s.x - 6} y={s.y - 6} width={s.w + 12} height={s.h + 12} rx={6}
                    fill="none" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.7} pointerEvents="none" />
                <g transform={`translate(${s.x + s.w + 2},${s.y - 14})`} style={{ cursor: "pointer" }}
                    onMouseDown={e => { e.stopPropagation(); onDelete(); }}>
                    <circle r={8} fill="#EF4444" stroke="#fff" strokeWidth={1.5} />
                    <line x1={-4} y1={-4} x2={4} y2={4} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
                    <line x1={4} y1={-4} x2={-4} y2={4} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
                </g>
                <rect x={s.x + s.w - 6} y={s.y + s.h - 6} width={12} height={12} rx={3}
                    fill="#8B5CF6" stroke="#fff" strokeWidth={1.5} style={{ cursor: "nwse-resize" }}
                    onMouseDown={e => { 
                        e.stopPropagation(); 
                        const svgInfo = e.currentTarget.closest('svg').getBoundingClientRect();
                        onResizeStart(e.clientX - svgInfo.left, e.clientY - svgInfo.top); 
                    }} />
                <g transform={`translate(${s.x + s.w / 2},${s.y - 14})`} pointerEvents="none" opacity={0.7}>
                    <circle r={8} fill="#8B5CF6" stroke="#fff" strokeWidth={1.5} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#fff" fontWeight="bold">✥</text>
                </g>
            </>}
        </g>
    );
}

export function ShapeSVG({ s, selected, onMouseDown, draft }) {
    const props = {
        fill: s.type === "text" ? s.color : "none", 
        stroke: s.type === "text" ? "none" : s.color, 
        strokeWidth: s.strokeWidth,
        strokeLinecap: "round", strokeLinejoin: "round",
        style: { cursor: selected ? "move" : draft ? "crosshair" : "grab" },
        onMouseDown,
    };
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    if (s.type === "rect") return <rect x={s.x} y={s.y} width={s.w} height={s.h} {...props} />;
    if (s.type === "circle") return <ellipse cx={cx} cy={cy} rx={Math.abs(s.w / 2)} ry={Math.abs(s.h / 2)} {...props} />;
    if (s.type === "triangle") return <polygon points={`${cx},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`} {...props} />;
    if (s.type === "line") return <line x1={s.x} y1={s.y} x2={s.x + s.w} y2={s.y + s.h} {...props} />;
    if (s.type === "text") return <text x={s.x + 4} y={s.y + 18} fontSize="18" fontFamily="DM Sans" fontWeight="500" {...props} style={{...props.style, userSelect: "none"}}>{s.text}</text>;
    return null;
}

export default function ShapeLayer({
    shapes, selectedId, shapeDraft, canvasH,
    onSelect, onDragStart, onResizeStart, onDelete, onSvgClick,
}) {
    return (
        <>
            {shapeDraft && (
                <svg style={{ position: "absolute", top: 0, left: 0, zIndex: 6, pointerEvents: "none", width: "100%", height: canvasH }}>
                    <ShapeSVG s={{ ...shapeDraft, id: -1 }} draft />
                </svg>
            )}
            <svg style={{ position: "absolute", top: 0, left: 0, zIndex: 5, width: "100%", height: canvasH, overflow: "visible" }}
                onMouseDown={e => { if (e.target.tagName === "svg") onSvgClick(); }}>
                {shapes.map(s => (
                    <ShapeEl key={s.id} s={s} selected={selectedId === s.id}
                        onSelect={() => onSelect(s.id)}
                        onDragStart={(ox, oy) => onDragStart(s.id, ox, oy)}
                        onResizeStart={(ox, oy) => onResizeStart(s.id, ox, oy, s.w, s.h)}
                        onDelete={() => onDelete(s.id)} />
                ))}
            </svg>
        </>
    );
}