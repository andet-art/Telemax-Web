const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth"); // ✅ correct path
const orderController = require("../controllers/orderController");

// POST /api/orders
router.post("/", authMiddleware, orderController.createOrder);

// POST /api/orders/:id/pay
router.post("/:id/pay", authMiddleware, orderController.payOrder);

// GET /api/orders/my
router.get("/my", authMiddleware, orderController.getMyOrders);

module.exports = router;