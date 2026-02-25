// routes/partsRoutes.js
const express = require("express");
const router = express.Router();
const partsController = require("../controllers/partsController");

// GET /api/parts?part_type=head|ring|tail
router.get("/", partsController.getParts);

// GET /api/parts/:id
router.get("/:id", partsController.getPartById);

module.exports = router;