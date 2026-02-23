// /routes/ProductRoutes.js
const express = require("express");
const router = express.Router();

// IMPORTANT: case-sensitive path (Linux)
const { getProducts } = require("../controllers/ProductController");

// GET /api/products
router.get("/", getProducts);

module.exports = router;
