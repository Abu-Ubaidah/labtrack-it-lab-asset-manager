const express = require("express");
const router  = express.Router();
const Asset   = require("../models/Asset");
const Log     = require("../models/Log");
const auth    = require("../middleware/auth");
const { techOnly } = require("../middleware/auth");

// helper — create a log entry and emit socket event
async function logAction(io, assetId, action, from, to, note, userId) {
  const entry = await Log.create({ asset: assetId, action, from, to, note, performedBy: userId });
  io?.emit("log:new", { assetId, entry });
}

// GET /api/assets — list all (with optional type/status filter)
router.get("/", auth, async (req, res) => {
  try {
    const q = {};
    if (req.query.type)   q.type   = req.query.type;
    if (req.query.status) q.status = req.query.status;
    if (req.query.flagged === "true") q.flagged = true;
    const assets = await Asset.find(q).sort({ location: 1, label: 1 }).lean();
    res.json({ ok: true, assets });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/assets/stats — counts by status (for dashboard)
router.get("/stats", auth, async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ];
    const byStatus = await Asset.aggregate(pipeline);
    const byType   = await Asset.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);
    const flagged  = await Asset.countDocuments({ flagged: true });
    const total    = await Asset.countDocuments();
    res.json({ ok: true, byStatus, byType, flagged, total });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/assets/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate("addedBy", "name username").lean();
    if (!asset) return res.status(404).json({ ok: false, error: "Asset not found" });
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/assets — create (tech only)
router.post("/", auth, techOnly, async (req, res) => {
  try {
    const { label, type, location, serialNo, specs, notes } = req.body;
    if (!label || !type || !location)
      return res.status(400).json({ ok: false, error: "label, type, location required" });

    const asset = await Asset.create({ label, type, location, serialNo, specs, notes, addedBy: req.user._id });
    const io = req.app.get("io");
    await logAction(io, asset._id, "created", "", label, `Added by ${req.user.name}`, req.user._id);
    io?.emit("asset:created", asset);
    res.status(201).json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/assets/:id/status — change status (tech only)
router.patch("/:id/status", auth, techOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ ok: false, error: "Not found" });
    const prev = asset.status;
    asset.status = status;
    await asset.save();
    const io = req.app.get("io");
    await logAction(io, asset._id, "status_changed", prev, status, note || "", req.user._id);
    io?.emit("asset:updated", asset.toObject());
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/assets/:id/flag — flag/unflag (tech only)
router.patch("/:id/flag", auth, techOnly, async (req, res) => {
  try {
    const { flagged, flagReason } = req.body;
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { flagged, flagReason: flagged ? (flagReason || "") : "" },
      { new: true }
    );
    const io = req.app.get("io");
    await logAction(io, asset._id, flagged ? "flagged" : "unflagged", "", flagReason || "", "", req.user._id);
    io?.emit("asset:updated", asset.toObject());
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/assets/:id/checkout — check out to a person (tech only)
router.patch("/:id/checkout", auth, techOnly, async (req, res) => {
  try {
    const { checkedOutTo, checkoutNote, expectedReturn } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ ok: false, error: "Not found" });
    asset.status        = "checked-out";
    asset.checkedOutTo  = checkedOutTo;
    asset.checkoutNote  = checkoutNote || "";
    asset.checkedOutAt  = new Date();
    asset.expectedReturn = expectedReturn ? new Date(expectedReturn) : null;
    await asset.save();
    const io = req.app.get("io");
    await logAction(io, asset._id, "checked_out", "", checkedOutTo, checkoutNote || "", req.user._id);
    io?.emit("asset:updated", asset.toObject());
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/assets/:id/checkin — return a checked-out asset (tech only)
router.patch("/:id/checkin", auth, techOnly, async (req, res) => {
  try {
    const { note } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ ok: false, error: "Not found" });
    const from = asset.checkedOutTo;
    asset.status        = "available";
    asset.checkedOutTo  = "";
    asset.checkoutNote  = "";
    asset.checkedOutAt  = null;
    asset.expectedReturn = null;
    await asset.save();
    const io = req.app.get("io");
    await logAction(io, asset._id, "checked_in", from, "available", note || "", req.user._id);
    io?.emit("asset:updated", asset.toObject());
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PATCH /api/assets/:id — general edit (tech only)
router.patch("/:id", auth, techOnly, async (req, res) => {
  try {
    const allowed = ["label","type","location","serialNo","specs","notes","condition"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const asset = await Asset.findByIdAndUpdate(req.params.id, updates, { new: true });
    const io = req.app.get("io");
    await logAction(io, asset._id, "specs_updated", "", "", JSON.stringify(updates), req.user._id);
    io?.emit("asset:updated", asset.toObject());
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /api/assets/:id — retire (tech only)
router.delete("/:id", auth, techOnly, async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, { status: "retired" }, { new: true });
    const io = req.app.get("io");
    await logAction(io, asset._id, "status_changed", asset.status, "retired", "Asset retired", req.user._id);
    io?.emit("asset:updated", asset.toObject());
    res.json({ ok: true, asset });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
