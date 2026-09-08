const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const auth    = require("../middleware/auth");

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, error: "Username and password required" });

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password, user.password)))
      return res.status(401).json({ ok: false, error: "Invalid credentials" });

    res.json({ ok: true, token: sign(user._id), user: user.toSafe() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/auth/me
router.get("/me", auth, (req, res) => res.json({ ok: true, user: req.user.toSafe() }));

module.exports = router;
