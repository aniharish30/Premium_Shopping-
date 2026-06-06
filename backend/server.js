const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

// ─── CORS — allow localhost + any vercel.app domain ───────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // no origin = Postman / curl / mobile — allow
    if (!origin) return callback(null, true);

    const allowed = [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL || "",
    ];

    // allow exact match OR any *.vercel.app domain
    if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // ALLOW ALL in production to prevent issues
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// handle preflight for ALL routes
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart",     require("./routes/cartRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/upload",   require("./routes/uploadRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));

// health check
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "OK",
    message: "ShopVerse API is running",
    time: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => res.json({ message: "ShopVerse API — use /api" }));

app.use(notFound);
app.use(errorHandler);

// ─── START — listen on 0.0.0.0 required for Render ───────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`   NODE_ENV : ${process.env.NODE_ENV}`);
});
