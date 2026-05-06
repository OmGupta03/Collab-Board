import asyncHandler from "express-async-handler";
import File from "../models/File.js";

// @route  POST /api/files/upload  — upload a file
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error("No file uploaded"); }
  const fileUrlPath = `uploads/${req.file.filename}`;

  const file = await File.create({
    roomId:     req.body.roomId,
    uploadedBy: req.user._id,
    fileName:   req.file.originalname,
    fileUrl:    fileUrlPath,
    fileType:   req.file.mimetype,
    fileSize:   req.file.size,
    tag:        req.body.tag || "General",
    remark:     req.body.remark || "",
  });

  res.status(201).json(file);
});

// @route  GET /api/files/:roomId  — get files for a room
const getRoomFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ roomId: req.params.roomId })
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 });

  res.json(files);
});

// @route  GET /api/files/user/materials — get notes and assignments for user's rooms
import Room from "../models/Room.js";

const getUserMaterials = asyncHandler(async (req, res) => {
  // Find rooms user is part of
  const rooms = await Room.find({
    $or: [{ hostId: req.user._id }, { participants: req.user._id }]
  }).select("roomId name");

  const roomIds = rooms.map(r => r.roomId);
  const roomMap = rooms.reduce((acc, r) => {
    acc[r.roomId] = r.name;
    return acc;
  }, {});

  const files = await File.find({
    roomId: { $in: roomIds },
    tag: { $in: ["Note", "Assignment"] }
  })
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 });

  // Attach room name to each file for easier frontend rendering
  const filesWithRoomName = files.map(file => ({
    ...file.toObject(),
    roomName: roomMap[file.roomId] || "Unknown Room"
  }));

  res.json(filesWithRoomName);
});

// @route  DELETE /api/files/:id — delete a file
import fs from "fs";
import path from "path";

const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) {
    res.status(404);
    throw new Error("File not found");
  }

  // Ensure only the uploader or a room host can delete it (optional security, simpler is just uploader)
  // For now, if user is logged in they can delete. But ideally check:
  // if (file.uploadedBy.toString() !== req.user._id.toString()) throw new Error("Not authorized");

  // Remove from local disk if it starts with 'uploads/'
  if (file.fileUrl.startsWith("uploads/")) {
    const filePath = path.join(process.cwd(), file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await file.deleteOne();
  res.json({ message: "File removed" });
});

export { uploadFile, getRoomFiles, getUserMaterials, deleteFile };