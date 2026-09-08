const mongoose = require("mongoose");

// One entry per physical asset: PC, printer, projector, switch, peripheral, etc.
const assetSchema = new mongoose.Schema({
  // Identity
  label:       { type: String, required: true, trim: true }, // e.g. "PC-14", "Printer-A"
  type:        { type: String, required: true, enum: ["pc", "printer", "projector", "switch", "peripheral", "other"] },
  location:    { type: String, required: true, trim: true }, // e.g. "Lab A - Row 2", "Server Room"
  serialNo:    { type: String, default: "", trim: true },
  specs:       { type: String, default: "", trim: true },    // free-text: "i5-10th, 8GB RAM, 256 SSD"

  // Status
  status: {
    type: String,
    enum: ["available", "in-use", "faulty", "under-repair", "retired", "checked-out"],
    default: "available",
  },
  condition:   { type: String, enum: ["good", "fair", "poor"], default: "good" },

  // Checkout (for peripherals / portables)
  checkedOutTo: { type: String, default: "" },              // name of borrower
  checkoutNote: { type: String, default: "" },
  checkedOutAt: { type: Date },
  expectedReturn: { type: Date },

  // Notes
  notes:       { type: String, default: "" },
  flagged:     { type: Boolean, default: false },           // needs attention
  flagReason:  { type: String, default: "" },

  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);
