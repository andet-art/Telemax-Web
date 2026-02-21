const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize DB connection
require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/ProductRoutes'); // ✅ ADD THIS

const errorHandler = require('./middleware/errorHandler');

const app = express();

/* ================================
   CORS CONFIGURATION
================================ */
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.FRONTEND_URL,
  'http://138.68.248.164',
  'http://138.68.248.164:3000',
  'http://138.68.248.164:5001'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow anyway (you can restrict later)
    }
  },
  credentials: true
}));

/* ================================
   BODY PARSING
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   STATIC FILES (PRODUCT IMAGES)
   Example: http://138.68.248.164:5001/photos/3273001.png
================================ */
app.use('/photos', express.static(path.join(__dirname, 'public/photos')));

/* ================================
   HEALTH CHECK
================================ */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TelemaxWeb API is running',
    port: process.env.PORT || 5001,
    version: '1.0.0'
  });
});

/* ================================
   ROUTES
================================ */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes); // ✅ PRODUCT FETCHING ROUTE

/* ================================
   404 HANDLER
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* ================================
   ERROR HANDLER
================================ */
app.use(errorHandler);

/* ================================
   SERVER START
================================ */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✓ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});