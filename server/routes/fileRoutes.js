import express from "express";
import { uploadFile, getRoomFiles, getUserMaterials, deleteFile } from "../controllers/fileController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload",     protect, upload.single("file"), uploadFile);
router.get("/user/materials", protect, getUserMaterials);
router.get("/:roomId",     protect, getRoomFiles);
router.delete("/:id",      protect, deleteFile);

export default router;