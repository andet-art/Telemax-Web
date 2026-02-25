// models/Order.js
const db = require("../config/database");

const n = (v) => Number(v ?? 0) || 0;

class Order {
  static async createOrderWithItems(userId, payload) {
    const {
      full_name,
      email,
      phone,
      address,
      description,
      items,
      total_price,
    } = payload;

    if (!Array.isArray(items) || items.length === 0) {
      const err = new Error("Cart items are required");
      err.statusCode = 400;
      throw err;
    }

    // Compute total on server (prevents price tampering)
    const computedTotal = items.reduce((acc, it) => {
      const line = n(it.line_total ?? n(it.price) * n(it.quantity));
      return acc + line;
    }, 0);

    const total = computedTotal > 0 ? computedTotal : n(total_price);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (user_id, full_name, email, phone, address, description, total_price, status, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
        [
          userId,
          String(full_name || "").trim(),
          String(email || "").trim(),
          String(phone || "").trim(),
          String(address || "").trim(),
          description ? String(description).trim() : null,
          total,
        ]
      );

      const orderId = orderResult.insertId;

      const values = items.map((it) => ([
        orderId,
        n(it.product_id),
        String(it.product_type || "commercial"),
        String(it.name || ""),
        it.color ?? null,
        n(it.quantity),
        n(it.price),
        n(it.line_total ?? (n(it.price) * n(it.quantity))),
        it.head_id ?? null,
        it.ring_id ?? null,
        it.tail_id ?? null,
      ]));

      await conn.query(
        `INSERT INTO order_items
          (order_id, product_id, product_type, name, color, quantity, price, line_total, head_id, ring_id, tail_id)
         VALUES ?`,
        [values]
      );

      await conn.commit();

      return { id: orderId, total_price: total };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  static async markPaid(userId, orderId, body) {
    const { method, last4, total } = body || {};

    const [rows] = await db.query(
      `SELECT id, user_id, total_price, payment_status
       FROM orders WHERE id = ? LIMIT 1`,
      [orderId]
    );

    const order = rows?.[0];
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    if (Number(order.user_id) !== Number(userId)) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }

    if (total != null && Math.abs(n(total) - n(order.total_price)) > 0.01) {
      const err = new Error("Total mismatch");
      err.statusCode = 400;
      throw err;
    }

    if (order.payment_status === "paid") {
      return { alreadyPaid: true };
    }

    await db.query(
      `UPDATE orders
       SET payment_status='paid', status='processing', payment_method=?, payment_last4=?
       WHERE id = ?`,
      [
        method ? String(method) : null,
        last4 ? String(last4).replace(/\D/g, "").slice(-4) : null,
        orderId,
      ]
    );

    return { success: true };
  }

  static async listMine(userId) {
    const [rows] = await db.query(
      `SELECT id, total_price, status, payment_status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId]
    );
    return rows;
  }
}

module.exports = Order;