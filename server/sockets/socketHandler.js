import { drawingEvents } from "./drawingEvents.js";
import { chatEvents }    from "./chatEvents.js";
import { roomEvents }    from "./roomEvents.js";
import { videoEvents }   from "./videoEvents.js";
import { socketAuth }    from "../middleware/socketAuth.js";

// Track who is in which room: { roomId: [{ socketId, userId, name }] }
const roomUsers = {};

export const initSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.user?.name || "Unknown"})`);

    // Attach sub-handlers
    roomEvents(io, socket, roomUsers);
    drawingEvents(io, socket);
    chatEvents(io, socket);
    videoEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id} (User: ${socket.user?.name || "Unknown"})`);

      // Remove user from all rooms they were in
      for (const roomId in roomUsers) {
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        io.to(roomId).emit("room:users", roomUsers[roomId]);
      }
    });
  });
};