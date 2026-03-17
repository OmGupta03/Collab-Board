import asyncHandler from "express-async-handler";
import Room from "../models/Room.js";
import generateRoomId from "../utils/generateRoomId.js";

// @route  POST /api/rooms  — create room
const createRoom = asyncHandler(async (req, res) => {
  const { name, isPrivate, maxParticipants } = req.body;

  const room = await Room.create({
    roomId: generateRoomId(),
    name,
    hostId: req.user._id,
    participants: [req.user._id],
    settings: {
      isPrivate: isPrivate || false,
      maxParticipants: maxParticipants || 10,
    },
  });

  res.status(201).json(room);
});

// @route  GET /api/rooms  — get all rooms for logged-in user
const getUserRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({
    $or: [{ hostId: req.user._id }, { participants: req.user._id }],
  })
    .populate("hostId", "name avatar")
    .populate("participants", "name avatar")
    .sort({ createdAt: -1 });

  res.json(rooms);
});

// @route  GET /api/rooms/:roomId  — get single room
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId })
    .populate("hostId", "name avatar")
    .populate("participants", "name avatar");

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  res.json(room);
});

// @route  POST /api/rooms/join  — join room by ID
const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;

  const room = await Room.findOne({ roomId });

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  // Check if user already joined
  const alreadyJoined = room.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );

  if (!alreadyJoined) {
    room.participants.push(req.user._id);
    await room.save();
  }

  const updatedRoom = await Room.findOne({ roomId })
    .populate("hostId", "name avatar")
    .populate("participants", "name avatar");

  res.json(updatedRoom);
});

// @route  DELETE /api/rooms/:roomId  — delete room (host only)
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });

  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }

  if (room.hostId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the host can delete this room");
  }

  await room.deleteOne();

  res.json({ message: "Room deleted" });
});

export {
  createRoom,
  getUserRooms,
  getRoomById,
  joinRoom,
  deleteRoom,
};
