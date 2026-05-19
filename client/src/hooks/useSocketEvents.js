import { useEffect } from "react";
import { formatTime } from "../utils/formatters.js";
import toast from "react-hot-toast";

export default function useSocketEvents({
    roomId, on, off,
    canvasRef,
    setShapes, setMessages,
    setTyping, typingTimer,
    setOnlineUsers, stringToColor, user, onLeave
}) {
    useEffect(() => {
        const handleRemoteStroke = (payload) => {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            const drawSegment = ({ fromX, fromY, toX, toY, color, lineWidth }) => {
                ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY);
                ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
                ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
            };
            if (Array.isArray(payload)) payload.forEach(drawSegment);
            else drawSegment(payload);
        };

        const handleRemoteErase = (payload) => {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            const eraseSegment = (eraseData) => {
                ctx.save(); ctx.globalCompositeOperation = "destination-out";
                ctx.beginPath();
                ctx.moveTo(eraseData.fromX, eraseData.fromY);
                ctx.lineTo(eraseData.toX, eraseData.toY);
                ctx.strokeStyle = "rgba(0,0,0,1)"; ctx.lineWidth = eraseData.lineWidth;
                ctx.lineCap = "round"; ctx.stroke(); ctx.restore();
            };
            if (Array.isArray(payload)) payload.forEach(eraseSegment);
            else eraseSegment(payload);
        };

        const handleRemoteText = ({ text, x, y, color, font }) => {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            ctx.fillStyle = color;
            ctx.font = font;
            ctx.fillText(text, x, y);
        };

        const handleRemoteShapeAdd = (shape) => setShapes(prev => [...prev, shape]);
        const handleRemoteShapeUpdate = (shape) => setShapes(prev => prev.map(s => s.id === shape.id ? shape : s));
        const handleRemoteShapeDelete = (id) => setShapes(prev => prev.filter(s => s.id !== id));

        const handleRemoteClear = () => {
            canvasRef.current?.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setShapes([]);
        };

        const handleRemoteSyncState = (base64) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        };

        const handleRemoteMessage = (msg) => {
            setMessages(prev => [...prev, {
                id: msg._id || Date.now(),
                type: msg.type,
                user: msg.senderName,
                senderId: msg.senderId,
                color: stringToColor(msg.senderName),
                text: msg.text,
                fileName: msg.fileName,
                fileUrl: msg.fileUrl,
                time: formatTime(msg.createdAt || new Date()),
            }]);
            
            if (msg.type !== "system" && user && msg.senderId !== user._id) {
                toast(`New message from ${msg.senderName}`, { icon: "💬", id: `msg-${msg._id}` });
            }
        };

        const handleTyping = ({ name }) => {
            setTyping(`${name} is typing…`);
            clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setTyping(""), 2000);
        };

        const handleStopTyping = () => setTyping("");
        const handleRoomUsers = (users) => setOnlineUsers(users);
        const handleUserJoined = ({ name }) => toast(`${name} joined the board 👋`, { icon: "🟢" });
        const handleUserLeft = ({ name }) => toast(`${name} left the board`, { icon: "👋" });


        const handleRoomDeleted = () => {
            toast.error("The host has deleted this room.", { duration: 4000 });
            if (onLeave) onLeave();
        };

        on("draw:stroke", handleRemoteStroke);
        on("draw:erase", handleRemoteErase);
        on("draw:text", handleRemoteText);
        on("draw:shape_add", handleRemoteShapeAdd);
        on("draw:shape_update", handleRemoteShapeUpdate);
        on("draw:shape_delete", handleRemoteShapeDelete);
        on("draw:clear", handleRemoteClear);
        on("draw:sync_state", handleRemoteSyncState);
        on("chat:message", handleRemoteMessage);
        on("chat:typing", handleTyping);
        on("chat:stop_typing", handleStopTyping);
        on("room:users", handleRoomUsers);
        on("room:user_joined", handleUserJoined);
        on("room:user_left", handleUserLeft);
        on("room:deleted", handleRoomDeleted);

        return () => {
            off("draw:stroke"); off("draw:erase"); off("draw:text");
            off("draw:shape_add"); off("draw:shape_update"); off("draw:shape_delete");
            off("draw:clear"); off("draw:sync_state"); off("chat:message");
            off("chat:typing"); off("chat:stop_typing");
            off("room:users"); off("room:user_joined"); off("room:user_left"); off("room:deleted");
        };
    }, [roomId, on, off, canvasRef, setShapes, setMessages, setTyping, typingTimer, setOnlineUsers, stringToColor, user, onLeave]);
}
