// controllers/partsController.js
const db = require("../config/db");

// GET /api/parts?part_type=head|ring|tail
exports.getParts = async (req, res, next) => {
  try {
    const { part_type } = req.query;

    const params = [];
    let sql = `
      SELECT id, part_type, code, name, photo, created_at
      FROM parts
    `;

    if (part_type) {
      sql += ` WHERE part_type = ? `;
      params.push(part_type);
    }

    sql += ` ORDER BY part_type ASC, id ASC `;

    const [rows] = await db.query(sql, params);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/parts/:id
exports.getPartById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT id, part_type, code, name, photo, created_at
      FROM parts
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Part not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};