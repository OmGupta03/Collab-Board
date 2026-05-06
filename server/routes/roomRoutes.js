import express from "express";
import { createRoom, getUserRooms, getRoomById, joinRoom, deleteRoom } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);   // all room routes require auth

router.route("/").get(getUserRooms).post(createRoom);
router.post("/join",           joinRoom);
router.route("/:roomId").get(getRoomById).delete(deleteRoom);

export default router;