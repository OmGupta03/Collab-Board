import mongoose from "mongoose";

const whiteboardSessionSchema = new mongoose.Schema({
  roomId:      { type: String, required: true },
  canvasData:  { type: mongoose.Schema.Types.Mixed, default: [] }, // array of strokes
  snapshot:    { type: String, default: "" },   // base64 or Cloudinary URL
  savedAt:     { type: Date, default: Date.now },
  savedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const WhiteboardSession = mongoose.model("WhiteboardSession", whiteboardSessionSchema);
export default WhiteboardSession;