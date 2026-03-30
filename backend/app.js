require("dotenv").config();
require("./config/secretGenerator");

if (process.env.NODE_ENV !== "production") {
  console.log("[ENV] FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("[ENV] NODE_ENV:", process.env.NODE_ENV);
}

const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const app = express();

function configureMongoDns() {
  const mongoUri = process.env.ATLAS_DB;
  const isSrvUri = mongoUri?.startsWith("mongodb+srv://");

  if (!isSrvUri) {
    return;
  }

  const configuredDnsServers = process.env.MONGODB_DNS_SERVERS
    ? process.env.MONGODB_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];

  dns.setServers(configuredDnsServers);
  console.log("[MongoDB] Using DNS servers:", configuredDnsServers.join(", "));
}

configureMongoDns();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean);

console.log("[CORS] Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("[CORS] Checking origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("[CORS] Origin not allowed:", origin);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.options("*", cors());

const mongoUri = process.env.ATLAS_DB;
const mongoConnectOptions = {};

function isSrvDnsRefusedError(error) {
  return (
    error &&
    error.code === "ECONNREFUSED" &&
    error.syscall === "querySrv"
  );
}

async function connectMongoWithDnsFallback() {
  try {
    await mongoose.connect(mongoUri, mongoConnectOptions);
    console.log("✅ MongoDB connected");
    return;
  } catch (err) {
    const shouldRetryWithCustomDns =
      mongoUri?.startsWith("mongodb+srv://") && isSrvDnsRefusedError(err);

    if (!shouldRetryWithCustomDns) {
      throw err;
    }

    const configuredDnsServers = process.env.MONGODB_DNS_SERVERS
      ? process.env.MONGODB_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
      : ["8.8.8.8", "1.1.1.1"];

    dns.setServers(configuredDnsServers);
    console.warn(
      "[MongoDB] SRV lookup failed with system DNS. Retrying with custom DNS servers:",
      configuredDnsServers.join(", ")
    );

    await mongoose.connect(mongoUri, mongoConnectOptions);
    console.log("✅ MongoDB connected (with DNS fallback)");
  }
}

connectMongoWithDnsFallback().catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

app.use(helmet());
app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(methodOverride("_method"));
app.use(cookieParser());

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: {
    message: "Too many login attempts. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

app.use(
  session({
    secret: process.env.JWT_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.ATLAS_DB,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,

    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");
const bookingRoutes = require("./routes/booking");
const notificationRoutes = require("./routes/notification");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/payment");
const wishlistRoutes = require("./routes/wishlist");
const messageRoutes = require("./routes/message");
const trustRoutes = require("./routes/trust");
const cancellationRoutes = require("./routes/cancellation");
const reportRoutes = require("./routes/report");
const alternativeBookingRoutes = require("./routes/alternativeBooking");

app.use("/listings", listingRoutes);
app.use("/listings/:listingId/reviews", reviewRoutes);
app.use("/auth", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/messages", messageRoutes);
app.use("/trust", trustRoutes);
app.use("/api/cancellation", cancellationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/alternative-bookings", alternativeBookingRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use((req, res, next) => {
  console.warn(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    message: `${req.method} ${req.path} does not exist`,
  });
});

app.use((err, req, res, next) => {
  if (err.message.includes("CORS")) {
    console.error("❌ CORS Error:", {
      origin: req.headers.origin,
      method: req.method,
      path: req.path,
      error: err.message,
    });
    return res.status(403).json({
      error: "CORS Error",
      message: "Cross-Origin Request Blocked. Check server CORS configuration.",
      origin: req.headers.origin,
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
    timestamp: new Date().toISOString(),
  });
});

const http = require('http');
const { Server } = require('socket.io');
const { initializeMessageSocket } = require('./socket/messageSocket');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

initializeMessageSocket(io);

app.set('io', io);

console.log('[Socket.IO] Real-time messaging initialized ✅');

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    ✅ WanderLust Server Started        ║
║    Port: ${PORT}
║    Environment: ${process.env.NODE_ENV || "development"}
║    Frontend URL: ${process.env.FRONTEND_URL || "Not set"}
║    Socket.IO: Enabled ✅               ║
╚════════════════════════════════════════╝
  `);
});
