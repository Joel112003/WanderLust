require("dotenv").config(); // Load env variables immediately
require("./config/secretGenerator"); // Then ensure secrets exist

console.log("[ENV] FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("[ENV] NODE_ENV:", process.env.NODE_ENV);


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const Booking = require("./models/Booking");
const adminRoutes = require('./routes/adminRoutes');


const app = express();

// CORS configuration
const allowedOrigins = [
  "https://wander-lust-mauve-rho.vercel.app", // Your Vercel frontend
  "http://localhost:3000", // Local development
  process.env.FRONTEND_URL, // Environment variable fallback
].filter(Boolean); // Removes any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Case-insensitive comparison for origins
      const originHost = new URL(origin).hostname.replace("www.", "");
      const isAllowed = allowedOrigins.some((allowed) => {
        const allowedHost = new URL(allowed).hostname.replace("www.", "");
        return originHost === allowedHost;
      });

      isAllowed
        ? callback(null, true)
        : callback(new Error(`Origin ${origin} blocked by CORS`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600, // Cache preflight requests for 10 minutes
  })
);

// MongoDB connection
mongoose
  .connect(process.env.ATLAS_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the dist directory
app.use(
  "/dist",
  express.static(path.join(__dirname, "dist"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Serve frontend static files (for CSS and other assets)
app.use(
  "/src",
  express.static(path.join(__dirname, "..", "frontend", "src"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Serve frontend public directory
app.use(
  express.static(path.join(__dirname, "..", "frontend", "public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET?.toString() || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.ATLAS_DB,
      touchAfter: 24 * 3600, // 24 hours
      crypto: {
        secret: false, // Disable encryption for session data
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");
const bookingRoutes = require("./routes/booking");
const notificationRoutes = require("./routes/notification");

app.use("/listings", listingRoutes);
app.use("/listings/:listingId/reviews", reviewRoutes);
app.use("/auth", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/notifications", notificationRoutes);
app.use('/admin', adminRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong!",
  });
});

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
