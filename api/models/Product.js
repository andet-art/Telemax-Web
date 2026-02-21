// /models/Product.js
const db = require("../config/db");

// If your db.js exports { pool }, uncomment this line and comment the one above:
// const { pool: db } = require("../config/db");

const Product = {
  async list() {
    // Adjust columns to match your table schema if needed
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        description,
        price,
        primary_photo,
        model_id,
        id_str,
        created_at,
        updated_at
      FROM products
      ORDER BY created_at DESC
    `);

    return rows;
  },
};

module.exports = Product;