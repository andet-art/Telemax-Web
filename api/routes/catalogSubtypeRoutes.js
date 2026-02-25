// api/routes/catalogSubtypeRoutes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/catalogSubtypeController");

// GET /api/catalog-subtypes?type_id=1
router.get("/", controller.getSubtypes);

module.exports = router;