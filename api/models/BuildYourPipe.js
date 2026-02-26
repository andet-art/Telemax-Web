// api/models/BuildYourPipe.js
const db = require("../config/db");

function getUserId(req) {
  return req?.user?.id || req?.user?.userId || req?.userId;
}

const BuildYourPipe = {
  async create({ userId, pipe_name, head_part_id, ring_part_id, tail_part_id, accent, total, currency, head_snapshot, ring_snapshot, tail_snapshot }) {
    const sql = `
      INSERT INTO build_your_pipe
      (user_id, pipe_name, head_part_id, ring_part_id, tail_part_id, accent, total, currency, head_snapshot, ring_snapshot, tail_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      pipe_name,
      head_part_id,
      ring_part_id,
      tail_part_id,
      accent || null,
      Number(total || 0),
      (currency || "EUR").toUpperCase(),
      head_snapshot ? JSON.stringify(head_snapshot) : null,
      ring_snapshot ? JSON.stringify(ring_snapshot) : null,
      tail_snapshot ? JSON.stringify(tail_snapshot) : null,
    ];

    const [result] = await db.query(sql, params);
    return result.insertId;
  },

  async findMine(userId) {
    const sql = `
      SELECT
        id,
        user_id,
        pipe_name,
        head_part_id,
        ring_part_id,
        tail_part_id,
        accent,
        total,
        currency,
        head_snapshot,
        ring_snapshot,
        tail_snapshot,
        created_at,
        updated_at
      FROM build_your_pipe
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async removeMine({ userId, buildId }) {
    const sql = `DELETE FROM build_your_pipe WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [buildId, userId]);
    return result.affectedRows; // 1 if deleted
  },

  // optional helper if you want to reuse in controller
  getUserId,
};

module.exports = BuildYourPipe;