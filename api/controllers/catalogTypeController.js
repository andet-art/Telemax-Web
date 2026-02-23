// /controllers/catalogTypeController.js
const CatalogType = require("../models/catalogType");

exports.getCatalogTypes = async (req, res, next) => {
  try {
    const types = await CatalogType.list();
    return res.json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (err) {
    console.error("getCatalogTypes error:", err);
    return next(err);
  }
};