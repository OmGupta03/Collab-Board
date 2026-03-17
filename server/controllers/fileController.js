import asyncHandler from "express-async-handler";
import File from "../models/File.js";

// @route  POST /api/files/upload  — upload a file
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error("No file uploaded"); }

  const file = await File.create({
    roomId:     req.body.roomId,
    uploadedBy: req.user._id,
    fileName:   req.file.originalname,
    fileUrl:    req.file.path,
    fileType:   req.file.mimetype,
    fileSize:   req.file.size,
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

export { uploadFile, getRoomFiles };