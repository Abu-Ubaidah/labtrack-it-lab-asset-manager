const mongoose = require("mongoose");

// Immutable history entry — never updated, only created
const logSchema = new mongoose.Schema({
  asset:      { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
  action:     {
    type: String,
    required: true,
    enum: [
      "created", "status_changed", "condition_changed",
      "checked_out", "checked_in",
      "flagged", "unflagged",
      "repaired", "note_added", "specs_updated",
    ],
  },
  from:       { type: String, default: "" },   // previous value
  to:         { type: String, default: "" },   // new value
  note:       { type: String, default: "" },   // free-text detail
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);
