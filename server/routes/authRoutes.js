import express from "express";
import { registerUser, loginUser, getMe, googleCallback } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import passport from "passport";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=auth_failed" }),
  googleCallback
);

router.post("/register", registerUser);
router.post("/login",    loginUser);
router.get("/me",        protect, getMe);

export default router;