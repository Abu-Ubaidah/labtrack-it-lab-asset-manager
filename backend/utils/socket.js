const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = function initSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(id).select("-password");
      if (!user) return next(new Error("Not found"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join("labtrack"); // single shared room — everyone sees all updates
    socket.on("disconnect", () => {});
  });
};
