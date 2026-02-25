// controllers/orderController.js
const Order = require("../models/Order");

exports.createOrder = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      address,
      description,
      items,
      total_price,
    } = req.body || {};

    if (!full_name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.createOrderWithItems(req.user.id, {
      full_name,
      email,
      phone,
      address,
      description,
      items,
      total_price,
    });

    return res.status(201).json({
      success: true,
      order: { id: order.id },
    });
  } catch (err) {
    next(err);
  }
};

exports.payOrder = async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    await Order.markPaid(req.user.id, orderId, req.body);

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const rows = await Order.listMine(req.user.id);
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};