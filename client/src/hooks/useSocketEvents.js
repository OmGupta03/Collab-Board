import { useEffect } from "react";
import { formatTime } from "../utils/formatters.js";
import toast from "react-hot-toast";

export default function useSocketEvents({
    roomId, on, off,
    canvasRef,
    setShapes, setMessages,
    setTyping, typingTimer,
    setOnlineUsers, stringToColor
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

        const handleRemoteMessage = (msg) => {
            setMessages(prev => [...prev, {
                id: msg._id || Date.now(),
                type: msg.type,
                user: msg.senderName,
                color: stringToColor(msg.senderName),
                text: msg.text,
                fileName: msg.fileName,
                fileUrl: msg.fileUrl,
                time: formatTime(msg.createdAt || new Date()),
            }]);
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


        on("draw:stroke", handleRemoteStroke);
        on("draw:erase", handleRemoteErase);
        on("draw:text", handleRemoteText);
        on("draw:shape_add", handleRemoteShapeAdd);
        on("draw:shape_update", handleRemoteShapeUpdate);
        on("draw:shape_delete", handleRemoteShapeDelete);
        on("draw:clear", handleRemoteClear);
        on("chat:message", handleRemoteMessage);
        on("chat:typing", handleTyping);
        on("chat:stop_typing", handleStopTyping);
        on("room:users", handleRoomUsers);
        on("room:user_joined", handleUserJoined);
        on("room:user_left", handleUserLeft);

        return () => {
            off("draw:stroke"); off("draw:erase"); off("draw:text");
            off("draw:shape_add"); off("draw:shape_update"); off("draw:shape_delete");
            off("draw:clear"); off("chat:message");
            off("chat:typing"); off("chat:stop_typing");
            off("room:users"); off("room:user_joined"); off("room:user_left");
        };
    }, [roomId, on, off, canvasRef, setShapes, setMessages, setTyping, typingTimer, setOnlineUsers, stringToColor]);
}
