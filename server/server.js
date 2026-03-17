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
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { initSocket } from "./sockets/socketHandler.js";
import passport from "./config/passport.js";

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Passport Middleware ────────────────────────────────
app.use(passport.initialize());
// app.use(passport.session()); // Disabled since using JWT tokens

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/rooms",    roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files",    fileRoutes);

app.get("/", (req, res) => res.json({ message: "CollabBoard API is running 🚀" }));

// ── Socket.io ────────────────────────────────────────────
initSocket(io);

// ── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));