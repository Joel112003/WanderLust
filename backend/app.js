require("dotenv").config();
require("./config/secretGenerator");

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

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Static file serving
app.use("/dist", express.static(path.join(__dirname, "dist")));
app.use("/src", express.static(path.join(__dirname, "..", "frontend", "src")));
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET?.toString() || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.ATLAS_DB,
      touchAfter: 24 * 3600,
      crypto: {
        secret: false,
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");
const bookingRoutes = require("./routes/booking");
const notificationRoutes = require("./routes/notification");
const adminRoutes = require('./routes/adminRoutes');
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.url,
    body: req.body,
    headers: req.headers
  });
  next();
});


app.use("/listings", listingRoutes);
app.use("/listings/:listingId/reviews", reviewRoutes);
app.use("/auth", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/notifications", notificationRoutes);
app.use('/admin', adminRoutes);

// Error Handlers
app.use((err, req, res, next) => {
  if (err.message.includes('CORS')) {
    console.error('CORS Error:', {
      origin: req.headers.origin,
      method: req.method,
      path: req.path
    });
    return res.status(403).json({
      error: 'CORS error',
      message: err.message
    });
  }
  next(err);
});

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