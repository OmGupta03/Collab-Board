import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, Maximize2, Minimize2 } from 'lucide-react';

const VideoPlayer = ({ stream, isLocal, muted }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) return null;

    return (
        <div style={{
            position: "relative",
            width: "160px",
            height: "120px",
            backgroundColor: "#000",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "2px solid #333"
        }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted || isLocal}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isLocal ? "scaleX(-1)" : "none"
                }}
            />
            {isLocal && (
                <div style={{
                    position: "absolute",
                    bottom: 6,
                    left: 8,
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600
                }}>
                    You
                </div>
            )}
        </div>
    );
};

export default function VideoChat({ localStream, remoteStreams }) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 80 }); // Initial position Top Left-ish
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
    };

    const allRemoteStreams = Object.values(remoteStreams).filter(Boolean);

    if (!localStream && allRemoteStreams.length === 0) return null;

    return (
        <div 
            style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                padding: "12px",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(139,92,246,0.2)",
                touchAction: "none"
            }}
        >
            <div 
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "grab",
                    paddingBottom: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    marginBottom: isMinimized ? 0 : "4px"
                }}
            >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#4B5563", userSelect: "none" }}>
                    Video Chat
                </div>
                <button 
                    onClick={() => setIsMinimized(m => !m)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: "4px" }}
                >
                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
            </div>

            {!isMinimized && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {localStream && (
                        <VideoPlayer stream={localStream} isLocal={true} />
                    )}
                    
                    {allRemoteStreams.map((stream, idx) => (
                        <VideoPlayer key={idx} stream={stream} isLocal={false} />
                    ))}
                </div>
            )}
        </div>
    );
}
