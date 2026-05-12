export const videoEvents = (io, socket) => {
  // Relay WebRTC signaling data
  socket.on("video:signal", (data) => {
    // data should contain { userToSignal, callerID, signalData }
    // userToSignal is the socket.id of the target
    io.to(data.userToSignal).emit("video:signal", {
      signalData: data.signalData,
      callerID: data.callerID,
    });
  });

  // Host granting access to a user
  socket.on("video:grant_access", (data) => {
    // data: { roomId, userId }
    // Broadcast to the room so everyone knows this user has access
    io.to(data.roomId).emit("video:access_granted", { userId: data.userId });
  });

  // Host revoking access
  socket.on("video:revoke_access", (data) => {
    // data: { roomId, userId }
    io.to(data.roomId).emit("video:access_revoked", { userId: data.userId });
  });

  // User turning on their video
  socket.on("video:start", (data) => {
    // data: { roomId, userId, socketId }
    socket.to(data.roomId).emit("video:user_started", { 
      userId: data.userId, 
      socketId: socket.id 
    });
  });

  // User turning off their video
  socket.on("video:stop", (data) => {
    socket.to(data.roomId).emit("video:user_stopped", { 
      userId: data.userId, 
      socketId: socket.id 
    });
  });
};
