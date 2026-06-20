const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/pinterest", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: "Le paramètre 'query' est manquant." });
  }

  // On force la recherche sur Pinterest
  const targetQuery = `${query} site:pinterest.com`; 
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  try {
    // STEP 1: Récupération du token VQD
    const html = await axios.get(
      `https://duckduckgo.com/?q=${encodeURIComponent(targetQuery)}&iax=images&ia=images`,
      { headers: { "User-Agent": userAgent } }
    );

    const match = html.data.match(/vqd='(.*?)'/);
    if (!match) {
      return res.status(500).json({ error: "Impossible de récupérer le token VQD." });
    }

    const vqd = match[1];

    // STEP 2: Appel à l'API de DuckDuckGo
    const img = await axios.get(
      `https://duckduckgo.com/i.js?l=fr-fr&o=json&q=${encodeURIComponent(targetQuery)}&vqd=${vqd}&p=1`,
      {
        headers: {
          "User-Agent": userAgent,
          "Referer": "https://duckduckgo.com/"
        }
      }
    );

    // Extraction des images
    const images = img.data.results ? img.data.results.map(i => i.image) : [];

    res.json({
      query,
      count: images.length,
      data: images.slice(0, 30)
    });

  } catch (e) {
    res.status(500).json({
      error: "Erreur lors de la récupération des données",
      message: e.message
    });
  }
});
