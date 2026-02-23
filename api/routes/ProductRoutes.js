// /routes/ProductRoutes.js
const express = require("express");
const router = express.Router();

// ✅ FIX: match the real filename (productController.js)
const { getProducts } = require("../controllers/productController");

// GET /api/products
router.get("/", getProducts);

module.exports = router;