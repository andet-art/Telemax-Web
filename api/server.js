// api/server.js  (FULL FIXED)
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
const catalogTypeRoutes = require("./routes/CatalogTypeRoutes");

// ✅ Catalog subtypes route
const catalogSubtypeRoutes = require("./routes/catalogSubtypeRoutes");

// ✅ Parts route
const partsRoutes = require("./routes/partsRoutes");

// ✅ Build Your Pipe route
const buildYourPipeRoutes = require("./routes/buildYourPipeRoutes");

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
      // allow server-to-server / curl / no-origin
      if (!origin) return callback(null, true);

      // allow known origins (and allow all to avoid blocking during dev)
      if (allowedOrigins.includes(origin)) return callback(null, true);
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
   STATIC FILES (FIXED + EXPLICIT)
   These URLs must return image/jpeg, not text/html:
   - /parts/head2.jpeg
   - /photos/xxxx.png
   - /colors/xxxx.png
================================ */
const publicPath = path.resolve(__dirname, "public");

// ✅ Explicit mounts are most reliable
app.use("/parts", express.static(path.join(publicPath, "parts")));
app.use("/photos", express.static(path.join(publicPath, "photos")));
app.use("/colors", express.static(path.join(publicPath, "colors")));

// Optional: also serve whole public (doesn't hurt)
app.use(express.static(publicPath));

/* ================================
   HEALTH CHECKS
================================ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `TelemaxWeb API running on port ${process.env.PORT || 4000}`,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    time: new Date().toISOString(),
  });
});

// current user
app.get("/api/me", authMiddleware, authController.getCurrentUser);

/* ================================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/catalog-types", catalogTypeRoutes);
app.use("/api/catalog-subtypes", catalogSubtypeRoutes);

app.use("/api/parts", partsRoutes);

// ✅ builds endpoint
app.use("/api/builds", buildYourPipeRoutes);

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