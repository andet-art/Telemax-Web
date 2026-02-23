// /controllers/productController.js
const Product = require("../models/Product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.list();
    return res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("getProducts error:", err);
    return next(err);
  }
};