import React from 'react';
import { Pencil, Eraser, Type, Square, Circle, Triangle, Minus, MousePointer2 } from 'lucide-react';

export const BRUSH_SIZES = [2, 4, 8, 14, 22];
export const PALETTE_COLORS = [
    "#1E1A14", "#64748B", "#EF4444", "#F97316", "#EAB308",
    "#22C55E", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
    "#FFFFFF", "#F8F5F0", "#FDF5C4", "#D4F0E2", "#D4E8FF",
];
export const PAGE_H = 680;
export const BG = "#FAFAF8";
export const WB_PANEL = "#FFFFFF";
export const BORDER = "#EAE4DC";
export const TSUB = "#9A8F82";
export const TMAIN = "#1E1A14";
export const SHAPE_TOOLS = ["rect", "circle", "triangle", "line"];

export const WB_TOOLS = [
    { id: "select", icon: <MousePointer2 size={17} strokeWidth={2} />, label: "Select" },
    { id: "pencil", icon: <Pencil size={17} strokeWidth={2} />, label: "Pencil" },
    { id: "eraser", icon: <Eraser size={17} strokeWidth={2} />, label: "Eraser" },
    { id: "text", icon: <Type size={17} strokeWidth={2} />, label: "Text" },
    { id: "rect", icon: <Square size={17} strokeWidth={2} />, label: "Rectangle" },
    { id: "circle", icon: <Circle size={17} strokeWidth={2} />, label: "Circle" },
    { id: "triangle", icon: <Triangle size={17} strokeWidth={2} />, label: "Triangle" },
    { id: "line", icon: <Minus size={17} strokeWidth={2} />, label: "Line" },
];
