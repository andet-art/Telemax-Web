// /routes/CatalogTypeRoutes.js
const express = require("express");
const router = express.Router();

const { getCatalogTypes } = require("../controllers/catalogTypeController");

// GET /api/catalog-types
router.get("/", getCatalogTypes);

module.exports = router;