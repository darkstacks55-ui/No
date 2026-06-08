const express = require("express");
const axios = require("axios");
const app = express();

app.get("/", (req, res) => {
  res.send("API 4K running 🚀");
});

/**
 * Route 4K (simple proxy + structure ready AI)
 * url = image input
 */
app.get("/4k", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        error: "No image URL provided"
      });
    }

    // 👉 ICI tu peux brancher une vraie IA plus tard
    // Pour l’instant on renvoie l’image (base propre fonctionnelle)

    return res.json({
      url: url
    });

  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      message: e.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API 4K running on " + PORT));
