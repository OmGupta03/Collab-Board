import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  roomId:     { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName:   { type: String, required: true },
  fileUrl:    { type: String, required: true },
  fileType:   { type: String },
  fileSize:   { type: Number },
  tag:        { type: String, enum: ["General", "Note", "Assignment"], default: "General" },
  remark:     { type: String, default: "" },
}, { timestamps: true });

const File = mongoose.model("File", fileSchema);
export default File;