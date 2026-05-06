import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";

// @route  GET /api/messages/:roomId  — get chat history
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ roomId: req.params.roomId })
    .populate("senderId", "name avatar")
    .sort({ createdAt: 1 })
    .limit(100);

  res.json(messages);
});

export { getMessages };