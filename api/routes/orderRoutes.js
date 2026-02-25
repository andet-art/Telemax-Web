// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// Your frontend: POST /api/orders  (with Bearer token)
router.post("/", authMiddleware, orderController.createOrder);

// Your Payment page: POST /api/orders/:id/pay
router.post("/:id/pay", authMiddleware, orderController.payOrder);

// Optional for history page: GET /api/orders/my
router.get("/my", authMiddleware, orderController.getMyOrders);

module.exports = router;