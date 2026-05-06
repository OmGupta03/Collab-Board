import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId:   { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:     { type: String, default: "" },
  type:     { type: String, enum: ["text", "file", "system"], default: "text" },
  fileUrl:  { type: String, default: "" },
  fileName: { type: String, default: "" },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;