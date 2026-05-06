import Room from "../models/Room.js";

export const drawingEvents = (io, socket) => {

  // Broadcast a drawing stroke to everyone else in the room
  socket.on("draw:stroke", ({ roomId, strokeData }) => {
    socket.to(roomId).emit("draw:stroke", strokeData);
  });

  // Broadcast erase action
  socket.on("draw:erase", ({ roomId, eraseData }) => {
    socket.to(roomId).emit("draw:erase", eraseData);
  });

  // Broadcast text added
  socket.on("draw:text", ({ roomId, textData }) => {
    socket.to(roomId).emit("draw:text", textData);
  });

  // Broadcast a new shape added
  socket.on("draw:shape_add", async ({ roomId, shape }) => {
    socket.to(roomId).emit("draw:shape_add", shape);
    try {
      await Room.updateOne({ roomId }, { $push: { shapes: shape } });
    } catch (err) {
      console.error("Failed to save shape to DB:", err);
    }
  });

  // Broadcast shape moved/resized
  socket.on("draw:shape_update", async ({ roomId, shape }) => {
    socket.to(roomId).emit("draw:shape_update", shape);
    try {
      // Update specific shape by replacing the old one with the same ID - naive but works 
      // or we can just pull and push. Pulling and pushing is safer atomicity in NoSQL arrays.
      await Room.updateOne({ roomId }, { $pull: { shapes: { id: shape.id } } });
      await Room.updateOne({ roomId }, { $push: { shapes: shape } });
    } catch (err) {}
  });

  // Broadcast shape deleted
  socket.on("draw:shape_delete", async ({ roomId, shapeId }) => {
    socket.to(roomId).emit("draw:shape_delete", shapeId);
    try {
      await Room.updateOne({ roomId }, { $pull: { shapes: { id: shapeId } } });
    } catch (err) {}
  });

  // Broadcast clear board
  socket.on("draw:clear", async ({ roomId }) => {
    socket.to(roomId).emit("draw:clear");
    try {
      await Room.updateOne({ roomId }, { $set: { shapes: [], history: [] } });
    } catch (err) {}
  });

  // Save full canvas PNG history to MongoDB (sent intermittently from frontend)
  socket.on("draw:save_history", async ({ roomId, base64 }) => {
    try {
      await Room.updateOne({ roomId }, { $push: { history: base64 } });
      // Keep history capped at last 5 states to prevent document bloating
      await Room.updateOne({ roomId }, { $push: { history: { $each: [], $slice: -5 } } });
    } catch (err) {}
  });
};