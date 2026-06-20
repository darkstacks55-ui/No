const express = require("express");
const lyricsFinder = require("lyrics-finder");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/lyrics", async (req, res) => {
  const song = req.query.song;
  
  if (!song) {
    return res.status(400).json({ error: "Veuillez fournir un paramètre 'song'." });
  }

  try {
    // Optimisation : On passe la recherche globale dans le deuxième argument (title) 
    // car lyrics-finder est plus tolérant si l'artiste est vide.
    const lyrics = await lyricsFinder("", song);
    
    if (!lyrics) {
      return res.status(404).json({ error: "Paroles introuvables pour cette chanson." });
    }
    
    // Structure de la réponse de ton API
    res.json({
      title: song,
      artist: "Recherche API",
      lyrics: lyrics,
      image: "https://i.imgur.com/4M7QYqH.jpg" // Ton image par défaut
    });

  } catch (error) {
    // Toujours afficher l'erreur dans la console pour le débogage
    console.error("Erreur Lyrics API:", error.message);
    res.status(500).json({ error: "Erreur interne lors de la recherche des paroles." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Ton API de paroles est en ligne sur le port ${PORT}`);
});
