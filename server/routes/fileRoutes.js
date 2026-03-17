import express from "express";
import { uploadFile, getRoomFiles } from "../controllers/fileController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload",     protect, upload.single("file"), uploadFile);
router.get("/:roomId",     protect, getRoomFiles);

export default router;