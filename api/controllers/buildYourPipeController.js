// api/controllers/buildYourPipeController.js
const BuildYourPipe = require("../models/BuildYourPipe");

exports.createBuild = async (req, res, next) => {
  try {
    const userId = BuildYourPipe.getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      pipe_name,
      head_part_id,
      ring_part_id,
      tail_part_id,
      accent,
      total,
      currency,
      head_snapshot,
      ring_snapshot,
      tail_snapshot,
    } = req.body || {};

    if (!pipe_name || !String(pipe_name).trim()) {
      return res.status(400).json({ success: false, message: "pipe_name is required" });
    }
    if (!head_part_id || !ring_part_id || !tail_part_id) {
      return res.status(400).json({ success: false, message: "head_part_id, ring_part_id, tail_part_id are required" });
    }

    const id = await BuildYourPipe.create({
      userId,
      pipe_name: String(pipe_name).trim(),
      head_part_id: Number(head_part_id),
      ring_part_id: Number(ring_part_id),
      tail_part_id: Number(tail_part_id),
      accent: accent || null,
      total: Number(total || 0),
      currency: currency || "EUR",
      head_snapshot: head_snapshot || null,
      ring_snapshot: ring_snapshot || null,
      tail_snapshot: tail_snapshot || null,
    });

    return res.status(201).json({
      success: true,
      message: "Build saved",
      id,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyBuilds = async (req, res, next) => {
  try {
    const userId = BuildYourPipe.getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const builds = await BuildYourPipe.findMine(userId);

    return res.json({
      success: true,
      builds,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMyBuild = async (req, res, next) => {
  try {
    const userId = BuildYourPipe.getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const buildId = Number(req.params.id);
    if (!buildId) return res.status(400).json({ success: false, message: "Invalid build id" });

    const affected = await BuildYourPipe.removeMine({ userId, buildId });
    if (!affected) return res.status(404).json({ success: false, message: "Build not found" });

    return res.json({ success: true, message: "Build deleted" });
  } catch (err) {
    next(err);
  }
};