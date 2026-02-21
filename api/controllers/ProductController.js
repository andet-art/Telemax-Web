import { listProducts, getProductById } from "../models/Product.js";

export async function getProducts(req, res, next) {
  try {
    const {
      q,
      type_id,
      subtype_id,
      active = "1",   // default show active only
      limit,
      offset,
    } = req.query;

    const rows = await listProducts({
      q,
      type_id,
      subtype_id,
      active,
      limit,
      offset,
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getProductById(Number(id));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}