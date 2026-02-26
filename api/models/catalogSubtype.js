// api/models/catalogSubtype.js
const db = require("../config/db");

/**
 * Get ALL active subtypes, ordered by type_id then sort_order.
 */
exports.getAllActive = async () => {
  const [rows] = await db.execute(
    `
    SELECT id, type_id, name, sort_order, is_active, photo, created_at
    FROM catalog_subtypes
    WHERE is_active = 1
    ORDER BY type_id ASC, sort_order ASC, id ASC
    `
  );
  return rows;
};

/**
 * Get subtypes by type_id (active only), ordered
 */
exports.getByTypeId = async (typeId) => {
  const [rows] = await db.execute(
    `
    SELECT id, type_id, name, sort_order, is_active, photo, created_at
    FROM catalog_subtypes
    WHERE type_id = ?
      AND is_active = 1
    ORDER BY sort_order ASC, id ASC
    `,
    [typeId]
  );
  return rows;
};