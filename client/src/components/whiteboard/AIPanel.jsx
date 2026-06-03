import React from 'react';
import { Sparkles, X, Wand2 } from 'lucide-react';
import { BORDER, TSUB, TMAIN } from './constants';

export default function AIPanel({ sidebarOpen, onClose, onAction, loading, result }) {
    return (
        <div className="pop-up" style={{ 
            position: "fixed", 
            bottom: 64, 
            right: sidebarOpen ? 308 : 16, 
            width: 296, 
            background: "#FFF", 
            border: `1px solid ${BORDER}`, 
            borderRadius: 16, 
            boxShadow: "0 16px 48px rgba(0,0,0,.13)", 
            zIndex: 100, 
            overflow: "hidden" 
        }}>
            {/* Header */}
            <div style={{ 
                padding: "12px 14px", 
                borderBottom: `1px solid ${BORDER}`, 
                display: "flex", 
                alignItems: "center", 
                justify: "space-between" 
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: 8, 
                        background: "linear-gradient(135deg,#8B5CF6,#A78BFA)", 
                        display: "flex", 
                        alignItems: "center", 
                        justify: "center" 
                    }}>
                        <Sparkles size={14} color="#fff" strokeWidth={2} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: TMAIN }}>AI Beautifier</span>
                    <span style={{ 
                        background: "#D4F0E2", 
                        color: "#15803D", 
                        fontSize: 9, 
                        fontWeight: 800, 
                        padding: "2px 7px", 
                        borderRadius: 20, 
                        textTransform: "uppercase", 
                        letterSpacing: "0.5px" 
                    }}>BETA</span>
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", color: TSUB, cursor: "pointer", display: "flex" }}>
                    <X size={15} strokeWidth={2} />
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: 16 }}>
                <div style={{ 
                    fontSize: 12, 
                    color: TSUB, 
                    lineHeight: 1.5, 
                    marginBottom: 16, 
                    background: "#FAF9F6", 
                    padding: 12, 
                    borderRadius: 10, 
                    border: `1.5px dashed ${BORDER}` 
                }}>
                    🎨 <strong>How to use:</strong> Draw rough shapes (rectangles, circles, lines, or arrows) and write text on the board using the pencil/text tool. Then, click below to let AI automatically convert them into perfectly aligned vector shapes and clean text cards!
                </div>

                {/* Beautify Button */}
                <button 
                    disabled={loading} 
                    onClick={() => onAction("Beautify Board")}
                    style={{ 
                        width: "100%", 
                        padding: "12px 14px", 
                        borderRadius: 10, 
                        background: loading ? "#C4B5FD" : "linear-gradient(135deg,#8B5CF6,#7C3AED)", 
                        color: "#FFF", 
                        border: "none", 
                        fontWeight: 700, 
                        fontSize: 13, 
                        display: "flex", 
                        alignItems: "center", 
                        justify: "center", 
                        gap: 8, 
                        cursor: loading ? "not-allowed" : "pointer", 
                        boxShadow: "0 4px 12px rgba(139,92,246,0.25)", 
                        transition: "all 0.2s" 
                    }}
                >
                    <Wand2 size={15} strokeWidth={2.5} />
                    <span>{loading ? "Beautifying..." : "Beautify Diagram"}</span>
                </button>

                {/* Status Indicator */}
                {loading && (
                    <div style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        borderRadius: 10, 
                        background: "#EDE9FE", 
                        border: "1px solid rgba(139,92,246,.2)", 
                        textAlign: "center", 
                        color: "#8B5CF6", 
                        fontSize: 12, 
                        fontWeight: 600 
                    }} className="pulsing">
                        ✨ Converting your sketches to vectors…
                    </div>
                )}

                {/* Result Message */}
                {result && (
                    <div style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        borderRadius: 10, 
                        background: result.startsWith("⚠️") ? "#FEF2F2" : "#F0FDF4", 
                        border: result.startsWith("⚠️") ? "1px solid rgba(239,68,68,.2)" : "1px solid rgba(34,197,94,.2)", 
                        fontSize: 11, 
                        color: result.startsWith("⚠️") ? "#991B1B" : "#065F46", 
                        lineHeight: 1.6, 
                        whiteSpace: "pre-wrap" 
                    }}>
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
}