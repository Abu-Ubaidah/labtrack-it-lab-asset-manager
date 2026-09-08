const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["technician", "viewer"], default: "viewer" },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = (candidate, hash) => bcrypt.compare(candidate, hash);

userSchema.methods.toSafe = function () {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model("User", userSchema);
