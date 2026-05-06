import { useEffect, useState, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth.js";
import { SocketContext } from "./SocketContext.js";

export const SocketProvider = ({ children }) => {
  const { user }      = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) return;

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: user.token },
      transports: ["websocket"],
    });

    s.on("connect", () => {
      console.log("🔌 Socket connected");
      setConnected(true);
    });

    s.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    // Move setSocket out of synchronous execution to avoid React cascading render warning
    setTimeout(() => setSocket(s), 0);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  const emit = useCallback((event, data) => {
    socket?.emit(event, data);
  }, [socket]);

  const on = useCallback((event, callback) => {
    socket?.on(event, callback);
  }, [socket]);

  const off = useCallback((event, callback) => {
    socket?.off(event, callback);
  }, [socket]);

  const value = useMemo(() => ({
    socket, connected, emit, on, off
  }), [socket, connected, emit, on, off]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};