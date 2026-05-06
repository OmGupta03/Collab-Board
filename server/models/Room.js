import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roomSchema = new mongoose.Schema({
  roomId:   { type: String, required: true, unique: true },
  name:     { type: String, required: true, trim: true },
  hostId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
  settings: {
    maxParticipants: { type: Number, default: 10 },
    isPrivate:       { type: Boolean, default: false },
    password:        { type: String, default: null }, // Hashed password for private rooms
  },
  shapes: {
    type: Array, // Stores an array of drawn SVG shapes { id, type, x, y, w, h, color, strokeWidth }
    default: []
  },
  history: {
    type: Array, // Stores base64 background cache or history stack
    default: []
  }
}, { timestamps: true });

// Hash room password before saving
roomSchema.pre("save", async function () {
  if (!this.isModified("settings.password") || !this.settings.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.settings.password = await bcrypt.hash(this.settings.password, salt);
});

// Method to check room password
roomSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.settings.password) return true; // No password required
  return await bcrypt.compare(enteredPassword, this.settings.password);
};

const Room = mongoose.model("Room", roomSchema);
export default Room;