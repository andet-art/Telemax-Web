// /models/CatalogType.js
const db = require("../config/db");

const CatalogType = {
  async list() {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        sort_order,
        created_at
      FROM catalog_types
      ORDER BY sort_order ASC, name ASC
    `);

    return rows;
  },
};

module.exports = CatalogType;