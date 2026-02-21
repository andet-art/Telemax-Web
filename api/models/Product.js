import db from "../config/db.js";

/**
 * products table columns used:
 * id, sku, name, type_id, subtype_id, description, price, currency,
 * primary_photo, is_active, created_at, updated_at
 */

export async function listProducts({
  q,
  type_id,
  subtype_id,
  active,
  limit = 200,
  offset = 0,
} = {}) {
  const where = [];
  const params = [];

  if (q && String(q).trim()) {
    where.push("(p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)");
    const like = `%${String(q).trim()}%`;
    params.push(like, like, like);
  }

  if (type_id != null && String(type_id) !== "") {
    where.push("p.type_id = ?");
    params.push(Number(type_id));
  }

  if (subtype_id != null && String(subtype_id) !== "") {
    where.push("p.subtype_id = ?");
    params.push(Number(subtype_id));
  }

  // active = 1/0 or true/false
  if (active != null && String(active) !== "") {
    const a =
      active === true || active === "true" || active === "1" || active === 1 ? 1 : 0;
    where.push("p.is_active = ?");
    params.push(a);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const lim = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const off = Math.max(Number(offset) || 0, 0);

  const sql = `
    SELECT
      p.id, p.sku, p.name, p.type_id, p.subtype_id,
      p.description, p.price, p.currency,
      p.primary_photo, p.is_active, p.created_at, p.updated_at
    FROM products p
    ${whereSql}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [...params, lim, off]);
  return rows;
}

export async function getProductById(id) {
  const [rows] = await db.query(
    `
    SELECT
      p.id, p.sku, p.name, p.type_id, p.subtype_id,
      p.description, p.price, p.currency,
      p.primary_photo, p.is_active, p.created_at, p.updated_at
    FROM products p
    WHERE p.id = ?
    LIMIT 1
  `,
    [id]
  );

  return rows[0] || null;
}