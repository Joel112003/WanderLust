require("dotenv").config();
require("./config/secretGenerator");

console.log("[ENV] FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("[ENV] NODE_ENV:", process.env.NODE_ENV);
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_APP_PASS exists:", !!process.env.GMAIL_APP_PASS);
console.log("GMAIL_APP_PASS length:", process.env.GMAIL_APP_PASS?.length);

const express = require("express");
const mongoose = require("mongoose");
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

const app = express();
const email = require('./services/emailService');


// ===== CORS CONFIGURATION FIX =====
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Alternative frontend
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean); // Remove undefined values

console.log("[CORS] Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("[CORS] Checking origin:", origin);

      // Allow requests with no origin (like mobile apps, curl, postman)
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
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests
app.options("*", cors());

// ===== DATABASE CONNECTION =====
mongoose
  .connect(process.env.ATLAS_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== SECURITY MIDDLEWARE =====
app.use(helmet());

// ===== REQUEST PARSING MIDDLEWARE =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// ===== LOGGING MIDDLEWARE =====
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



// ===== STATIC FILES =====
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

// ===== SESSION CONFIGURATION =====
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

// ===== PASSPORT AUTHENTICATION =====
app.use(passport.initialize());
app.use(passport.session());

// ===== REQUEST LOGGING =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log("Request Body:", req.body);
  }
  next();
});

// ===== ROUTES =====
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");
const bookingRoutes = require("./routes/booking");
const notificationRoutes = require("./routes/notification");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/payment");     // NEW


// Route registration
app.use("/listings", listingRoutes);
app.use("/listings/:listingId/reviews", reviewRoutes);
app.use("/auth", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);               // register payment routes


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ===== 404 HANDLER =====
app.use((req, res, next) => {
  console.warn(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    message: `${req.method} ${req.path} does not exist`,
  });
});

// ===== ERROR HANDLERS =====
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

// ===== SERVER START =====
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    ✅ WanderLust Server Started        ║
║    Port: ${PORT}                        
║    Environment: ${process.env.NODE_ENV || "development"}     
║    Frontend URL: ${process.env.FRONTEND_URL || "Not set"}
╚════════════════════════════════════════╝
  `);
});
