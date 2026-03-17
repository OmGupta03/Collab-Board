import Message from "../models/Message.js";

export const chatEvents = (io, socket) => {

  // New chat message — save to DB then broadcast
  socket.on("chat:message", async ({ roomId, senderId, senderName, text, type, fileUrl, fileName }) => {
    try {
      const message = await Message.create({ roomId, senderId, text, type: type || "text", fileUrl, fileName });

      io.to(roomId).emit("chat:message", {
        _id:        message._id,
        roomId,
        senderId,
        senderName,
        text,
        type:       message.type,
        fileUrl:    message.fileUrl,
        fileName:   message.fileName,
        createdAt:  message.createdAt,
      });
    } catch (err) {
      console.error("❌ Chat message error:", err.message);
    }
  });

  // Typing indicator
  socket.on("chat:typing", ({ roomId, name }) => {
    socket.to(roomId).emit("chat:typing", { name });
  });

  socket.on("chat:stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("chat:stop_typing");
  });
};