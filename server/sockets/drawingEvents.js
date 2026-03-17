export const drawingEvents = (io, socket) => {

  // Broadcast a drawing stroke to everyone else in the room
  socket.on("draw:stroke", ({ roomId, strokeData }) => {
    socket.to(roomId).emit("draw:stroke", strokeData);
  });

  // Broadcast erase action
  socket.on("draw:erase", ({ roomId, eraseData }) => {
    socket.to(roomId).emit("draw:erase", eraseData);
  });

  // Broadcast a new shape added
  socket.on("draw:shape_add", ({ roomId, shape }) => {
    socket.to(roomId).emit("draw:shape_add", shape);
  });

  // Broadcast shape moved/resized
  socket.on("draw:shape_update", ({ roomId, shape }) => {
    socket.to(roomId).emit("draw:shape_update", shape);
  });

  // Broadcast shape deleted
  socket.on("draw:shape_delete", ({ roomId, shapeId }) => {
    socket.to(roomId).emit("draw:shape_delete", shapeId);
  });

  // Broadcast clear board
  socket.on("draw:clear", ({ roomId }) => {
    socket.to(roomId).emit("draw:clear");
  });
};