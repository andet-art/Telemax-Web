// api/controllers/catalogSubtypeController.js
const catalogSubtypeModel = require("../models/catalogSubtype");

exports.getSubtypes = async (req, res) => {
  try {
    const { type_id } = req.query;

    if (!type_id) {
      return res.status(400).json({
        success: false,
        message: "type_id is required",
      });
    }

    const subtypes = await catalogSubtypeModel.getByTypeId(type_id);

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