// api/routes/buildYourPipeRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const controller = require("../controllers/buildYourPipeController");

// Save a build
// POST /api/builds
router.post("/", authMiddleware, controller.createBuild);

// Get my saved builds
// GET /api/builds/me
router.get("/me", authMiddleware, controller.getMyBuilds);

// Delete one build
// DELETE /api/builds/:id
router.delete("/:id", authMiddleware, controller.deleteMyBuild);

module.exports = router;