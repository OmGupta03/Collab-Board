import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth }   from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

// The full whiteboard UI component we already built — just wired to real socket + auth
import WhiteboardRoom from "../components/whiteboard/Canvas.jsx";

export default function WhiteboardPage() {
  const { roomId }  = useParams();
  const { user }    = useAuth();
  const { emit }    = useSocket();
  const navigate    = useNavigate();

  // Join socket room on mount
  useEffect(() => {
    if (!user || !roomId) return;
    emit("room:join", { roomId, userId: user._id, name: user.name });

    return () => {
      emit("room:leave", { roomId, userId: user._id, name: user.name });
    };
  }, [roomId, user]);

  return (
    <WhiteboardRoom
      roomId={roomId}
      user={user}
      onLeave={() => navigate("/dashboard")}
    />
  );
}