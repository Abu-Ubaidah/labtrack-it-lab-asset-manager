const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer "))
    return res.status(401).json({ ok: false, error: "No token" });
  try {
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(401).json({ ok: false, error: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ ok: false, error: "Invalid token" });
  }
};

module.exports.techOnly = function (req, res, next) {
  if (req.user?.role !== "technician")
    return res.status(403).json({ ok: false, error: "Technician access required" });
  next();
};
