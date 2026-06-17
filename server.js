const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// page de test (ping)
app.get("/", (req, res) => {
  res.send("🟢 Bot is alive");
});

// endpoint uptime (utile pour uptime services)
app.get("/ping", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});

// démarre le serveur web
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
