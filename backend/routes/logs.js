const express = require("express");
const router  = express.Router();
const Log     = require("../models/Log");
const auth    = require("../middleware/auth");

// GET /api/logs/:assetId — full history for one asset
router.get("/:assetId", auth, async (req, res) => {
  try {
    const logs = await Log.find({ asset: req.params.assetId })
      .sort({ createdAt: -1 })
      .populate("performedBy", "name username role")
      .lean();
    res.json({ ok: true, logs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/logs — recent activity feed across all assets
router.get("/", auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("performedBy", "name role")
      .populate("asset", "label type location")
      .lean();
    res.json({ ok: true, logs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
