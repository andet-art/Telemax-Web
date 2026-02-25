// api/controllers/catalogSubtypeController.js
const catalogSubtypeModel = require("../models/catalogSubtype");

exports.getSubtypes = async (req, res) => {
  try {
    const { type_id } = req.query;

    // ✅ If no type_id → return ALL active subtypes
    const subtypes = type_id
      ? await catalogSubtypeModel.getByTypeId(type_id)
      : await catalogSubtypeModel.getAllActive();

    return res.json({
      success: true,
      data: subtypes,
    });
  } catch (err) {
    console.error("getSubtypes error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};