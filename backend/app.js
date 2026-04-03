require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const http = require("http");
const { Server } = require("socket.io");
const { initializeMessageSocket } = require("./socket/messageSocket");
const { connectDatabase } = require("./config/database");
const { cors, corsOptions, socketCorsOptions } = require("./config/cors");
const { registerRoutes } = require("./routes");

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ─── MongoDB ───────────────────────────────────────────────────────────────
connectDatabase();

// ─── Core Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Session ───────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.JWT_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.ATLAS_DB, touchAfter: 24 * 3600 }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ────────────────────────────────────────────────────────────────
registerRoutes(app);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.path} not found` });
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌", err.message);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// ─── Socket.IO ─────────────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: socketCorsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

initializeMessageSocket(io);
app.set("io", io);

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
