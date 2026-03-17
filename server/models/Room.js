import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId:   { type: String, required: true, unique: true },
  name:     { type: String, required: true, trim: true },
  hostId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
  settings: {
    maxParticipants: { type: Number, default: 10 },
    isPrivate:       { type: Boolean, default: false },
  },
}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;