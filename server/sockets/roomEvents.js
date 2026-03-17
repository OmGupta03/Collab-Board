export const roomEvents = (io, socket, roomUsers) => {

  // User joins a room
  socket.on("room:join", ({ roomId, userId, name }) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    // Remove duplicate if reconnecting
    roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId !== userId);
    roomUsers[roomId].push({ socketId: socket.id, userId, name });

    // Broadcast updated user list to everyone in room
    io.to(roomId).emit("room:users", roomUsers[roomId]);

    // Notify others someone joined
    socket.to(roomId).emit("room:user_joined", { userId, name });
    console.log(`👤 ${name} joined room ${roomId}`);
  });

  // User leaves a room
  socket.on("room:leave", ({ roomId, userId, name }) => {
    socket.leave(roomId);

    if (roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId !== userId);
      io.to(roomId).emit("room:users", roomUsers[roomId]);
    }

    socket.to(roomId).emit("room:user_left", { userId, name });
    console.log(`👋 ${name} left room ${roomId}`);
  });
};