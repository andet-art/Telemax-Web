// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize DB connection
require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const productRoutes = require("./routes/ProductRoutes");
const orderRoutes = require("./routes/orderRoutes");

// ✅ NEW: Catalog Types route
const catalogTypeRoutes = require("./routes/CatalogTypeRoutes");

// ✅ Auth middleware + controller for /api/me
const authMiddleware = require("./middleware/auth");
const authController = require("./controllers/authController");

// Error handler
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ================================
   CORS
================================ */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://138.68.248.164",
  "http://138.68.248.164:3000",
  "http://138.68.248.164:4000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // ✅ Allow listed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // ✅ Allow all (you can tighten later)
      return callback(null, true);
    },
    credentials: true,
  })
);

/* ================================
   BODY PARSER
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   STATIC IMAGES
================================ */
app.use("/photos", express.static(path.join(__dirname, "public/photos")));

/* ================================
   HEALTH CHECKS
================================ */

// root health
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `TelemaxWeb API running on port ${process.env.PORT || 4000}`,
  });
});

// ✅ FE ping endpoint: /api/health
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    time: new Date().toISOString(),
  });
});

// ✅ FE auth check endpoint: /api/me (requires Bearer token)
app.get("/api/me", authMiddleware, authController.getCurrentUser);

/* ================================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Types from catalog_types table
app.use("/api/catalog-types", catalogTypeRoutes);

/* ================================
   404 HANDLER
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ================================
   ERROR HANDLER
================================ */
app.use(errorHandler);

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});