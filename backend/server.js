require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const mongoose   = require("mongoose");
const initSocket = require("./utils/socket");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.set("io", io);

app.use("/api/auth",   require("./routes/auth"));
app.use("/api/assets", require("./routes/assets"));
app.use("/api/logs",   require("./routes/logs"));
app.get("/api/health", (_, res) => res.json({ ok: true, mongo: mongoose.connection.readyState }));

initSocket(io);

// ── Seed demo data ────────────────────────────────────────────────────────────
async function seed() {
  const User  = require("./models/User");
  const Asset = require("./models/Asset");

  // Create accounts
  let tech = await User.findOne({ username: "tech" });
  if (!tech) {
    tech = await User.create({ name: "Abu Ubaidah", username: "tech", password: "tech1234", role: "technician" });
    await User.create({ name: "Lab Viewer", username: "viewer", password: "viewer1234", role: "viewer" });
    console.log("[seed] users created  →  tech / tech1234   viewer / viewer1234");
  }

  if (await Asset.countDocuments() > 0) return;

  const assets = [
    // PCs — Lab A
    ...Array.from({ length: 20 }, (_, i) => ({
      label: `PC-A${String(i + 1).padStart(2, "0")}`, type: "pc",
      location: "Lab A", serialNo: `SN-A${1000 + i}`,
      specs: "Intel i5-10th Gen, 8GB RAM, 256GB SSD, Windows 11",
      status: i < 14 ? "available" : i < 17 ? "in-use" : i === 17 ? "faulty" : "under-repair",
      condition: i === 17 ? "poor" : "good",
      flagged: i === 17,
      flagReason: i === 17 ? "Screen flickering, keyboard unresponsive" : "",
      addedBy: tech._id,
    })),
    // PCs — Lab B
    ...Array.from({ length: 15 }, (_, i) => ({
      label: `PC-B${String(i + 1).padStart(2, "0")}`, type: "pc",
      location: "Lab B", serialNo: `SN-B${2000 + i}`,
      specs: "Intel i3-9th Gen, 4GB RAM, 128GB SSD, Windows 10",
      status: i < 10 ? "available" : i < 13 ? "in-use" : "faulty",
      condition: i >= 13 ? "fair" : "good",
      flagged: i >= 13,
      flagReason: i >= 13 ? "Slow boot, suspected HDD failure" : "",
      addedBy: tech._id,
    })),
    // Printers
    { label: "Printer-A1", type: "printer", location: "Lab A", serialNo: "PR-001", specs: "HP LaserJet Pro M404dn", status: "available", condition: "good", addedBy: tech._id },
    { label: "Printer-B1", type: "printer", location: "Lab B",  serialNo: "PR-002", specs: "Canon LBP6030", status: "faulty", condition: "poor", flagged: true, flagReason: "Paper jam — roller replacement needed", addedBy: tech._id },
    // Projectors
    { label: "Projector-A", type: "projector", location: "Lab A", serialNo: "PJ-001", specs: "Epson EB-X41, HDMI+VGA", status: "available", condition: "good", addedBy: tech._id },
    { label: "Projector-Hall", type: "projector", location: "Main Hall", serialNo: "PJ-002", specs: "BenQ MX532, 3200 lumens", status: "under-repair", condition: "fair", addedBy: tech._id },
    // Network switches
    { label: "Switch-A-Core", type: "switch", location: "Lab A - Server Rack", serialNo: "SW-001", specs: "Cisco SG110-24 24-port", status: "available", condition: "good", addedBy: tech._id },
    { label: "Switch-B-Core", type: "switch", location: "Lab B - Server Rack", serialNo: "SW-002", specs: "TP-Link TL-SG1016 16-port", status: "available", condition: "good", addedBy: tech._id },
    // Peripherals
    { label: "USB-Hub-01", type: "peripheral", location: "Tech Office", serialNo: "", specs: "Anker 7-port USB 3.0 hub", status: "checked-out", checkedOutTo: "Dr. Memon", checkoutNote: "Borrowed for seminar", checkedOutAt: new Date(), addedBy: tech._id },
    { label: "HDMI-Cable-Set", type: "peripheral", location: "Tech Office", specs: "5x HDMI 2.0 cables 2m", status: "available", condition: "good", addedBy: tech._id },
    { label: "Extension-01", type: "peripheral", location: "Tech Office", specs: "8-outlet power strip 5m", status: "available", condition: "fair", addedBy: tech._id },
    { label: "Webcam-01", type: "peripheral", location: "Tech Office", specs: "Logitech C920 HD", status: "checked-out", checkedOutTo: "Prof. Siddiqui", checkoutNote: "Online lecture setup", checkedOutAt: new Date(), addedBy: tech._id },
  ];

  await Asset.insertMany(assets);
  console.log(`[seed] ${assets.length} assets seeded`);
}

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("[mongo] connected");
    await seed();
    server.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
  })
  .catch((e) => { console.error("[mongo] failed:", e.message); process.exit(1); });
