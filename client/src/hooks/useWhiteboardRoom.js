import { useState, useEffect, useRef, useCallback } from "react";
import { roomService } from "../services/roomService.js";
import { formatTime } from "../utils/formatters.js";
import toast from "react-hot-toast";

export const stringToColor = (str) => {
    const colors = ["#8B5CF6", "#EC4899", "#F97316", "#06B6D4", "#22C55E", "#EF4444"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function useWhiteboardRoom({ roomId }) {
    const [roomInfo, setRoomInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typing, setTyping] = useState("");
    const typingTimer = useRef(null);

    const loadRoomData = useCallback(async () => {
        try {
            const [room, msgs] = await Promise.all([
                roomService.getRoomById(roomId),
                roomService.getMessages(roomId),
            ]);
            setRoomInfo(room);
            const formatted = msgs.map(m => ({
                id: m._id,
                type: m.type,
                user: m.senderId?.name || "Unknown",
                color: stringToColor(m.senderId?.name || ""),
                text: m.text,
                fileName: m.fileName,
                fileUrl: m.fileUrl,
                time: m.createdAt ? formatTime(m.createdAt) : "",
            }));
            setMessages(formatted);
        } catch {
            toast.error("Could not load room data");
        }
    }, [roomId]);

    useEffect(() => {
        // Move to next tick to avoid synchronous setState inside render-driven effects
        const timer = setTimeout(() => {
            loadRoomData();
        }, 0);
        return () => clearTimeout(timer);
    }, [loadRoomData]);

    return {
        roomInfo,
        messages, setMessages,
        onlineUsers, setOnlineUsers,
        typing, setTyping,
        typingTimer, stringToColor
    };
}
