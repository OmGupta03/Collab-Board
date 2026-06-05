import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { initSocket } from "./sockets/socketHandler.js";
import passport from "./config/passport.js";

dotenv.config();

// Sanitize environment variables to trim trailing spaces or newlines from copy-paste errors
const envKeysToTrim = ["CLIENT_URL", "MONGO_URI", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"];
envKeysToTrim.forEach(key => {
  if (process.env[key]) {
    process.env[key] = process.env[key].trim();
  }
});

connectDB();

const app    = express();
const server = http.createServer(app);

// Trust proxy for secure headers behind reverse proxies like Render
app.set("trust proxy", 1);

const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});
app.set("io", io);

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Passport Middleware ────────────────────────────────
app.use(passport.initialize());
// app.use(passport.session()); // Disabled since using JWT tokens

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/rooms",    roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files",    fileRoutes);
app.use("/api/ai",       aiRoutes);

app.get("/", (req, res) => res.json({ message: "CollabBoard API is running 🚀" }));

// ── Socket.io ────────────────────────────────────────────
initSocket(io);

// ── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));