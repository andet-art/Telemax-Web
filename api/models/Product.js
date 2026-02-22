// /models/Product.js
const db = require("../config/db");

const Product = {
  async list() {
    const [rows] = await db.query(`
      SELECT
        id,
        sku,
        name,
        type_id,
        subtype_id,
        description,
        price,
        currency,
        primary_photo,
        is_active,
        created_at,
        updated_at
      FROM products
      ORDER BY created_at DESC
    `);

    return rows;
  },
};

module.exports = Product;
